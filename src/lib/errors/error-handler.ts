/**
 * Handler centralizado para tratamento de erros
 * Padroniza tratamento em Actions, API Routes e Componentes
 */

import { ZodError } from 'zod'
import {
  AppError,
  ValidationError,
  DatabaseError,
  ExternalAPIError,
  ErrorType,
  toAppError,
  isAppError,
} from './app-error'
import { logError } from './logger'

export interface ErrorResponse {
  success: false
  error: string
  type?: ErrorType
  fieldErrors?: Record<string, string[]>
  statusCode?: number
}

export interface SuccessResponse<T = any> {
  success: true
  data?: T
  message?: string
  [key: string]: any  // Permite propriedades adicionais como 'id', 'numero', etc
}

export type ActionResponse<T = any> = SuccessResponse<T> | ErrorResponse

/**
 * Gerar resposta de sucesso
 */
export function successResponse<T>(
  data?: T,
  message?: string
): SuccessResponse<T> {
  return {
    success: true,
    ...(data !== undefined && { data }),
    ...(message && { message }),
  }
}

/**
 * Gerar resposta de erro
 */
export function errorResponse(error: AppError): ErrorResponse {
  return {
    success: false,
    error: error.userMessage,
    type: error.type,
    ...(error instanceof ValidationError && {
      fieldErrors: error.fieldErrors,
    }),
    statusCode: error.statusCode,
  }
}

/**
 * Handler para Zod validation errors
 */
export function handleZodError(error: ZodError, context?: string): ValidationError {
  const fieldErrors: Record<string, string[]> = {}

  error.issues.forEach((issue) => {
    const path = issue.path.join('.')
    if (!fieldErrors[path]) {
      fieldErrors[path] = []
    }
    fieldErrors[path].push(issue.message)
  })

  const appError = new ValidationError(fieldErrors, 'Erro ao validar dados', context)
  logError(appError, { zodIssues: error.issues })
  return appError
}

/**
 * Handler para database errors do Supabase
 */
export function handleDatabaseError(
  error: any,
  context?: string
): DatabaseError {
  let userMessage = 'Erro ao acessar o banco de dados'

  // Identificar tipos específicos de erro
  if (error.code === '23505') {
    userMessage = 'Este valor já existe no sistema'
  } else if (error.code === '23503') {
    userMessage = 'Recurso relacionado não encontrado'
  } else if (error.code === '23502') {
    userMessage = 'Campo obrigatório não preenchido'
  }

  const appError = new DatabaseError(error, context, userMessage)
  logError(appError, { supabaseCode: error.code })
  return appError
}

/**
 * Handler para erros de API externa
 */
export function handleExternalAPIError(
  error: any,
  statusCode: number,
  apiName: string,
  context?: string
): ExternalAPIError {
  const responseText = error instanceof Response ? error.statusText : String(error)
  const appError = new ExternalAPIError(
    `Erro do ${apiName}`,
    statusCode,
    responseText,
    context
  )
  logError(appError, { apiName, originalError: error })
  return appError
}

/**
 * Wrapper para Server Actions com tratamento automático de erro
 */
export async function handleServerAction<T>(
  fn: () => Promise<T>,
  context: string
): Promise<ActionResponse<T>> {
  try {
    const data = await fn()
    return successResponse(data)
  } catch (error) {
    if (error instanceof ZodError) {
      const appError = handleZodError(error, context)
      return errorResponse(appError)
    }

    if (isAppError(error)) {
      logError(error)
      return errorResponse(error)
    }

    const appError = toAppError(error, context)
    logError(appError)
    return errorResponse(appError)
  }
}

/**
 * Handler genérico para qualquer erro
 */
export function handleError(
  error: unknown,
  context?: string,
  fallbackMessage?: string
): AppError {
  if (error instanceof ZodError) {
    return handleZodError(error, context)
  }

  if (isAppError(error)) {
    logError(error)
    return error
  }

  if (error instanceof Error) {
    // Verificar se é erro do Supabase
    if ('code' in error) {
      return handleDatabaseError(error, context)
    }

    const appError = toAppError(error, context)
    logError(appError)
    return appError
  }

  const appError = new AppError(
    ErrorType.INTERNAL_ERROR,
    fallbackMessage || 'Erro ao processar a requisição',
    { error: String(error) },
    context
  )
  logError(appError)
  return appError
}

/**
 * Handler para erros de requisição HTTP
 */
export async function handleHTTPError(
  response: Response,
  apiName: string,
  context?: string
): Promise<ExternalAPIError> {
  const responseText = await response.text()
  const error = new ExternalAPIError(
    `HTTP ${response.status}`,
    response.status,
    responseText,
    context
  )
  logError(error, { apiName, responseBody: responseText })
  return error
}

/**
 * Re-throw de erro com contexto adicional
 */
export function decorateError(
  error: Error,
  context: string,
  additionalDetails?: Record<string, any>
): AppError {
  if (isAppError(error)) {
    return error
  }

  const appError = toAppError(error, context)
  return appError
}
