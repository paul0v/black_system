'use client'

/**
 * Error Boundary para capturar erros em componentes React
 */

import React, { ReactNode, useState, useEffect } from 'react'
import { AppError, ErrorType } from '@/lib/errors'
import { logError } from '@/lib/errors/logger'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error) => void
  context?: string
}

export function ErrorBoundary({
  children,
  fallback,
  onError,
  context,
}: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Erro não capturado:', event.error)
      setHasError(true)
      setError(event.error)

      if (onError) {
        onError(event.error)
      }

      logError(
        event.error instanceof AppError 
          ? event.error 
          : new AppError(
              ErrorType.INTERNAL_ERROR,
              'Erro ao renderizar componente',
              { originalMessage: event.error?.message },
              context
            )
      )
    }

    const handleRejection = (event: PromiseRejectionEvent) => {
      console.error('Promise rejection:', event.reason)
      setHasError(true)
      setError(
        event.reason instanceof Error
          ? event.reason
          : new Error(String(event.reason))
      )

      if (onError) {
        onError(event.reason)
      }

      logError(
        event.reason instanceof AppError
          ? event.reason
          : new AppError(
              ErrorType.INTERNAL_ERROR,
              'Erro durante operação async',
              { originalMessage: String(event.reason) },
              context
            )
      )
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleRejection)
    }
  }, [onError, context])

  if (hasError) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen bg-red-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              ⚠️ Algo deu errado
            </h1>
            <p className="text-gray-700 mb-4">
              Desculpe, ocorreu um erro ao
              renderizar esta página. Por favor, tente novamente.
            </p>
            {process.env.NODE_ENV === 'development' && error && (
              <details className="text-sm text-gray-500 mb-4">
                <summary className="cursor-pointer font-semibold">
                  Detalhes do erro (desenvolvimento)
                </summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto text-xs">
                  {error.message}
                  {error.stack && '\n\n' + error.stack}
                </pre>
              </details>
            )}
            <button
              onClick={() => {
                setHasError(false)
                setError(null)
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      )
    )
  }

  return children
}

/**
 * Hook para capturar erros em componentes funcionais
 */
export function useErrorHandler() {
  const [error, setError] = useState<Error | null>(null)

  const handleError = (error: Error | string) => {
    const err = typeof error === 'string' ? new Error(error) : error
    setError(err)
    logError(
      err instanceof AppError
        ? err
        : new AppError(
            ErrorType.INTERNAL_ERROR,
            typeof error === 'string' ? error : 'Erro ao executar ação',
            {}
          )
    )
  }

  const clearError = () => setError(null)

  return { error, handleError, clearError }
}

/**
 * Hook para capturar erros em async operations
 */
export function useAsyncError() {
  const { handleError } = useErrorHandler()

  const execute = async <T,>(fn: () => Promise<T>): Promise<T | null> => {
    try {
      return await fn()
    } catch (error) {
      handleError(error instanceof Error ? error : new Error(String(error)))
      return null
    }
  }

  return { execute, handleError }
}
