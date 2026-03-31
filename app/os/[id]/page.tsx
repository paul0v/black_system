'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Edit2, Save, X } from 'lucide-react'
import { buscarOSPorId } from '@/modules/os/queries'
import { atualizarStatusOS, atualizarOS } from '@/modules/os/actions'
import { useRouter } from 'next/navigation'

export default function DetalhesOSPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [os, setOS] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    defeito_relatado: '',
    diagnostico: '',
  })

  useEffect(() => {
    async function carregar() {
      try {
        const dados = await buscarOSPorId(params.id)
        setOS(dados)
        if (dados) {
          setFormData({
            defeito_relatado: dados.defeito_relatado,
            diagnostico: dados.diagnostico || '',
          })
        }
      } catch (err) {
        setError('Erro ao carregar OS')
      } finally {
        setLoading(false)
      }
    }
    carregar()
  }, [params.id])

  const handleStatusChange = async (novoStatus: string) => {
    try {
      const result = await atualizarStatusOS(params.id, novoStatus)
      if (result.success) {
        setOS({ ...os, status: novoStatus })
      } else {
        setError(result.error || 'Erro ao atualizar status')
      }
    } catch (err) {
      setError('Erro ao atualizar status')
    }
  }

  const handleSave = async () => {
    try {
      const result = await atualizarOS(params.id, formData)
      if (result.success) {
        setOS({ ...os, ...formData })
        setEditando(false)
      } else {
        setError(result.error || 'Erro ao atualizar')
      }
    } catch (err) {
      setError('Erro ao atualizar')
    }
  }

  const getStatusOptions = () => {
    const statusMap: Record<string, string[]> = {
      aberta: ['em_diagnostico', 'cancelada'],
      em_diagnostico: ['aguardando_aprovacao', 'aberta', 'cancelada'],
      aguardando_aprovacao: ['em_reparo', 'aberta', 'cancelada'],
      em_reparo: ['concluida', 'aberta', 'cancelada'],
      concluida: ['entregue', 'aberta'],
      entregue: [],
      cancelada: ['aberta'],
    }
    return statusMap[os?.status] || []
  }

  const statuses = {
    aberta: { bg: 'bg-blue-950/50 border border-blue-600/50', text: 'text-blue-400', label: 'Aberta' },
    em_diagnostico: { bg: 'bg-yellow-950/50 border border-yellow-600/50', text: 'text-yellow-400', label: 'Em Diagnóstico' },
    aguardando_aprovacao: { bg: 'bg-purple-950/50 border border-purple-600/50', text: 'text-purple-400', label: 'Aguardando Aprovação' },
    em_reparo: { bg: 'bg-orange-950/50 border border-orange-600/50', text: 'text-orange-400', label: 'Em Reparo' },
    concluida: { bg: 'bg-green-950/50 border border-green-600/50', text: 'text-green-400', label: 'Concluída' },
    entregue: { bg: 'bg-emerald-950/50 border border-emerald-600/50', text: 'text-emerald-400', label: 'Entregue' },
    cancelada: { bg: 'bg-red-950/50 border border-red-600/50', text: 'text-red-400', label: 'Cancelada' },
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-400">Carregando...</p>
      </div>
    )
  }

  if (!os) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 mb-4">OS não encontrada</p>
        <Link href="/os" className="text-orange-500 hover:text-orange-400">
          Voltar para listagem
        </Link>
      </div>
    )
  }

  const statusConfig = statuses[os.status as keyof typeof statuses] || statuses.aberta

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-orange-600/30 pb-6">
        <div className="flex items-center gap-4">
          <Link href="/os" className="p-2 hover:bg-gray-800 rounded-lg">
            <ArrowLeft size={24} className="text-orange-500" />
          </Link>
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">OS #{os.numero}</h1>
            <p className="text-gray-400 mt-1">Detalhes da ordem de serviço</p>
          </div>
        </div>
        <button
          onClick={() => setEditando(!editando)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-600/50"
        >
          <Edit2 size={18} />
          {editando ? 'Cancelar' : 'Editar'}
        </button>
      </div>

      {error && (
        <div className="bg-red-950/50 border border-red-600/50 rounded-lg p-4 text-red-300">
          {error}
        </div>
      )}

      {/* Status */}
      <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-6 shadow-lg backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 font-medium">Status Atual</p>
            <div className="mt-2">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
                {statusConfig.label}
              </span>
            </div>
          </div>
          
          {getStatusOptions().length > 0 && !editando && (
            <div className="flex gap-2">
              {getStatusOptions().map(status => {
                const statusCfg = statuses[status as keyof typeof statuses]
                return (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusCfg.bg} ${statusCfg.text} hover:border-opacity-100`}
                  >
                    Mudar para {statusCfg.label}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Informações Principais */}
      <div className="grid grid-cols-2 gap-6">
        {/* Cliente */}
        <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-6 shadow-lg backdrop-blur">
          <p className="text-sm text-gray-400 font-medium mb-2">Cliente</p>
          <p className="text-2xl font-bold text-orange-400">{os.cliente?.nome || '-'}</p>
          {os.cliente?.telefone && (
            <p className="text-gray-400 mt-2">{os.cliente.telefone}</p>
          )}
        </div>

        {/* Técnico */}
        <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-6 shadow-lg backdrop-blur">
          <p className="text-sm text-gray-400 font-medium mb-2">Técnico Responsável</p>
          <p className="text-2xl font-bold text-orange-400">{os.tecnico?.nome || 'Não atribuído'}</p>
        </div>

        {/* Data Entrada */}
        <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-6 shadow-lg backdrop-blur">
          <p className="text-sm text-gray-400 font-medium mb-2">Data de Entrada</p>
          <p className="text-2xl font-bold text-gray-200">
            {new Date(os.data_entrada).toLocaleDateString('pt-BR')}
          </p>
        </div>

        {/* Status da OS */}
        <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-6 shadow-lg backdrop-blur">
          <p className="text-sm text-gray-400 font-medium mb-2">Criada em</p>
          <p className="text-2xl font-bold text-gray-200">
            {new Date(os.criado_em).toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>

      {/* Detalhes Técnicos */}
      <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-6 shadow-lg space-y-6 backdrop-blur">
        <h2 className="text-xl font-bold text-white border-b border-orange-600/30 pb-3">Detalhes Técnicos</h2>

        {/* Defeito Relatado */}
        <div>
          <label className="block text-sm font-semibold text-gray-100 mb-2">Defeito Relatado</label>
          {editando ? (
            <textarea
              value={formData.defeito_relatado}
              onChange={(e) => setFormData({ ...formData, defeito_relatado: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 bg-gray-800/50 border border-orange-600/30 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-orange-600"
            />
          ) : (
            <p className="text-gray-300 bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">{os.defeito_relatado}</p>
          )}
        </div>

        {/* Diagnóstico */}
        <div>
          <label className="block text-sm font-semibold text-gray-100 mb-2">Diagnóstico</label>
          {editando ? (
            <textarea
              value={formData.diagnostico}
              onChange={(e) => setFormData({ ...formData, diagnostico: e.target.value })}
              rows={3}
              placeholder="Digite o diagnóstico..."
              className="w-full px-4 py-3 bg-gray-800/50 border border-orange-600/30 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-orange-600"
            />
          ) : (
            <p className="text-gray-300 bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
              {os.diagnostico || 'Não foi feito diagnóstico ainda'}
            </p>
          )}
        </div>

        {/* Botão Salvar */}
        {editando && (
          <div className="flex gap-4 pt-4 border-t border-orange-600/30">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white rounded-lg font-medium transition-all shadow-lg shadow-green-600/50"
            >
              <Save size={18} />
              Salvar Alterações
            </button>
            <button
              onClick={() => setEditando(false)}
              className="flex items-center gap-2 px-6 py-3 border border-gray-600/30 text-gray-300 rounded-lg font-medium hover:bg-gray-800/30 transition-colors"
            >
              <X size={18} />
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
