// Tipos de dados para o módulo de Ordens de Serviço

export enum OSStatus {
  ABERTA = "aberta",
  EM_DIAGNOSTICO = "em_diagnostico",
  AGUARDANDO_APROVACAO = "aguardando_aprovacao",
  EM_REPARO = "em_reparo",
  CONCLUIDA = "concluida",
  ENTREGUE = "entregue",
  CANCELADA = "cancelada",
}

export enum EquipmentType {
  CELULAR = "celular",
  NOTEBOOK = "notebook",
  TABLET = "tablet",
  CONSOLE = "console",
  OUTRO = "outro",
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  senha_hash: string;
  perfil: "admin" | "tecnico" | "atendente";
  ativo: boolean;
  criado_em: Date;
}

export interface Cliente {
  id: string;
  nome: string;
  cpf?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  criado_em: Date;
}

export interface Equipamento {
  id: string;
  os_id: string;
  tipo: EquipmentType;
  marca: string;
  modelo: string;
  imei_serial: string;
  condicao_entrada: string;
  acessorios_entregues: string;
  fotos_url: string[];
}

export interface OrdemServico {
  id: string;
  cliente_id: string;
  tecnico_id?: string;
  atendente_id?: string;
  numero: string;
  status: OSStatus;
  defeito_relatado: string;
  diagnostico?: string;
  valor_orcamento?: number;
  orcamento_aprovado: boolean;
  prazo_estimado?: Date;
  data_entrada: Date;
  data_saida?: Date;
  dias_garantia: number;
  equipamento?: Equipamento;
  cliente?: Cliente;
  tecnico?: Usuario;
  atendente?: Usuario;
}

export interface Produto {
  id: string;
  nome: string;
  sku: string;
  tipo: "peca" | "acessorio" | "aparelho_venda";
  categoria: string;
  preco_custo: number;
  preco_venda: number;
  quantidade: number;
  estoque_minimo: number;
  alerta_ativo: boolean;
  ativo: boolean;
}

export interface ItemOS {
  id: string;
  os_id: string;
  produto_id: string;
  quantidade: number;
  preco_unitario: number;
  descricao?: string;
  produto?: Produto;
}

export interface Venda {
  id: string;
  cliente_id?: string;
  vendedor_id: string;
  numero: string;
  tipo: "acessorio" | "aparelho_semi_novo" | "aparelho_lacrado";
  total: number;
  forma_pagamento: string;
  data: Date;
  cliente?: Cliente;
  vendedor?: Usuario;
  itens?: ItemVenda[];
}

export interface ItemVenda {
  id: string;
  venda_id: string;
  produto_id: string;
  quantidade: number;
  preco_unitario: number;
  produto?: Produto;
}

export interface Documento {
  id: string;
  os_id?: string;
  venda_id?: string;
  tipo: "via_cliente" | "termo_garantia" | "recibo_venda";
  url_pdf: string;
  impresso: boolean;
  gerado_em: Date;
}

export interface MovimentoEstoque {
  id: string;
  produto_id: string;
  os_id?: string;
  venda_id?: string;
  tipo: "entrada" | "saida_os" | "saida_venda" | "ajuste";
  quantidade: number;
  motivo: string;
  data: Date;
}
