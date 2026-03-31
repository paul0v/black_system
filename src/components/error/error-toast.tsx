'use client'

/**
 * Componente para exibir notificações de erro
 */

import React, { useEffect, useState } from 'react'

export interface Toast {
  id: string
  type: 'error' | 'success' | 'info' | 'warning'
  message: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => string
  removeToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (toast: Omit<Toast, 'id'>): string => {
    const id = Math.random().toString(36).substring(7)
    const newToast: Toast = { ...toast, id }
    
    setToasts(prev => [...prev, newToast])

    // Auto-remover após duração
    const duration = toast.duration ?? (toast.type === 'error' ? 5000 : 3000)
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration)
    }

    return id
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

/**
 * Hook para usar o contexto de toast
 */
export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error('useToast deve ser usado dentro de ToastProvider')
  }

  return {
    toast: (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') =>
      context.addToast({ type, message }),
    success: (message: string) => context.addToast({ type: 'success', message }),
    error: (message: string) => context.addToast({ type: 'error', message }),
    warning: (message: string) => context.addToast({ type: 'warning', message }),
    info: (message: string) => context.addToast({ type: 'info', message }),
  }
}

/**
 * Componente container de toasts
 */
function ToastContainer({
  toasts,
  removeToast,
}: {
  toasts: Toast[]
  removeToast: (id: string) => void
}) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  )
}

/**
 * Item individual de toast
 */
function ToastItem({
  toast,
  onClose,
}: {
  toast: Toast
  onClose: () => void
}) {
  const [isExiting, setIsExiting] = useState(false)

  const bgColor = {
    error: 'bg-red-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  }[toast.type]

  const icon = {
    error: '❌',
    success: '✅',
    warning: '⚠️',
    info: 'ℹ️',
  }[toast.type]

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(onClose, 300)
  }

  return (
    <div
      className={`transform transition-all duration-300 ${
        isExiting
          ? 'opacity-0 translate-x-full'
          : 'opacity-100 translate-x-0'
      }`}
    >
      <div className={`${bgColor} text-white rounded-lg shadow-lg p-4 flex items-start gap-3`}>
        <span className="text-xl flex-shrink-0">{icon}</span>
        <div className="flex-1">
          <p className="text-sm font-medium">{toast.message}</p>
          {toast.action && (
            <button
              onClick={() => {
                toast.action!.onClick()
                handleClose()
              }}
              className="text-xs mt-2 underline hover:no-underline font-semibold"
            >
              {toast.action.label}
            </button>
          )}
        </div>
        <button
          onClick={handleClose}
          className="text-white hover:opacity-75 flex-shrink-0"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

/**
 * Componente para exibir erros de formulário
 */
export function FormError({ 
  message, 
  className = '' 
}: { 
  message?: string
  className?: string
}) {
  if (!message) return null

  return (
    <div className={`bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded ${className}`}>
      <p className="text-sm font-medium">❌ {message}</p>
    </div>
  )
}

/**
 * Componente para exibir erros de campo
 */
export function FieldError({ 
  error, 
  className = '' 
}: { 
  error?: string
  className?: string
}) {
  if (!error) return null

  return (
    <p className={`mt-1 text-sm text-red-600 ${className}`}>
      {error}
    </p>
  )
}

/**
 * Componente para exibir múltiplos erros de formulário
 */
export function FormErrors({
  errors,
  className = '',
}: {
  errors?: Record<string, string[]>
  className?: string
}) {
  if (!errors || Object.keys(errors).length === 0) return null

  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      <h3 className="text-sm font-semibold text-red-700 mb-2">
        ❌ Erros de validação:
      </h3>
      <ul className="space-y-2">
        {Object.entries(errors).map(([field, messages]) => (
          <li key={field} className="text-sm text-red-600">
            <strong>{field}:</strong>
            <ul className="ml-4 mt-1 list-disc">
              {messages.map((msg, idx) => (
                <li key={idx}>{msg}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  )
}
