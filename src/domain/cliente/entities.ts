export interface Cliente {
  id: string
  nome: string
  cpf?: string
  telefone?: string
  email?: string
  endereco?: string
  criado_em: string
}

export interface NovoCliente {
  nome: string
  cpf?: string
  telefone?: string
  email?: string
  endereco?: string
}
