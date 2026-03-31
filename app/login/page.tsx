import { redirect } from 'next/navigation'
import { getSession } from '@/modules/auth/actions'
import { LoginForm } from '@/components/auth/login-form'

export const metadata = {
  title: 'Login - Sistema de Assistência Técnica',
  description: 'Acesse sua conta',
}

export default async function LoginPage() {
  const session = await getSession()

  if (session) {
    redirect('/os')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black flex items-center justify-center px-4 relative overflow-hidden">
      {/* Efeito de fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 space-y-8 border border-orange-600/20">
          {/* Header */}
          <div className="space-y-2 text-center">
            <div className="text-5xl mb-4">⚙️</div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-400">
              Black Tech
            </h1>
            <p className="text-gray-400 text-sm mt-2">Sistema de Gestão de Assistência Técnica</p>
          </div>

          {/* Form */}
          <LoginForm />

          {/* Footer */}
          <div className="text-center text-sm text-gray-400">
            Não tem conta?{' '}
            <a href="/signup" className="text-orange-500 hover:text-orange-400 font-semibold transition-colors">
              Cadastre-se aqui
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
