'use client'

import { useEffect, useState } from 'react'
import { Save, Loader2 } from 'lucide-react'
import { buscarConfiguracaoEmpresa } from '@/modules/configuracoes/queries'
import { salvarConfiguracaoEmpresa } from '@/modules/configuracoes/actions'
import type { ConfiguracaoEmpresa } from '@/modules/configuracoes/types'
import { comprimirImagem } from '@/lib/utils/comprimir-imagem'

export function AbaEmpresa() {
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState<ConfiguracaoEmpresa>({
    nome: '',
    cnpj: '',
    whatsapp: '',
    endereco: '',
    logoBase64: '',
  })

  useEffect(() => {
    buscarConfiguracaoEmpresa()
      .then(setForm)
      .catch(() => setError('Erro ao carregar configurações'))
      .finally(() => setLoading(false))
  }, [])

  async function handleLogoSelecionada(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0]
    if (!arquivo) return
    try {
      const base64 = await comprimirImagem(arquivo, { maxLargura: 400, qualidade: 0.85, formato: 'image/png' })
      setForm((f) => ({ ...f, logoBase64: base64 }))
    } catch {
      setError('Erro ao processar a imagem da logo')
    } finally {
      e.target.value = ''
    }
  }

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSalvando(true)
    try {
      const result = await salvarConfiguracaoEmpresa(form)
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
      <div className="flex items-center gap-4">
        {form.logoBase64 && (
          <img src={form.logoBase64} alt="Logo" className="w-20 h-20 rounded-xl object-contain bg-black border border-gray-700" />
        )}
        <div>
          <label className="block text-sm font-semibold text-orange-400 mb-2">Logo da Empresa</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoSelecionada}
            className="text-sm text-gray-300 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-orange-600 file:text-white file:font-medium hover:file:bg-orange-700 file:cursor-pointer cursor-pointer"
          />
          <p className="text-xs text-gray-500 mt-1">Aparece no cabeçalho e como marca d'água nas vias impressas.</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-orange-400 mb-2">Nome da Empresa</label>
        <input
          type="text"
          value={form.nome}
          onChange={(e) => setForm({ ...form, nome: e.target.value })}
          required
          className="w-full px-4 py-2.5 bg-gray-800/50 border border-orange-600/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-orange-400 mb-2">CNPJ</label>
          <input
            type="text"
            value={form.cnpj}
            onChange={(e) => setForm({ ...form, cnpj: e.target.value })}
            placeholder="00.000.000/0000-00"
            className="w-full px-4 py-2.5 bg-gray-800/50 border border-orange-600/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-orange-400 mb-2">WhatsApp</label>
          <input
            type="text"
            value={form.whatsapp}
            onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
            placeholder="(00) 00000-0000"
            className="w-full px-4 py-2.5 bg-gray-800/50 border border-orange-600/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-orange-400 mb-2">Endereço</label>
        <input
          type="text"
          value={form.endereco}
          onChange={(e) => setForm({ ...form, endereco: e.target.value })}
          className="w-full px-4 py-2.5 bg-gray-800/50 border border-orange-600/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
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
