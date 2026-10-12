import { ZodError } from 'zod'

/**
 * Extrai uma mensagem de erro legível do primeiro problema de validação do Zod,
 * em vez de deixar o `.message` bruto do ZodError (um JSON com todos os issues)
 * vazar pro usuário, ou cair num fallback genérico tipo "Erro ao salvar".
 */
export function mensagemDeValidacao(err: unknown): string | null {
  if (err instanceof ZodError) {
    return err.issues[0]?.message || 'Dados inválidos'
  }
  return null
}
