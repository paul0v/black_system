// Server Actions para Ordens de Serviço — camada fina: autenticação, validação
// de entrada (Zod) e tradução de erro de domínio pra {success, error}. Toda
// regra de negócio de verdade vive em src/application/os/*.
'use server'

import { checarAutenticado, checarPerfil } from '@/lib/auth/session'
import { criarOSSchema, criarItemOSSchema, criarClienteSchema } from '@/modules/os/schema'
import { mensagemDeValidacao } from '@/lib/validacao'
import { FirestoreOSRepository } from '@/infrastructure/firestore/os-repository'
import { FirestoreClienteRepository } from '@/infrastructure/firestore/cliente-repository'
import { criarOSUseCase } from '@/application/os/criar-os'
import { atualizarStatusOSUseCase, concluirOSUseCase } from '@/application/os/atualizar-status-os'
import { adicionarItemOSUseCase, removerItemOSUseCase } from '@/application/os/gerenciar-itens-os'
import { atualizarOSUseCase, deletarOSUseCase, aprovarOrcamentoUseCase } from '@/application/os/gerenciar-os'
import { criarClienteUseCase } from '@/application/cliente/gerenciar-cliente'
import { DomainError } from '@/domain/errors'

const osRepo = new FirestoreOSRepository()
const clienteRepo = new FirestoreClienteRepository()

function mensagemDeErro(err: unknown, fallback: string): string {
  if (err instanceof DomainError) return err.message
  return mensagemDeValidacao(err) || fallback
}

export async function criarOS(input: any) {
  const bloqueio = await checarAutenticado()
  if (bloqueio) return bloqueio

  try {
    const validado = criarOSSchema.parse(input)
    const os = await criarOSUseCase(osRepo, validado)
    return { success: true, message: `OS ${os.numero} criada com sucesso`, id: os.id, numero: os.numero }
  } catch (err) {
    console.error('Erro ao criar OS:', err)
    return { success: false, error: mensagemDeErro(err, 'Erro ao criar ordem de serviço') }
  }
}

export async function atualizarOS(osId: string, dados: Record<string, any>) {
  const bloqueio = await checarAutenticado()
  if (bloqueio) return bloqueio

  try {
    await atualizarOSUseCase(osRepo, osId, dados)
    return { success: true, message: 'OS atualizada com sucesso' }
  } catch (err) {
    console.error('Erro ao atualizar OS:', err)
    return { success: false, error: 'Erro ao atualizar OS' }
  }
}

export async function concluirOS(osId: string) {
  const bloqueio = await checarAutenticado()
  if (bloqueio) return bloqueio

  try {
    await concluirOSUseCase(osRepo, osId)
    return { success: true, message: 'OS finalizada com sucesso' }
  } catch (err) {
    console.error('Erro ao finalizar OS:', err)
    return { success: false, error: mensagemDeErro(err, 'Erro ao finalizar OS') }
  }
}

export async function atualizarStatusOS(osId: string, novoStatus: string) {
  const bloqueio = await checarAutenticado()
  if (bloqueio) return bloqueio

  try {
    await atualizarStatusOSUseCase(osRepo, osId, novoStatus)
    return { success: true, message: 'Status atualizado' }
  } catch (err) {
    console.error('Erro ao atualizar status:', err)
    return { success: false, error: mensagemDeErro(err, 'Erro ao atualizar') }
  }
}

export async function adicionarItemOS(input: any) {
  const bloqueio = await checarAutenticado()
  if (bloqueio) return bloqueio

  try {
    const validado = criarItemOSSchema.parse(input)
    const { item, valorOrcamento } = await adicionarItemOSUseCase(osRepo, validado)
    return { success: true, message: 'Item adicionado com sucesso', id: item.id, valor_orcamento: valorOrcamento }
  } catch (err) {
    console.error('Erro ao adicionar item na OS:', err)
    return { success: false, error: mensagemDeErro(err, 'Erro ao adicionar item') }
  }
}

export async function removerItemOS(itemId: string, osId: string) {
  const bloqueio = await checarAutenticado()
  if (bloqueio) return bloqueio

  try {
    const valorOrcamento = await removerItemOSUseCase(osRepo, itemId, osId)
    return { success: true, message: 'Item removido com sucesso', valor_orcamento: valorOrcamento }
  } catch (err) {
    console.error('Erro ao remover item da OS:', err)
    return { success: false, error: 'Erro ao remover item' }
  }
}

export async function deletarOS(osId: string) {
  const bloqueio = await checarPerfil(['admin'])
  if (bloqueio) return bloqueio

  try {
    await deletarOSUseCase(osRepo, osId)
    return { success: true, message: 'OS deletada' }
  } catch (err) {
    console.error('Erro ao deletar:', err)
    return { success: false, error: 'Erro ao deletar' }
  }
}

export async function aprovarOrcamento(osId: string, valor: number) {
  const bloqueio = await checarAutenticado()
  if (bloqueio) return bloqueio

  try {
    await aprovarOrcamentoUseCase(osRepo, osId, valor)
    return { success: true, message: 'Orçamento aprovado' }
  } catch (err) {
    console.error('Erro ao aprovar:', err)
    return { success: false, error: 'Erro ao aprovar' }
  }
}

export async function criarCliente(input: any) {
  const bloqueio = await checarAutenticado()
  if (bloqueio) return bloqueio

  try {
    const validado = criarClienteSchema.parse(input)
    const cliente = await criarClienteUseCase(clienteRepo, validado)
    return { success: true, message: 'Cliente criado', id: cliente.id }
  } catch (err) {
    console.error('Erro ao criar cliente:', err)
    return { success: false, error: mensagemDeErro(err, 'Erro ao criar cliente') }
  }
}
