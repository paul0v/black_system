'use server'

import { checarAutenticado, checarPerfil } from '@/lib/auth/session'
import { logBusinessEvent } from '@/lib/errors'
import { mensagemDeValidacao } from '@/lib/validacao'
import { criarClienteSchema } from '@/modules/os/schema'
import type { CriarClienteInput } from '@/modules/os/schema'
import { FirestoreClienteRepository } from '@/infrastructure/firestore/cliente-repository'
import { criarClienteUseCase, atualizarClienteUseCase, deletarClienteUseCase } from '@/application/cliente/gerenciar-cliente'

const clienteRepo = new FirestoreClienteRepository()

export async function criarCliente(input: CriarClienteInput) {
  const bloqueio = await checarAutenticado()
  if (bloqueio) return bloqueio

  try {
    const validado = criarClienteSchema.parse(input)
    const cliente = await criarClienteUseCase(clienteRepo, validado)

    logBusinessEvent('Cliente Criado', 'cliente.actions', { clienteId: cliente.id, nome: validado.nome })

    return { success: true, message: 'Cliente criado com sucesso', id: cliente.id }
  } catch (err) {
    console.error('Erro ao criar cliente:', err)
    return { success: false, error: mensagemDeValidacao(err) || 'Erro ao criar cliente' }
  }
}

export async function atualizarCliente(id: string, updates: Partial<CriarClienteInput>) {
  const bloqueio = await checarAutenticado()
  if (bloqueio) return bloqueio

  try {
    await atualizarClienteUseCase(clienteRepo, id, updates)

    logBusinessEvent('Cliente Atualizado', 'cliente.actions', { clienteId: id, camposAtualizados: Object.keys(updates) })

    return { success: true, message: 'Cliente atualizado com sucesso' }
  } catch (err) {
    console.error('Erro ao atualizar cliente:', err)
    return { success: false, error: 'Erro ao atualizar cliente' }
  }
}

export async function deletarCliente(id: string) {
  const bloqueio = await checarPerfil(['admin'])
  if (bloqueio) return bloqueio

  try {
    await deletarClienteUseCase(clienteRepo, id)

    logBusinessEvent('Cliente Deletado', 'cliente.actions', { clienteId: id })

    return { success: true, message: 'Cliente deletado com sucesso' }
  } catch (err) {
    console.error('Erro ao deletar cliente:', err)
    return { success: false, error: 'Erro ao deletar cliente' }
  }
}
