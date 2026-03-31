import { z } from 'zod'

/**
 * Schema de validação para login
 */
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

export type LoginInputSchema = z.infer<typeof loginSchema>

/**
 * Schema de validação para signup
 */
export const signupSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .regex(
      /[A-Z]/,
      'Senha deve conter pelo menos uma letra maiúscula'
    )
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número'),
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  confirmPassword: z.string(),
  perfil: z.enum(['admin', 'tecnico', 'atendente']),
})
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não correspondem',
    path: ['confirmPassword'],
  })

export type SignupInputSchema = z.infer<typeof signupSchema>
