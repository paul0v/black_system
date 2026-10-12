'use server'

import { FirestoreOSRepository } from '@/infrastructure/firestore/os-repository'
import { FirestoreClienteRepository } from '@/infrastructure/firestore/cliente-repository'
import {
  listarOSRecentesUseCase,
  buscarOSPorIdUseCase,
  listarItensPorOSUseCase,
  listarOSPorClienteUseCase,
  buscarEstatisticasOSUseCase,
} from '@/application/os/consultar-os'
import { listarClientesUseCase, buscarClientePorIdUseCase, buscarClientesPorNomeUseCase } from '@/application/cliente/gerenciar-cliente'
import { checarAutenticado } from '@/lib/auth/session'

const osRepo = new FirestoreOSRepository()
const clienteRepo = new FirestoreClienteRepository()

export async function buscarTodasOS(limite: number = 300) {
  try {
    const bloqueio = await checarAutenticado()
    if (bloqueio) return []

    return await listarOSRecentesUseCase(osRepo, limite)
  } catch (err) {
    console.error('Erro ao buscar OS:', err)
    return []
  }
}

export async function buscarEstatisticasOS() {
  try {
    const bloqueio = await checarAutenticado()
    if (bloqueio) return { totalOS: 0, osAberta: 0, osEmReparo: 0, osConcluida: 0, osAprovadas: 0, totalClientes: 0 }

    return await buscarEstatisticasOSUseCase(osRepo)
  } catch (err) {
    console.error('Erro ao buscar estatísticas de OS:', err)
    return { totalOS: 0, osAberta: 0, osEmReparo: 0, osConcluida: 0, osAprovadas: 0, totalClientes: 0 }
  }
}

export async function buscarOSPorId(id: string) {
  try {
    const bloqueio = await checarAutenticado()
    if (bloqueio) return null

    return await buscarOSPorIdUseCase(osRepo, id)
  } catch (err) {
    console.error('Erro ao buscar OS:', err)
    return null
  }
}

export async function buscarItensPorOS(osId: string) {
  try {
    const bloqueio = await checarAutenticado()
    if (bloqueio) return []

    return await listarItensPorOSUseCase(osRepo, osId)
  } catch (err) {
    console.error('Erro ao buscar itens da OS:', err)
    return []
  }
}

export async function buscarOSPorCliente(clienteId: string) {
  try {
    const bloqueio = await checarAutenticado()
    if (bloqueio) return []

    return await listarOSPorClienteUseCase(osRepo, clienteId)
  } catch (err) {
    console.error('Erro ao buscar OS por cliente:', err)
    return []
  }
}

export async function buscarTodosClientes() {
  try {
    const bloqueio = await checarAutenticado()
    if (bloqueio) return []

    return await listarClientesUseCase(clienteRepo)
  } catch (err) {
    console.error('Erro ao buscar clientes:', err)
    return []
  }
}

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
