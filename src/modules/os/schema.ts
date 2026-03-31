import { z } from "zod";

// Schemas de validação para Ordens de Serviço

export const criarOSSchema = z.object({
  cliente_id: z.string().uuid("Cliente inválido"),
  defeito_relatado: z.string().min(10, "Descreva o defeito com pelo menos 10 caracteres"),
  equipamento_tipo: z.enum(["celular", "notebook", "tablet", "console", "outro"]),
  equipamento_marca: z.string().min(1, "Marca do equipamento é obrigatória"),
  equipamento_modelo: z.string().min(1, "Modelo do equipamento é obrigatório"),
  equipamento_imei: z.string().min(1, "IMEI ou serial é obrigatório"),
  acessorios_entregues: z.string().optional(),
  prazo_estimado: z.coerce.date().optional(),
});

export const aproveOrcamentoSchema = z.object({
  os_id: z.string().uuid(),
  valor_orcamento: z.coerce.number().positive("Valor deve ser maior que zero"),
});

export const registrarDiagnosticoSchema = z.object({
  os_id: z.string().uuid(),
  diagnostico: z.string().min(10, "Diagnóstico deve ter pelo menos 10 caracteres"),
  valor_orcamento: z.coerce.number().positive().optional(),
});

export const registrarPagamentoSchema = z.object({
  os_id: z.string().uuid(),
  valor: z.coerce.number().positive("Valor deve ser maior que zero"),
  forma_pagamento: z.string().min(1, "Forma de pagamento é obrigatória"),
  data: z.coerce.date(),
});

export const criarClienteSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  cpf: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().email("Email inválido").optional(),
  endereco: z.string().optional(),
});

export const criarProdutoSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  sku: z.string().optional(),
  tipo: z.enum(["peca", "acessorio", "aparelho_venda"]),
  categoria: z.string().min(1, "Categoria é obrigatória"),
  preco_custo: z.coerce.number().positive("Preço deve ser maior que zero"),
  preco_venda: z.coerce.number().positive("Preço deve ser maior que zero"),
  estoque_minimo: z.coerce.number().min(0, "Estoque mínimo não pode ser negativo"),
});

export const registrarVendaSchema = z.object({
  cliente_id: z.string().uuid().optional(),
  itens: z.array(
    z.object({
      produto_id: z.string().uuid(),
      quantidade: z.coerce.number().positive(),
      preco_unitario: z.coerce.number().positive(),
    })
  ),
  forma_pagamento: z.string().min(1, "Forma de pagamento é obrigatória"),
  tipo: z.enum(["acessorio", "aparelho_semi_novo", "aparelho_lacrado"]),
});

export type CriarOSInput = z.infer<typeof criarOSSchema>;
export type AproveOrcamentoInput = z.infer<typeof aproveOrcamentoSchema>;
export type RegistrarDiagnosticoInput = z.infer<typeof registrarDiagnosticoSchema>;
export type RegistrarPagamentoInput = z.infer<typeof registrarPagamentoSchema>;
export type CriarClienteInput = z.infer<typeof criarClienteSchema>;
export type CriarProdutoInput = z.infer<typeof criarProdutoSchema>;
export type RegistrarVendaInput = z.infer<typeof registrarVendaSchema>;
