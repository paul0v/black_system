'use server'

import { checarAutenticado } from '@/lib/auth/session'
import { FirestoreVendaRepository } from '@/infrastructure/firestore/venda-repository'
import { registrarVendaUseCase } from '@/application/vendas/registrar-venda'
import { DomainError } from '@/domain/errors'

const vendaRepo = new FirestoreVendaRepository()

interface ItemVendaInput {
  produto_id: string
  quantidade: number
  preco_unitario: number
}

interface RegistrarVendaInput {
  itens: ItemVendaInput[]
  forma_pagamento: string
  total: number
}

export async function registrarVenda(input: RegistrarVendaInput) {
  const bloqueio = await checarAutenticado()
  if (bloqueio) return bloqueio

  try {
    const venda = await registrarVendaUseCase(vendaRepo, input)
    return { success: true, message: 'Venda finalizada com sucesso', id: venda.id, numero: venda.numero }
  } catch (err) {
    console.error('Erro ao registrar venda:', err)
    const mensagem = err instanceof DomainError ? err.message : err instanceof Error ? err.message : 'Erro ao finalizar venda'
    return { success: false, error: mensagem }
  }
}
