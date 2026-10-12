'use server'

import { criarProdutoSchema, type CriarProdutoInput } from '@/modules/os/schema'
import { checarAutenticado, checarPerfil } from '@/lib/auth/session'
import { mensagemDeValidacao } from '@/lib/validacao'
import { FirestoreProdutoRepository } from '@/infrastructure/firestore/produto-repository'
import {
  criarProdutoUseCase,
  atualizarProdutoUseCase,
  atualizarQuantidadeProdutoUseCase,
  deletarProdutoUseCase,
} from '@/application/estoque/gerenciar-produto'

const produtoRepo = new FirestoreProdutoRepository()

export async function atualizarQuantidadeProduto(id: string, novaQuantidade: number) {
  const bloqueio = await checarAutenticado()
  if (bloqueio) return bloqueio

  try {
    await atualizarQuantidadeProdutoUseCase(produtoRepo, id, novaQuantidade)
    return { success: true, message: 'Quantidade atualizada com sucesso' }
  } catch (err) {
    console.error('Erro ao atualizar quantidade:', err)
    return { success: false, error: 'Erro ao atualizar quantidade' }
  }
}

export async function criarProduto(input: CriarProdutoInput) {
  const bloqueio = await checarAutenticado()
  if (bloqueio) return bloqueio

  try {
    const validado = criarProdutoSchema.parse(input)
    const produto = await criarProdutoUseCase(produtoRepo, validado)
    return { success: true, message: 'Produto criado com sucesso', id: produto.id }
  } catch (err) {
    console.error('Erro ao criar produto:', err)
    return { success: false, error: mensagemDeValidacao(err) || 'Erro ao criar produto' }
  }
}

export async function atualizarProduto(id: string, dados: Partial<CriarProdutoInput>) {
  const bloqueio = await checarAutenticado()
  if (bloqueio) return bloqueio

  try {
    await atualizarProdutoUseCase(produtoRepo, id, dados)
    return { success: true, message: 'Produto atualizado com sucesso' }
  } catch (err) {
    console.error('Erro ao atualizar produto:', err)
    return { success: false, error: 'Erro ao atualizar produto' }
  }
}

export async function deletarProduto(id: string) {
  const bloqueio = await checarPerfil(['admin'])
  if (bloqueio) return bloqueio

  try {
    await deletarProdutoUseCase(produtoRepo, id)
    return { success: true, message: 'Produto removido com sucesso' }
  } catch (err) {
    console.error('Erro ao remover produto:', err)
    return { success: false, error: 'Erro ao remover produto' }
  }
}
