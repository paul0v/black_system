/**
 * Tipos e Classes para Tratamento de Erros Centralizado
 * Define a hierarquia de erros da aplicação
 */

/**
 * Tipos de erro da aplicação
 */
export enum ErrorType {
  // Validação
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  
  // Autenticação
  AUTH_ERROR = 'AUTH_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  NOT_AUTHENTICATED = 'NOT_AUTHENTICATED',
  
  // Recursos
  NOT_FOUND = 'NOT_FOUND',
  FORBIDDEN = 'FORBIDDEN',
  CONFLICT = 'CONFLICT',
  
  // Supabase/Banco de Dados
  DATABASE_ERROR = 'DATABASE_ERROR',
  CONSTRAINT_VIOLATION = 'CONSTRAINT_VIOLATION',
  UNIQUE_VIOLATION = 'UNIQUE_VIOLATION',
  
  // Integrações Externas
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',
  WHATSAPP_ERROR = 'WHATSAPP_ERROR',
  EMAIL_ERROR = 'EMAIL_ERROR',
  
  // Sistema
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  
  // Negócio
  BUSINESS_LOGIC_ERROR = 'BUSINESS_LOGIC_ERROR',
  INVALID_STATE = 'INVALID_STATE',
}

/**
 * Códigos de HTTP HTTP correspondentes aos tipos de erro
 */
const ERROR_TYPE_TO_HTTP_STATUS: Record<ErrorType, number> = {
  [ErrorType.VALIDATION_ERROR]: 400,
  [ErrorType.AUTH_ERROR]: 401,
  [ErrorType.UNAUTHORIZED]: 401,
  [ErrorType.NOT_AUTHENTICATED]: 401,
  [ErrorType.FORBIDDEN]: 403,
  [ErrorType.NOT_FOUND]: 404,
  [ErrorType.CONFLICT]: 409,
  [ErrorType.UNIQUE_VIOLATION]: 409,
  [ErrorType.CONSTRAINT_VIOLATION]: 409,
  [ErrorType.DATABASE_ERROR]: 500,
  [ErrorType.EXTERNAL_API_ERROR]: 502,
  [ErrorType.WHATSAPP_ERROR]: 502,
  [ErrorType.EMAIL_ERROR]: 502,
  [ErrorType.NETWORK_ERROR]: 503,
  [ErrorType.TIMEOUT_ERROR]: 504,
  [ErrorType.INTERNAL_ERROR]: 500,
  [ErrorType.BUSINESS_LOGIC_ERROR]: 400,
  [ErrorType.INVALID_STATE]: 400,
}

/**
 * Mensagens padrão por tipo de erro
 */
const ERROR_TYPE_TO_MESSAGE: Record<ErrorType, string> = {
  [ErrorType.VALIDATION_ERROR]: 'Dados inválidos. Por favor, verifique os campos.',
  [ErrorType.AUTH_ERROR]: 'Erro de autenticação. Tente fazer login novamente.',
  [ErrorType.UNAUTHORIZED]: 'Você não tem permissão para acessar este recurso.',
  [ErrorType.NOT_AUTHENTICATED]: 'Você precisa estar autenticado para acessar este recurso.',
  [ErrorType.FORBIDDEN]: 'Acesso negado.',
  [ErrorType.NOT_FOUND]: 'Recurso não encontrado.',
  [ErrorType.CONFLICT]: 'Recurso já existe.',
  [ErrorType.UNIQUE_VIOLATION]: 'Este valor já existe no sistema.',
  [ErrorType.CONSTRAINT_VIOLATION]: 'Erro de restrição de dados.',
  [ErrorType.DATABASE_ERROR]: 'Erro ao acessar o banco de dados.',
  [ErrorType.EXTERNAL_API_ERROR]: 'Erro ao comunicar com serviço externo.',
  [ErrorType.WHATSAPP_ERROR]: 'Erro ao enviar mensagem WhatsApp.',
  [ErrorType.EMAIL_ERROR]: 'Erro ao enviar email.',
  [ErrorType.NETWORK_ERROR]: 'Erro de conexão de rede.',
  [ErrorType.TIMEOUT_ERROR]: 'Requisição expirou. Tente novamente.',
  [ErrorType.INTERNAL_ERROR]: 'Erro interno do servidor.',
  [ErrorType.BUSINESS_LOGIC_ERROR]: 'Operação inválida no contexto atual.',
  [ErrorType.INVALID_STATE]: 'Estado inválido da aplicação.',
}

/**
 * Classe base para erros da aplicação
 */
export class AppError extends Error {
  readonly type: ErrorType
  readonly statusCode: number
  readonly userMessage: string
  readonly details?: Record<string, any>
  readonly timestamp: Date
  readonly context?: string

  constructor(
    type: ErrorType,
    userMessage?: string,
    details?: Record<string, any>,
    context?: string
  ) {
    const message = userMessage || ERROR_TYPE_TO_MESSAGE[type]
    super(message)
    
    this.type = type
    this.userMessage = message
    this.statusCode = ERROR_TYPE_TO_HTTP_STATUS[type]
    this.details = details
    this.timestamp = new Date()
    this.context = context
    
    // Manter a chain de prototipo
    Object.setPrototypeOf(this, AppError.prototype)
  }

  /**
   * Converter para objeto serializado
   */
  toJSON() {
    return {
      type: this.type,
      message: this.userMessage,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: this.timestamp,
      context: this.context,
    }
  }

  /**
   * Converter para resposta de API
   */
  toResponse() {
    return {
      success: false,
      error: this.userMessage,
      type: this.type,
      ...(process.env.NODE_ENV === 'development' && {
        details: this.details,
        stack: this.stack,
      }),
    }
  }
}

/**
 * Classe para erros de validação com detalhes dos campos
 */
export class ValidationError extends AppError {
  readonly fieldErrors: Record<string, string[]>

  constructor(
    fieldErrors: Record<string, string[]>,
    userMessage?: string,
    context?: string
  ) {
    const message = userMessage || 'Erro ao validar dados'
    super(ErrorType.VALIDATION_ERROR, message, { fieldErrors }, context)
    this.fieldErrors = fieldErrors
    Object.setPrototypeOf(this, ValidationError.prototype)
  }

  /**
   * Converter para objeto serializado com foco nos erros de campo
   */
  override toJSON() {
    return {
      ...super.toJSON(),
      fieldErrors: this.fieldErrors,
    }
  }

  /**
   * Converter para resposta de API
   */
  override toResponse() {
    return {
      success: false,
      error: this.userMessage,
      type: this.type,
      fieldErrors: this.fieldErrors,
    }
  }
}

/**
 * Classe para erros de banco de dados
 */
export class DatabaseError extends AppError {
  constructor(
    originalError: Error,
    context?: string,
    userMessage?: string
  ) {
    super(
      ErrorType.DATABASE_ERROR,
      userMessage || 'Erro ao acessar o banco de dados',
      { originalMessage: originalError.message },
      context
    )
    Object.setPrototypeOf(this, DatabaseError.prototype)
  }
}

/**
 * Classe para erros de API externa
 */
export class ExternalAPIError extends AppError {
  readonly statusCode: number
  readonly responseText?: string

  constructor(
    message: string,
    statusCode: number,
    responseText?: string,
    context?: string
  ) {
    super(
      ErrorType.EXTERNAL_API_ERROR,
      `Erro com serviço externo: ${message}`,
      { originalStatusCode: statusCode, responseText },
      context
    )
    this.statusCode = statusCode
    this.responseText = responseText
    Object.setPrototypeOf(this, ExternalAPIError.prototype)
  }
}

/**
 * Verificar se um erro é AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}

/**
 * Converter erro desconhecido para AppError
 */
export function toAppError(error: unknown, context?: string): AppError {
  if (isAppError(error)) {
    return error
  }

  if (error instanceof Error) {
    // Tentar identificar o tipo de erro
    if (error.message.includes('unique')) {
      return new AppError(
        ErrorType.UNIQUE_VIOLATION,
        'Este valor já existe no sistema',
        { originalMessage: error.message },
        context
      )
    }

    if (error.message.includes('constraint')) {
      return new AppError(
        ErrorType.CONSTRAINT_VIOLATION,
        'Erro de validação de dados',
        { originalMessage: error.message },
        context
      )
    }

    return new AppError(
      ErrorType.INTERNAL_ERROR,
      'Erro ao processar a requisição',
      { originalMessage: error.message },
      context
    )
  }

  return new AppError(
    ErrorType.INTERNAL_ERROR,
    'Erro desconhecido',
    { error: String(error) },
    context
  )
}
