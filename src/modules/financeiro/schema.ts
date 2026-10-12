import { z } from 'zod'

export const criarLancamentoSchema = z.object({
  tipo: z.enum(['entrada', 'saida']),
  descricao: z.string().min(3, 'Descrição deve ter no mínimo 3 caracteres'),
  valor: z.coerce.number().positive('Valor deve ser maior que zero'),
  data: z.coerce.date().default(() => new Date()),
})

export type CriarLancamentoInput = z.input<typeof criarLancamentoSchema>
