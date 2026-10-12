'use server'

import crypto from 'crypto'
import { createClient } from '@/lib/firebase/server'
import { criarLancamentoSchema, type CriarLancamentoInput } from './schema'
import { checarAutenticado, checarPerfil } from '@/lib/auth/session'

function generateId(): string {
  return crypto.randomUUID?.() || `id-${Date.now()}-${Math.random()}`
}

export async function criarLancamento(input: CriarLancamentoInput) {
  try {
    const bloqueio = await checarAutenticado()
    if (bloqueio) return bloqueio

    const validado = criarLancamentoSchema.parse(input)
    const db = await createClient()

    const novoLancamento = {
      id: generateId(),
      tipo: validado.tipo,
      descricao: validado.descricao,
      valor: validado.valor,
      data: validado.data.toISOString(),
      criado_em: new Date().toISOString(),
    }

    const { error } = await db.from('lancamento_financeiro').insert([novoLancamento])
    if (error) throw error

    return { success: true, message: 'Lançamento adicionado', id: novoLancamento.id }
  } catch (err) {
    console.error('Erro ao criar lançamento:', err)
    return { success: false, error: 'Erro ao adicionar lançamento' }
  }
}

export async function deletarLancamento(id: string) {
  try {
    const bloqueio = await checarPerfil(['admin'])
    if (bloqueio) return bloqueio

    const db = await createClient()
    const { error } = await db.from('lancamento_financeiro').delete().eq('id', id)
    if (error) throw error
    return { success: true, message: 'Lançamento removido' }
  } catch (err) {
    console.error('Erro ao deletar lançamento:', err)
    return { success: false, error: 'Erro ao remover lançamento' }
  }
}
