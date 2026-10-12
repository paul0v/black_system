import crypto from 'crypto'
import { createClient } from '@/lib/firebase/server'
import type { ClienteRepository } from '@/domain/cliente/repository'
import type { Cliente, NovoCliente } from '@/domain/cliente/entities'

// Ponto de código Unicode altíssimo, usado como "fim do universo" pra fazer
// busca por prefixo via range query (gte/lt) no Firestore — convenção padrão
// da documentação do Firestore para esse tipo de consulta.
const SENTINELA_FIM_PREFIXO = String.fromCharCode(0xf8ff)

function generateId(): string {
  return crypto.randomUUID?.() || `id-${Date.now()}-${Math.random()}`
}

function normalizar(texto: string): string {
  return texto.trim().toLowerCase()
}

export class FirestoreClienteRepository implements ClienteRepository {
  async criar(dados: NovoCliente): Promise<Cliente> {
    const db = await createClient()
    const novoCliente = {
      id: generateId(),
      nome: dados.nome,
      nome_busca: normalizar(dados.nome),
      cpf: dados.cpf || '',
      telefone: dados.telefone || '',
      email: dados.email || '',
      endereco: dados.endereco || '',
      criado_em: new Date().toISOString(),
    }

    const { error } = await db.from('cliente').insert([novoCliente])
    if (error) throw error

    return novoCliente
  }

  async atualizar(id: string, dados: Partial<NovoCliente>): Promise<void> {
    const db = await createClient()
    const atualizacao: Record<string, any> = { ...dados }
    if (dados.nome) {
      atualizacao.nome_busca = normalizar(dados.nome)
    }
    const { error } = await db.from('cliente').update(atualizacao).eq('id', id)
    if (error) throw error
  }

  async deletar(id: string): Promise<void> {
    const db = await createClient()
    const { error } = await db.from('cliente').delete().eq('id', id)
    if (error) throw error
  }

  async buscarPorId(id: string): Promise<Cliente | null> {
    const db = await createClient()
    const { data, error } = await db.from('cliente').select().byId(id).single()
    if (error) throw error
    return data || null
  }

  async listarPagina(limite: number): Promise<Cliente[]> {
    const db = await createClient()
    const { data, error } = await db.from('cliente').select().order('nome').limit(limite)
    if (error) throw error
    return data || []
  }

  async buscarPorNome(termo: string, limite: number): Promise<Cliente[]> {
    const termoNormalizado = normalizar(termo)
    if (!termoNormalizado) return this.listarPagina(limite)

    const db = await createClient()

    // Busca por prefixo em "nome_busca" (campo normalizado). Clientes criados
    // antes dessa busca existir não têm esse campo — para esses, cai no filtro
    // em memória sobre a página mais recente como rede de segurança.
    const { data, error } = await db
      .from('cliente')
      .select()
      .gte('nome_busca', termoNormalizado)
      .lt('nome_busca', termoNormalizado + SENTINELA_FIM_PREFIXO)
      .order('nome_busca')
      .limit(limite)
    if (error) throw error

    if (data && data.length > 0) return data

    const { data: recentes } = await db.from('cliente').select().order('nome').limit(500)
    return (recentes || [])
      .filter((c: any) => normalizar(c.nome).includes(termoNormalizado))
      .slice(0, limite)
  }
}
