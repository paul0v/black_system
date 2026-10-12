export interface ItemVenda {
  produto_id: string
  quantidade: number
  preco_unitario: number
}

export interface Venda {
  id: string
  numero: string
  forma_pagamento: string
  total: number
  data: string
}

export interface NovaVenda {
  itens: ItemVenda[]
  forma_pagamento: string
  total: number
}
