'use client'

import { useEffect, useState } from 'react'
import { Save, Loader2 } from 'lucide-react'
import { buscarConfiguracaoWhatsApp } from '@/modules/configuracoes/queries'
import { salvarConfiguracaoWhatsApp } from '@/modules/configuracoes/actions'
import type { ConfiguracaoWhatsApp } from '@/modules/configuracoes/types'

export function AbaWhatsApp() {
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState<ConfiguracaoWhatsApp>({
    ativo: false,
    apiUrl: '',
    apiKey: '',
    instanceName: 'black_system',
  })

  useEffect(() => {
    buscarConfiguracaoWhatsApp()
      .then(setForm)
      .catch(() => setError('Erro ao carregar configurações'))
      .finally(() => setLoading(false))
  }, [])

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSalvando(true)
    try {
      const result = await salvarConfiguracaoWhatsApp(form)
      if (result.success) {
        setSuccess(result.message || 'Configurações salvas com sucesso')
      } else {
        setError(result.error || 'Erro ao salvar configurações')
      }
    } catch {
      setError('Erro ao salvar configurações')
    } finally {
      setSalvando(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-8 text-center">
        <p className="text-orange-400 font-medium">Carregando...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSalvar} className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-6 space-y-6 max-w-2xl">
      <p className="text-sm text-gray-400">
        Integração via Evolution API para enviar notificações automáticas de orçamento pronto e equipamento pronto para retirada.
      </p>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={form.ativo}
          onChange={(e) => setForm({ ...form, ativo: e.target.checked })}
          className="w-5 h-5 accent-orange-500"
        />
        <span className="font-medium text-white">Envio de WhatsApp ativado</span>
      </label>

      <div>
        <label className="block text-sm font-semibold text-orange-400 mb-2">URL da API</label>
        <input
          type="text"
          value={form.apiUrl}
          onChange={(e) => setForm({ ...form, apiUrl: e.target.value })}
          placeholder="https://sua-evolution-api.com"
          className="w-full px-4 py-2.5 bg-gray-800/50 border border-orange-600/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-orange-400 mb-2">API Key / Token</label>
          <input
            type="password"
            value={form.apiKey}
            onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
            placeholder="••••••••"
            className="w-full px-4 py-2.5 bg-gray-800/50 border border-orange-600/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-orange-400 mb-2">Nome da Instância</label>
          <input
            type="text"
            value={form.instanceName}
            onChange={(e) => setForm({ ...form, instanceName: e.target.value })}
            placeholder="black_system"
            className="w-full px-4 py-2.5 bg-gray-800/50 border border-orange-600/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-500/15 border border-red-500/50 rounded-lg text-red-400 text-sm font-medium">
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-500/15 border border-green-500/50 rounded-lg text-green-400 text-sm font-medium">
          ✓ {success}
        </div>
      )}

      <button
        type="submit"
        disabled={salvando}
        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 disabled:opacity-50 text-white font-semibold rounded-lg transition-all"
      >
        {salvando ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
        {salvando ? 'Salvando...' : 'Salvar Configurações'}
      </button>
    </form>
  )
}
