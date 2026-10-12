import { SignupForm } from '@/components/auth/signup-form'

export const metadata = {
  title: 'Cadastro - Sistema de Assistência Técnica',
  description: 'Crie sua conta',
}

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 space-y-8 border border-orange-600/20">
          <div className="space-y-2 text-center">
            <img src="/logo-blackcell.png" alt="BlackCell" className="w-20 h-20 mx-auto rounded-2xl mb-4" />
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-400">
              BlackCell
            </h1>
            <p className="text-gray-400 text-sm mt-2">Crie sua conta - Assistência Técnica</p>
          </div>

          <SignupForm />

          <div className="text-center text-sm text-gray-400">
            Já tem conta?{' '}
            <a href="/login" className="text-orange-500 hover:text-orange-400 font-semibold transition-colors">
              Faça login aqui
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
