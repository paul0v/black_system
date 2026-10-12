export interface Produto {
  id: string
  nome: string
  sku: string
  tipo: 'peca' | 'acessorio' | 'aparelho_venda'
  categoria: string
  preco_custo: number
  preco_venda: number
  quantidade: number
  estoque_minimo: number
  alerta_ativo: boolean
  ativo: boolean
  criado_em: string
}

export interface NovoProduto {
  nome: string
  sku?: string
  tipo: 'peca' | 'acessorio' | 'aparelho_venda'
  categoria: string
  preco_custo: number
  preco_venda: number
  estoque_minimo: number
}
