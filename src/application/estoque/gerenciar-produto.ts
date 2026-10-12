import type { ProdutoRepository } from '@/domain/estoque/repository'
import type { Produto, NovoProduto } from '@/domain/estoque/entities'

export function criarProdutoUseCase(repo: ProdutoRepository, dados: NovoProduto): Promise<Produto> {
  return repo.criar(dados)
}

export function atualizarProdutoUseCase(repo: ProdutoRepository, id: string, dados: Partial<NovoProduto>): Promise<void> {
  return repo.atualizar(id, dados)
}

export function atualizarQuantidadeProdutoUseCase(repo: ProdutoRepository, id: string, novaQuantidade: number): Promise<void> {
  return repo.atualizarQuantidade(id, novaQuantidade)
}

export function deletarProdutoUseCase(repo: ProdutoRepository, id: string): Promise<void> {
  return repo.desativar(id)
}

export function listarProdutosUseCase(repo: ProdutoRepository): Promise<Produto[]> {
  return repo.listarAtivos()
}

export function listarProdutosDisponiveisUseCase(repo: ProdutoRepository): Promise<Produto[]> {
  return repo.listarDisponiveis()
}
