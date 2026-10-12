import type { Produto, NovoProduto } from './entities'

export interface ProdutoRepository {
  criar(dados: NovoProduto): Promise<Produto>
  atualizar(id: string, dados: Partial<NovoProduto>): Promise<void>
  atualizarQuantidade(id: string, novaQuantidade: number): Promise<void>
  desativar(id: string): Promise<void>
  buscarPorId(id: string): Promise<Produto | null>
  listarAtivos(): Promise<Produto[]>
  listarDisponiveis(): Promise<Produto[]>
}
