'use server'

import { FirestoreClienteRepository } from '@/infrastructure/firestore/cliente-repository'
import { listarClientesUseCase, buscarClientePorIdUseCase, buscarClientesPorNomeUseCase } from '@/application/cliente/gerenciar-cliente'
import { checarAutenticado } from '@/lib/auth/session'

const clienteRepo = new FirestoreClienteRepository()

/**
 * Busca clientes (limitado — ver buscarClientesPorNome para encontrar
 * qualquer cliente sem depender dessa lista)
 */
export async function buscarTodosClientes(limite?: number) {
  try {
    const bloqueio = await checarAutenticado()
    if (bloqueio) return []

    return await listarClientesUseCase(clienteRepo, limite)
  } catch (err) {
    console.error('Erro ao buscar clientes:', err)
    return []
  }
}

/**
 * Busca clientes pelo nome (prefixo, case-insensitive) — usada em campos de
 * busca/seleção pra achar qualquer cliente sem carregar a coleção inteira.
 */
export async function buscarClientesPorNome(termo: string) {
  try {
    const bloqueio = await checarAutenticado()
    if (bloqueio) return []

    return await buscarClientesPorNomeUseCase(clienteRepo, termo)
  } catch (err) {
    console.error('Erro ao buscar clientes por nome:', err)
    return []
  }
}

/**
 * Busca um cliente pelo ID
 */
export async function buscarClientePorId(id: string) {
  try {
    const bloqueio = await checarAutenticado()
    if (bloqueio) return null

    return await buscarClientePorIdUseCase(clienteRepo, id)
  } catch (err) {
    console.error('Erro ao buscar cliente:', err)
    return null
  }
}
