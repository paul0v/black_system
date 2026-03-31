/**
 * Sistema de logging estruturado para a aplicação
 */

import { AppError } from './app-error'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal'

export interface LogEntry {
  level: LogLevel
  timestamp: string
  message: string
  context?: string
  userId?: string
  userEmail?: string
  error?: {
    type: string
    message: string
    stack?: string
  }
  details?: Record<string, any>
  duration?: number
  statusCode?: number
}

/**
 * Classe Logger para gerenciar logs
 */
class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private isProduction = process.env.NODE_ENV === 'production'

  /**
   * Formatar entrada de log
   */
  private formatLogEntry(entry: LogEntry): string {
    const { timestamp, level, message, context, error, details } = entry
    const contextStr = context ? ` [${context}]` : ''
    const levelStr = level.toUpperCase().padEnd(5)

    let log = `${timestamp} ${levelStr}${contextStr} ${message}`

    if (error) {
      log += `\n  Error: ${error.type} - ${error.message}`
      if (this.isDevelopment && error.stack) {
        log += `\n  Stack: ${error.stack}`
      }
    }

    if (details && Object.keys(details).length > 0) {
      log += `\n  Details: ${JSON.stringify(details, null, 2)}`
    }

    return log
  }

  /**
   * Logar no console (desenvolvimento)
   */
  private logToConsole(entry: LogEntry): void {
    const formatted = this.formatLogEntry(entry)
    const colors = {
      debug: '\x1b[36m', // cyan
      info: '\x1b[32m', // green
      warn: '\x1b[33m', // yellow
      error: '\x1b[31m', // red
      fatal: '\x1b[35m', // magenta
    }
    const reset = '\x1b[0m'

    if (this.isDevelopment) {
      console.log(`${colors[entry.level]}${formatted}${reset}`)
    } else {
      console.log(entry)
    }
  }

  /**
   * Logar para serviço externo (produção)
   */
  private async logToExternalService(entry: LogEntry): Promise<void> {
    if (!this.isProduction) return

    try {
      // Você pode integrar com serviços como:
      // - Sentry
      // - DataDog
      // - LogRocket
      // - CloudWatch
      // - Logtail
      // etc.

      // Exemplo com Sentry (se configurado):
      // if (window.Sentry) {
      //   window.Sentry.captureException(new Error(entry.message), {
      //     level: entry.level as SeverityLevel,
      //     tags: { context: entry.context },
      //     extra: entry.details,
      //   })
      // }

      // Por enquanto, apenas envia para console
      console.log(entry)
    } catch (err) {
      // Silenciar erros de logging para não quebrar a aplicação
      console.error('Erro ao enviar log para serviço externo:', err)
    }
  }

  /**
   * Criar entrada de log
   */
  private createEntry(
    level: LogLevel,
    message: string,
    context?: string,
    details?: Record<string, any>,
    error?: Error
  ): LogEntry {
    const entry: LogEntry = {
      level,
      timestamp: new Date().toISOString(),
      message,
      context,
      details,
    }

    if (error) {
      entry.error = {
        type: error.constructor.name,
        message: error.message,
        ...(this.isDevelopment && { stack: error.stack }),
      }
    }

    return entry
  }

  /**
   * Debug log
   */
  debug(message: string, context?: string, details?: Record<string, any>): void {
    const entry = this.createEntry('debug', message, context, details)
    this.logToConsole(entry)
  }

  /**
   * Info log
   */
  info(message: string, context?: string, details?: Record<string, any>): void {
    const entry = this.createEntry('info', message, context, details)
    this.logToConsole(entry)
  }

  /**
   * Warning log
   */
  warn(message: string, context?: string, details?: Record<string, any>): void {
    const entry = this.createEntry('warn', message, context, details)
    this.logToConsole(entry)
  }

  /**
   * Error log
   */
  error(message: string, error?: Error, context?: string, details?: Record<string, any>): void {
    const entry = this.createEntry('error', message, context, details, error)
    this.logToConsole(entry)
    this.logToExternalService(entry)
  }

  /**
   * Fatal log
   */
  fatal(message: string, error?: Error, context?: string, details?: Record<string, any>): void {
    const entry = this.createEntry('fatal', message, context, details, error)
    this.logToConsole(entry)
    this.logToExternalService(entry)
  }
}

// Instância global do logger
const logger = new Logger()

/**
 * Log de erro da aplicação
 */
export function logError(
  error: AppError | Error,
  details?: Record<string, any>,
  context?: string
): void {
  const message = error instanceof AppError 
    ? error.userMessage 
    : error.message

  const ctx = context || (error instanceof AppError ? error.context : undefined)
  const allDetails = {
    ...details,
    ...(error instanceof AppError && {
      type: error.type,
      statusCode: error.statusCode,
      appErrorDetails: error.details,
    }),
  }

  logger.error(message, error, ctx, allDetails)
}

/**
 * Log estruturado para request/response
 */
export function logRequest(
  method: string,
  path: string,
  statusCode: number,
  duration: number,
  details?: Record<string, any>
): void {
  const message = `${method} ${path} - ${statusCode}`
  logger.info(message, 'HTTP', {
    method,
    path,
    statusCode,
    duration: `${duration}ms`,
    ...details,
  })
}

/**
 * Log para operações de negócio
 */
export function logBusinessEvent(
  eventName: string,
  context: string,
  details?: Record<string, any>
): void {
  logger.info(eventName, context, details)
}

export default logger
