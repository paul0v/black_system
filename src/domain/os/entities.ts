export interface Equipamento {
  id: string
  os_id: string
  tipo: string
  marca: string
  modelo: string
  imei_serial: string
  acessorios_entregues: string
  condicao_entrada: string
  fotos_url: string[]
  senha_tipo: 'nenhuma' | 'padrao' | 'pin' | 'senha'
  senha_valor: string
}

export interface NovoEquipamento {
  tipo: string
  marca: string
  modelo: string
  imei_serial: string
  acessorios_entregues: string
  condicao_entrada: string
  fotos_url: string[]
  senha_tipo: 'nenhuma' | 'padrao' | 'pin' | 'senha'
  senha_valor: string
}

export interface ItemOS {
  id: string
  os_id: string
  descricao: string
  quantidade: number
  preco_custo: number
  preco_unitario: number
  criado_em: string
}

export interface NovoItemOS {
  os_id: string
  descricao: string
  quantidade: number
  preco_custo: number
  preco_unitario: number
}

export interface OrdemServico {
  id: string
  cliente_id: string
  numero: string
  status: string
  defeito_relatado: string
  diagnostico?: string
  valor_orcamento?: number
  orcamento_aprovado: boolean
  data_entrada: string
  data_saida?: string
  criado_em: string
  equipamento?: Equipamento | null
  itens?: ItemOS[]
  cliente?: { id: string; nome: string; telefone?: string; email?: string } | null
}

export interface NovaOS {
  cliente_id: string
  defeito_relatado: string
  data_entrada: Date
  equipamento: NovoEquipamento
}
