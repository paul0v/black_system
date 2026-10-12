export interface ConfiguracaoEmpresa {
  nome: string
  cnpj: string
  whatsapp: string
  endereco: string
  logoBase64: string
}

export interface ConfiguracaoWhatsApp {
  ativo: boolean
  apiUrl: string
  apiKey: string
  instanceName: string
}

export interface ChecklistItemConfig {
  chave: string
  label: string
}

export interface ConfiguracaoPreferencias {
  checklistEntrada: ChecklistItemConfig[]
  estoqueMinimoPadrao: number
  prazoRetiradaDias: number
  prazoAbandonoDias: number
}
