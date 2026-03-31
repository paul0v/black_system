import type { Metadata } from 'next'
import './globals.css'
import { ErrorBoundary } from '@/components/error/error-boundary'
import { ToastProvider } from '@/components/error/error-toast'

export const metadata: Metadata = {
  title: 'Black Tech - Sistema de Assistência Técnica',
  description: 'Gestão completa de ordens de serviço, estoque e vendas',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-black">
        <ErrorBoundary context="RootLayout">
          <ToastProvider>
            {children}
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
