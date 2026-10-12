import type { Metadata } from 'next'
import './globals.css'
import { ErrorBoundary } from '@/components/error/error-boundary'
import { ToastProvider } from '@/components/error/error-toast'

export const metadata: Metadata = {
  title: 'BlackCell - Sistema de Assistência Técnica',
  description: 'Gestão completa de ordens de serviço, estoque e vendas',
  icons: {
    icon: '/logo-blackcell.png',
    shortcut: '/logo-blackcell.png',
    apple: '/logo-blackcell.png',
  },
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
