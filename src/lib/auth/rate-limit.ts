// Limita tentativas de login por email, guardado no Firestore (via Admin SDK).
// Sem isso, nada impede força bruta/credential stuffing contra uma conta
// conhecida — a API do Firebase não é controlada por este projeto.
import { adminDb } from '@/lib/firebase/admin'

const COLECAO = 'login_rate_limit'
const MAX_TENTATIVAS = 5
const JANELA_MS = 15 * 60 * 1000 // 15 minutos
const BLOQUEIO_MS = 15 * 60 * 1000 // 15 minutos

function normalizarEmail(email: string): string {
  return email.trim().toLowerCase()
}

/** Verifica se o email está bloqueado por excesso de tentativas. */
export async function verificarBloqueio(email: string): Promise<{ bloqueado: boolean; minutosRestantes?: number }> {
  const doc = await adminDb().collection(COLECAO).doc(normalizarEmail(email)).get()
  if (!doc.exists) return { bloqueado: false }

  const dados = doc.data() as { bloqueadoAte?: number } | undefined
  if (dados?.bloqueadoAte && dados.bloqueadoAte > Date.now()) {
    return { bloqueado: true, minutosRestantes: Math.ceil((dados.bloqueadoAte - Date.now()) / 60000) }
  }
  return { bloqueado: false }
}

/** Registra uma tentativa de login que falhou; bloqueia o email após MAX_TENTATIVAS dentro da janela. */
export async function registrarTentativaFalha(email: string): Promise<void> {
  const ref = adminDb().collection(COLECAO).doc(normalizarEmail(email))
  const agora = Date.now()

  await adminDb().runTransaction(async (tx) => {
    const doc = await tx.get(ref)
    const dados = doc.exists ? (doc.data() as { tentativas: number; primeiraTentativa: number }) : null

    const dentroDaJanela = dados && agora - dados.primeiraTentativa < JANELA_MS
    const tentativas = dentroDaJanela ? dados.tentativas + 1 : 1
    const primeiraTentativa = dentroDaJanela ? dados.primeiraTentativa : agora

    tx.set(ref, {
      tentativas,
      primeiraTentativa,
      bloqueadoAte: tentativas >= MAX_TENTATIVAS ? agora + BLOQUEIO_MS : null,
    })
  })
}

/** Limpa o contador após um login bem-sucedido. */
export async function limparTentativas(email: string): Promise<void> {
  await adminDb().collection(COLECAO).doc(normalizarEmail(email)).delete()
}
