import crypto from 'crypto'
import { createClient } from '@/lib/firebase/server'
import type { ProdutoRepository } from '@/domain/estoque/repository'
import type { Produto, NovoProduto } from '@/domain/estoque/entities'

function generateId(): string {
  return crypto.randomUUID?.() || `id-${Date.now()}-${Math.random()}`
}

export class FirestoreProdutoRepository implements ProdutoRepository {
  async criar(dados: NovoProduto): Promise<Produto> {
    const db = await createClient()
    const novoProduto = {
      id: generateId(),
      nome: dados.nome,
      sku: dados.sku || '',
      tipo: dados.tipo,
      categoria: dados.categoria,
      preco_custo: dados.preco_custo,
      preco_venda: dados.preco_venda,
      estoque_minimo: dados.estoque_minimo,
      quantidade: 0,
      alerta_ativo: false,
      ativo: true,
      criado_em: new Date().toISOString(),
    }

    const { error } = await db.from('produto').insert([novoProduto])
    if (error) throw error

    return novoProduto
  }

  async atualizar(id: string, dados: Partial<NovoProduto>): Promise<void> {
    const db = await createClient()
    const { error } = await db.from('produto').update(dados).eq('id', id)
    if (error) throw error
  }

  async atualizarQuantidade(id: string, novaQuantidade: number): Promise<void> {
    const db = await createClient()
    const { error } = await db.from('produto').update({ quantidade: novaQuantidade }).eq('id', id)
    if (error) throw error
  }

  async desativar(id: string): Promise<void> {
    const db = await createClient()
    const { error } = await db.from('produto').update({ ativo: false }).eq('id', id)
    if (error) throw error
  }

  async buscarPorId(id: string): Promise<Produto | null> {
    const db = await createClient()
    const { data, error } = await db.from('produto').select().byId(id).single()
    if (error) throw error
    return data || null
  }

  async listarAtivos(): Promise<Produto[]> {
    const db = await createClient()
    const { data, error } = await db.from('produto').select().eq('ativo', true)
    if (error) throw error
    return (data || []).sort((a: any, b: any) => String(a.nome).localeCompare(String(b.nome)))
  }

  async listarDisponiveis(): Promise<Produto[]> {
    const db = await createClient()
    const { data, error } = await db.from('produto').select().eq('ativo', true)
    if (error) throw error
    return (data || [])
      .filter((p: any) => Number(p.quantidade) > 0)
      .sort((a: any, b: any) => String(a.nome).localeCompare(String(b.nome)))
  }
}
