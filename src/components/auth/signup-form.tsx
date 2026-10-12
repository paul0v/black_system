'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signup } from '@/modules/auth/actions'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import type { UserProfile } from '@/modules/auth/types'

const PERFIL_AUTOCADASTRO: UserProfile = 'atendente'

export function SignupForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nome: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    // Validação básica
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não correspondem')
      return
    }

    if (formData.password.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres')
      return
    }

    setLoading(true)

    try {
      const result = await signup({
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        nome: formData.nome,
        perfil: PERFIL_AUTOCADASTRO,
      })

      if (!result.success) {
        setError(result.error || 'Erro ao criar conta')
        return
      }

      // Sucesso - redirecionar para os
      router.push('/os')
      router.refresh()
    } catch (err) {
      setError('Erro desconhecido ao criar conta')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Nome */}
      <div className="space-y-2">
        <label htmlFor="nome" className="block text-sm font-semibold text-orange-400">
          Nome Completo
        </label>
        <input
          id="nome"
          type="text"
          value={formData.nome}
          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
          placeholder="João da Silva"
          required
          disabled={loading}
          className="w-full px-4 py-2.5 bg-gray-800/50 border border-orange-600/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all disabled:opacity-50"
        />
      </div>

      {/* Email */}
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-semibold text-orange-400">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="seu@email.com"
          required
          disabled={loading}
          className="w-full px-4 py-2.5 bg-gray-800/50 border border-orange-600/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all disabled:opacity-50"
        />
      </div>

      {/* Perfil */}
      <div className="p-3 bg-gray-800/30 border border-orange-600/20 rounded-lg">
        <p className="text-xs text-gray-400">
          Sua conta será criada como <strong className="text-orange-400">Atendente</strong>. Um administrador pode alterar seu perfil depois em Configurações → Usuários.
        </p>
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
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
        <p className="text-xs text-orange-400/70">Mínimo 6 caracteres, 1 maiúscula, 1 número</p>
      </div>

      {/* Confirm Password */}
      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="block text-sm font-semibold text-orange-400">
          Confirmar Senha
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            type={showConfirm ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            placeholder="••••••••"
            required
            disabled={loading}
            className="w-full px-4 py-2.5 bg-gray-800/50 border border-orange-600/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all disabled:opacity-50"
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            disabled={loading}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-orange-400 disabled:opacity-50 transition-colors"
            aria-label={showConfirm ? 'Ocultar confirmação de senha' : 'Mostrar confirmação de senha'}
          >
            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
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
        {loading ? 'Criando conta...' : 'Criar Conta'}
      </button>
    </form>
  )
}
