'use server'

import { FirestoreProdutoRepository } from '@/infrastructure/firestore/produto-repository'
import { listarProdutosUseCase, listarProdutosDisponiveisUseCase } from '@/application/estoque/gerenciar-produto'
import { checarAutenticado } from '@/lib/auth/session'

const produtoRepo = new FirestoreProdutoRepository()

export async function buscarProdutos() {
  try {
    const bloqueio = await checarAutenticado()
    if (bloqueio) return []

    return await listarProdutosUseCase(produtoRepo)
  } catch (err) {
    console.error('Erro ao buscar produtos:', err)
    return []
  }
}

export async function buscarProdutosDisponiveis() {
  try {
    const bloqueio = await checarAutenticado()
    if (bloqueio) return []

    return await listarProdutosDisponiveisUseCase(produtoRepo)
  } catch (err) {
    console.error('Erro ao buscar produtos disponíveis:', err)
    return []
  }
}
