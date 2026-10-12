'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login } from '@/modules/auth/actions'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await login({ email, password })

      if (!result.success) {
        setError(result.error || 'Erro ao fazer login')
        setLoading(false)
        return
      }

      // IMPORTANTE: Salvar em localStorage ANTES de qualquer coisa
      if (result.usuario && typeof window !== 'undefined') {
        const sessionData = {
          user_id: result.usuario.user_id || result.usuario.id,
          email: result.usuario.email,
          nome: result.usuario.nome,
          perfil: result.usuario.perfil,
        }
        
        const sessionStr = JSON.stringify(sessionData)
        
        // Salvar em localStorage com debug
        try {
          localStorage.setItem('user_session', sessionStr)
          console.log('[LoginForm] ✓ Saved to localStorage:', sessionData)
          console.log('[LoginForm] ✓ localStorage.user_session =', localStorage.getItem('user_session'))
        } catch (e) {
          console.error('[LoginForm] ✗ Failed to save to localStorage:', e)
        }

        // Também salvar em sessionStorage
        try {
          sessionStorage.setItem('user_session', sessionStr)
          console.log('[LoginForm] ✓ Saved to sessionStorage')
        } catch (e) {
          console.error('[LoginForm] ✗ Failed to save to sessionStorage:', e)
        }

        // A sessão de verdade (cookie httpOnly assinado) já foi criada pela Server
        // Action `login()`. Isto aqui é só um cache local para a UI reagir rápido.
        console.log('[LoginForm] ℹ Redirecting to /os...')
        window.location.href = '/os'
      }
    } catch (err) {
      setError('Erro desconhecido ao fazer login')
      console.error('[LoginForm] Error:', err)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Email */}
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-semibold text-orange-400">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          required
          disabled={loading}
          className="w-full px-4 py-2.5 bg-gray-800/50 border border-orange-600/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all disabled:opacity-50"
        />
      </div>

      {/* Password */}
      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-semibold text-orange-400">
          Senha
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            disabled={loading}
            className="w-full px-4 py-2.5 bg-gray-800/50 border border-orange-600/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all disabled:opacity-50"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={loading}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-orange-400 disabled:opacity-50 transition-colors"
            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-500/15 border border-red-500/50 rounded-lg text-red-400 text-sm font-medium">
          ⚠️ {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-4 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 active:from-orange-700 active:to-orange-600 active:scale-[0.97] disabled:from-gray-600 disabled:to-gray-600 disabled:opacity-50 disabled:active:scale-100 text-white font-semibold rounded-lg transition-all duration-150 flex items-center justify-center gap-2 shadow-lg hover:shadow-orange-500/50"
      >
        {loading && <Loader2 size={18} className="animate-spin" />}
        {loading ? 'Entrando...' : 'Entrar na Conta'}
      </button>

    </form>
  )
}
