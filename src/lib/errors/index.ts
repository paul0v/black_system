/**
 * Exportações centralizadas do sistema de erros
 */

// Tipos e Classes
export {
  ErrorType,
  AppError,
  ValidationError,
  DatabaseError,
  ExternalAPIError,
  isAppError,
  toAppError,
} from './app-error'

// Handler de Erros
export {
  successResponse,
  errorResponse,
  handleZodError,
  handleDatabaseError,
  handleExternalAPIError,
  handleServerAction,
  handleError,
  handleHTTPError,
  decorateError,
  type ActionResponse,
  type ErrorResponse,
  type SuccessResponse,
} from './error-handler'

// Logger
export {
  logError,
  logRequest,
  logBusinessEvent,
  type LogLevel,
  type LogEntry,
} from './logger'
