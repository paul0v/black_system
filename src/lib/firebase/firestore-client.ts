// Adaptador estilo "query builder" (compatível com a API usada nas Server Actions)
// para acessar o Firestore através do Firebase Admin SDK.
import type { Query, WhereFilterOp } from 'firebase-admin/firestore'
import { adminAuth, adminDb } from './admin'

interface DbError {
  message: string
}

interface DbResult<T> {
  data: T | null
  error: DbError | null
}

function toDbError(err: unknown): DbError {
  return { message: err instanceof Error ? err.message : 'Erro desconhecido no banco de dados' }
}

export function avaliarFiltro(valor: any, op: WhereFilterOp, esperado: any): boolean {
  switch (op) {
    case '==':
      return valor === esperado
    case '!=':
      return valor !== esperado
    case '<':
      return valor < esperado
    case '<=':
      return valor <= esperado
    case '>':
      return valor > esperado
    case '>=':
      return valor >= esperado
    case 'in':
      return Array.isArray(esperado) && esperado.includes(valor)
    case 'not-in':
      return Array.isArray(esperado) && !esperado.includes(valor)
    case 'array-contains':
      return Array.isArray(valor) && valor.includes(esperado)
    default:
      return true
  }
}

class FirestoreQueryBuilder<T = any> {
  private collectionName: string
  private wheres: { field: string; op: WhereFilterOp; value: any }[] = []
  private orderField?: { column: string; ascending: boolean }
  private limitCount?: number
  private staticData?: any[]

  constructor(collectionName: string, staticData?: any[]) {
    this.collectionName = collectionName
    this.staticData = staticData
  }

  select(..._args: any[]) {
    return this
  }

  byId(id: string) {
    // Busca diretamente por ID de documento (não por campo 'id')
    this.wheres.push({ field: '__id__', op: '==', value: id })
    return this
  }

  eq(column: string, value: any) {
    this.wheres.push({ field: column, op: '==', value })
    return this
  }

  neq(column: string, value: any) {
    this.wheres.push({ field: column, op: '!=', value })
    return this
  }

  lt(column: string, value: any) {
    this.wheres.push({ field: column, op: '<', value })
    return this
  }

  gt(column: string, value: any) {
    this.wheres.push({ field: column, op: '>', value })
    return this
  }

  lte(column: string, value: any) {
    this.wheres.push({ field: column, op: '<=', value })
    return this
  }

  gte(column: string, value: any) {
    this.wheres.push({ field: column, op: '>=', value })
    return this
  }

  in(column: string, values: any[]) {
    this.wheres.push({ field: column, op: 'in', value: values })
    return this
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderField = { column, ascending: options?.ascending ?? true }
    return this
  }

  limit(count: number) {
    this.limitCount = count
    return this
  }

  private async fetchRows(): Promise<any[]> {
    if (this.staticData) return this.staticData

    // Tratar busca por ID de documento
    const idWhere = this.wheres.find(w => w.field === '__id__')
    if (idWhere) {
      let rows: any[]
      try {
        const doc = await adminDb().collection(this.collectionName).doc(idWhere.value).get()
        rows = doc.exists ? [{ id: doc.id, ...doc.data() }] : []
      } catch (err) {
        rows = []
      }

      // Qualquer outro .eq()/.neq()/etc combinado com .byId() é aplicado em memória
      // sobre o documento já carregado (Firestore não permite filtrar por campo
      // junto de uma busca direta por ID). Sem isso, esses filtros extras eram
      // silenciosamente ignorados.
      const outrosFiltros = this.wheres.filter(w => w.field !== '__id__')
      if (outrosFiltros.length) {
        rows = rows.filter((row) => outrosFiltros.every((w) => avaliarFiltro(row[w.field], w.op, w.value)))
      }

      return rows
    }

    let ref: Query = adminDb().collection(this.collectionName)
    for (const w of this.wheres) {
      ref = ref.where(w.field, w.op, w.value)
    }
    if (this.orderField) {
      ref = ref.orderBy(this.orderField.column, this.orderField.ascending ? 'asc' : 'desc')
    }
    if (this.limitCount) {
      ref = ref.limit(this.limitCount)
    }

    const snapshot = await ref.get()
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  }

  async single(): Promise<DbResult<T>> {
    try {
      const rows = await this.fetchRows()
      return { data: (rows[0] as T) ?? null, error: null }
    } catch (err) {
      return { data: null, error: toDbError(err) }
    }
  }

  async maybeSingle(): Promise<DbResult<T>> {
    return this.single()
  }

  /**
   * Conta documentos que batem com os filtros, usando a agregação nativa do
   * Firestore (`count()`), que custa 1 leitura independente de quantos
   * documentos existam — ao contrário de buscar tudo só para fazer `.length`.
   */
  async count(): Promise<DbResult<number>> {
    try {
      let ref: Query = adminDb().collection(this.collectionName)
      for (const w of this.wheres) {
        ref = ref.where(w.field, w.op, w.value)
      }
      const snapshot = await ref.count().get()
      return { data: snapshot.data().count, error: null }
    } catch (err) {
      return { data: null, error: toDbError(err) }
    }
  }

  async insert(rows: any[]): Promise<DbResult<T[]>> {
    try {
      const db = adminDb()
      const col = db.collection(this.collectionName)
      const batch = db.batch()
      const inserted: any[] = []

      for (const row of rows) {
        const docRef = row.id ? col.doc(row.id) : col.doc()
        // Mantém "id" como campo do documento para permitir buscas via .eq('id', ...)
        const data = { ...row, id: docRef.id }
        batch.set(docRef, data)
        inserted.push(data)
      }

      await batch.commit()
      return { data: inserted as T[], error: null }
    } catch (err) {
      return { data: null, error: toDbError(err) }
    }
  }

  update(values: Record<string, any>) {
    const collectionName = this.collectionName
    return {
      eq: async (column: string, value: any): Promise<DbResult<T[]>> => {
        try {
          const db = adminDb()
          const snapshot = await db.collection(collectionName).where(column, '==', value).get()
          const batch = db.batch()
          const updated: any[] = []

          snapshot.docs.forEach((doc) => {
            batch.update(doc.ref, values)
            updated.push({ id: doc.id, ...doc.data(), ...values })
          })

          await batch.commit()
          return { data: updated as T[], error: null }
        } catch (err) {
          return { data: null, error: toDbError(err) }
        }
      },
    }
  }

  delete() {
    const collectionName = this.collectionName
    return {
      eq: async (column: string, value: any): Promise<DbResult<null>> => {
        try {
          const db = adminDb()
          const snapshot = await db.collection(collectionName).where(column, '==', value).get()
          const batch = db.batch()
          snapshot.docs.forEach((doc) => batch.delete(doc.ref))
          await batch.commit()
          return { data: null, error: null }
        } catch (err) {
          return { data: null, error: toDbError(err) }
        }
      },
    }
  }

  then<TResult1 = DbResult<T[]>, TResult2 = never>(
    onFulfilled?: ((value: DbResult<T[]>) => TResult1 | PromiseLike<TResult1>) | null,
    onRejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this.fetchRows()
      .then((rows): DbResult<T[]> => ({ data: rows as T[], error: null }))
      .catch((err): DbResult<T[]> => ({ data: null, error: toDbError(err) }))
      .then(onFulfilled as any, onRejected as any)
  }
}

/**
 * Cliente compatível com o formato usado nas Server Actions (`.from(table)...`),
 * porém utilizando o Firestore (via Firebase Admin SDK) como backend real.
 */
export function createFirebaseClient() {
  return {
    from<T = any>(table: string) {
      return new FirestoreQueryBuilder<T>(table)
    },

    /**
     * Acesso direto ao Firestore (Admin SDK), para os poucos casos que o
     * encadeamento estilo Supabase do `.from()` genuinamente não cobre:
     * transações atômicas (`runTransaction`) e upserts atômicos via
     * `set(..., { merge: true })`. Mantém esse acesso centralizado aqui, em
     * vez de cada módulo importar `adminDb` direto de `@/lib/firebase/admin`
     * — assim, trocar de banco no futuro significa olhar só este arquivo.
     */
    raw: adminDb,

    auth: {
      async signUp({ email, password, options }: { email: string; password: string; options?: { data?: Record<string, any> } }) {
        try {
          const userRecord = await adminAuth().createUser({ email, password })
          const perfil = options?.data?.perfil || 'tecnico'
          const nome = options?.data?.nome || email

          const db = adminDb()
          await db.collection('usuarios').doc(userRecord.uid).set({
            id: userRecord.uid,
            user_id: userRecord.uid,
            nome,
            email,
            perfil,
            ativo: true,
            criado_em: new Date().toISOString(),
          })

          return {
            data: { user: { id: userRecord.uid, email }, session: null },
            error: null,
          }
        } catch (err: any) {
          return { data: null, error: { message: err.message || 'Erro ao criar usuário' } }
        }
      },

      async signInWithPassword({ email, password }: { email: string; password: string }) {
        const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
        if (!apiKey) {
          return { data: null, error: { message: 'NEXT_PUBLIC_FIREBASE_API_KEY não configurada' } }
        }

        try {
          const res = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password, returnSecureToken: true }),
            }
          )
          const json = await res.json()

          if (!res.ok) {
            return { data: null, error: { message: json.error?.message || 'Credenciais inválidas' } }
          }

          return {
            data: {
              user: { id: json.localId, email: json.email },
              session: {
                access_token: json.idToken,
                refresh_token: json.refreshToken,
                user: { id: json.localId, email: json.email },
              },
            },
            error: null,
          }
        } catch (err) {
          return { data: null, error: toDbError(err) }
        }
      },

      async getSession(): Promise<{ data: { session: { user: { id: string } } | null }, error: null }> {
        // Este método não é usado para autenticação neste app — a sessão real
        // (cookie httpOnly assinado) é tratada em src/lib/auth/session.ts.
        return { data: { session: null }, error: null }
      },

      async getUser(): Promise<{ data: { user: { id: string } | null } }> {
        return { data: { user: null } }
      },

      async signOut(): Promise<{ error: DbError | null }> {
        return { error: null }
      },
    },
  }
}
