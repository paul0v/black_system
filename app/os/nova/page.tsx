'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import { criarOS } from '@/modules/os/actions'
import { createClient } from '@/lib/supabase/client'

export default function NovaOSPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [clientes, setClientes] = useState<any[]>([])
  const [carregandoClientes, setCarregandoClientes] = useState(true)

  const [formData, setFormData] = useState({
    cliente_id: '',
    defeito_relatado: '',
    equipamento_tipo: 'celular',
    equipamento_marca: '',
    equipamento_modelo: '',
    equipamento_imei: '',
    acessorios_entregues: '',
    prazo_estimado: '',
  })

  // Carregar clientes
  useEffect(() => {
    async function carregarClientes() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('cliente')
          .select('id, nome, telefone')
          .order('nome')

        if (error) throw error
        setClientes(data || [])
      } catch (err) {
        console.error('Erro ao carregar clientes:', err)
      } finally {
        setCarregandoClientes(false)
      }
    }

    carregarClientes()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await criarOS({
        ...formData,
        equipamento_tipo: formData.equipamento_tipo as 'celular' | 'notebook' | 'tablet' | 'console' | 'outro',
        prazo_estimado: formData.prazo_estimado ? new Date(formData.prazo_estimado) : undefined,
      })

      if (result.success) {
        router.push(`/os/${result.id}`)
      } else {
        setError(result.error || 'Erro ao criar OS')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar OS')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-orange-600/30 pb-6">
        <Link
          href="/os"
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} className="text-orange-500" />
        </Link>
        <div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">Nova Ordem de Serviço</h1>
          <p className="text-gray-400 mt-1">Registre uma nova ordem de serviço</p>
        </div>
      </div>

      {/* Erro */}
      {error && (
        <div className="bg-red-950/50 border border-red-600/50 rounded-lg p-4 flex gap-3">
          <AlertCircle className="text-red-400 flex-shrink-0" size={20} />
          <div className="text-red-300">{error}</div>
        </div>
      )}

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-8 space-y-8 shadow-lg backdrop-blur">
        {/* Seção: Cliente e Equipamento */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white border-b border-orange-600/30 pb-3">Dados do Cliente</h2>

          {/* Cliente */}
          <div>
            <label htmlFor="cliente_id" className="block text-sm font-semibold text-gray-100 mb-2">
              Cliente *
            </label>
            {carregandoClientes ? (
              <p className="text-gray-400">Carregando clientes...</p>
            ) : (
              <select
                id="cliente_id"
                name="cliente_id"
                value={formData.cliente_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-800/50 border border-orange-600/30 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent"
              >
                <option value="" className="bg-gray-800 text-gray-100">Selecione um cliente</option>
                {clientes.map(cliente => (
                  <option key={cliente.id} value={cliente.id} className="bg-gray-800 text-gray-100">
                    {cliente.nome} {cliente.telefone ? `(${cliente.telefone})` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Defeito Relatado */}
          <div>
            <label htmlFor="defeito_relatado" className="block text-sm font-semibold text-gray-100 mb-2">
              Defeito Relatado *
            </label>
            <textarea
              id="defeito_relatado"
              name="defeito_relatado"
              value={formData.defeito_relatado}
              onChange={handleChange}
              required
              minLength={10}
              rows={4}
              placeholder="Descreva o problema em detalhes..."
              className="w-full px-4 py-3 bg-gray-800/50 border border-orange-600/30 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-400 mt-2">Mínimo de 10 caracteres</p>
          </div>
        </div>

        {/* Seção: Equipamento */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white border-b border-orange-600/30 pb-3">Equipamento</h2>

          <div className="grid grid-cols-2 gap-6">
            {/* Tipo */}
            <div>
              <label htmlFor="equipamento_tipo" className="block text-sm font-semibold text-gray-100 mb-2">
                Tipo *
              </label>
              <select
                id="equipamento_tipo"
                name="equipamento_tipo"
                value={formData.equipamento_tipo}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800/50 border border-orange-600/30 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent"
              >
                <option value="celular" className="bg-gray-800 text-gray-100">Celular</option>
                <option value="notebook" className="bg-gray-800 text-gray-100">Notebook</option>
                <option value="tablet" className="bg-gray-800 text-gray-100">Tablet</option>
                <option value="console" className="bg-gray-800 text-gray-100">Console</option>
                <option value="outro" className="bg-gray-800 text-gray-100">Outro</option>
              </select>
            </div>

            {/* Marca */}
            <div>
              <label htmlFor="equipamento_marca" className="block text-sm font-semibold text-gray-100 mb-2">
                Marca *
              </label>
              <input
                type="text"
                id="equipamento_marca"
                name="equipamento_marca"
                value={formData.equipamento_marca}
                onChange={handleChange}
                required
                placeholder="Ex: Samsung, Apple, etc..."
                className="w-full px-4 py-3 bg-gray-800/50 border border-orange-600/30 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent"
              />
            </div>

            {/* Modelo */}
            <div>
              <label htmlFor="equipamento_modelo" className="block text-sm font-semibold text-gray-100 mb-2">
                Modelo *
              </label>
              <input
                type="text"
                id="equipamento_modelo"
                name="equipamento_modelo"
                value={formData.equipamento_modelo}
                onChange={handleChange}
                required
                placeholder="Ex: iPhone 14 Pro, Galaxy S23, etc..."
                className="w-full px-4 py-3 bg-gray-800/50 border border-orange-600/30 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent"
              />
            </div>

            {/* IMEI/Serial */}
            <div>
              <label htmlFor="equipamento_imei" className="block text-sm font-semibold text-gray-100 mb-2">
                IMEI / Serial *
              </label>
              <input
                type="text"
                id="equipamento_imei"
                name="equipamento_imei"
                value={formData.equipamento_imei}
                onChange={handleChange}
                required
                placeholder="IMEI ou número serial do aparelho"
                className="w-full px-4 py-3 bg-gray-800/50 border border-orange-600/30 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent"
              />
            </div>
          </div>

          {/* Acessórios */}
          <div>
            <label htmlFor="acessorios_entregues" className="block text-sm font-semibold text-gray-100 mb-2">
              Acessórios Entregues
            </label>
            <input
              type="text"
              id="acessorios_entregues"
              name="acessorios_entregues"
              value={formData.acessorios_entregues}
              onChange={handleChange}
              placeholder="Ex: Carregador, Fone, Capa, etc..."
              className="w-full px-4 py-3 bg-gray-800/50 border border-orange-600/30 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent"
            />
          </div>
        </div>

        {/* Seção: Prazo */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white border-b border-orange-600/30 pb-3">Dados Adicionais</h2>

          <div>
            <label htmlFor="prazo_estimado" className="block text-sm font-semibold text-gray-100 mb-2">
              Prazo Estimado
            </label>
            <input
              type="date"
              id="prazo_estimado"
              name="prazo_estimado"
              value={formData.prazo_estimado}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-800/50 border border-orange-600/30 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent"
            />
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-4 pt-6 border-t border-orange-600/30">
          <Link
            href="/os"
            className="px-8 py-3 border border-gray-600/30 text-gray-300 rounded-lg font-medium hover:bg-gray-800/30 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white rounded-lg font-medium transition-all shadow-lg shadow-orange-600/50 disabled:opacity-50"
          >
            {loading ? 'Criando...' : 'Criar OS'}
          </button>
        </div>
      </form>
    </div>
  )
}
