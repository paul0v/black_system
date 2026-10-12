import type { ClienteRepository } from '@/domain/cliente/repository'
import type { Cliente, NovoCliente } from '@/domain/cliente/entities'

const LIMITE_PADRAO = 200

export function criarClienteUseCase(repo: ClienteRepository, dados: NovoCliente): Promise<Cliente> {
  return repo.criar(dados)
}

export function atualizarClienteUseCase(repo: ClienteRepository, id: string, dados: Partial<NovoCliente>): Promise<void> {
  return repo.atualizar(id, dados)
}

export function deletarClienteUseCase(repo: ClienteRepository, id: string): Promise<void> {
  return repo.deletar(id)
}

export function buscarClientePorIdUseCase(repo: ClienteRepository, id: string): Promise<Cliente | null> {
  return repo.buscarPorId(id)
}

/** Lista limitada e ordenada — nunca baixa a coleção inteira. */
export function listarClientesUseCase(repo: ClienteRepository, limite: number = LIMITE_PADRAO): Promise<Cliente[]> {
  return repo.listarPagina(limite)
}

/** Busca por nome (prefixo) — usada pra achar qualquer cliente sem depender da lista limitada. */
export function buscarClientesPorNomeUseCase(repo: ClienteRepository, termo: string, limite: number = 20): Promise<Cliente[]> {
  return repo.buscarPorNome(termo, limite)
}
