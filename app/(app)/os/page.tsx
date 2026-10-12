'use client'

import Link from 'next/link'
import { Plus, Eye, Edit2, Trash2, AlertCircle, CheckCircle2, Clock } from 'lucide-react'
import { useEffect, useState } from 'react'
import { buscarTodasOS } from '@/modules/os/queries'
import { buscarTodosClientes } from '@/modules/cliente/queries'
import { deletarOS, atualizarStatusOS } from '@/modules/os/actions'

export default function OSPage() {
  const [ordens, setOrdens] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [clientesMap, setClientesMap] = useState<Record<string, string>>({})
  const [filtroStatus, setFiltroStatus] = useState<string>('todos')

  useEffect(() => {
    async function carregarDados() {
      try {
        setLoading(true)
        const [dados, clientes] = await Promise.all([buscarTodasOS(), buscarTodosClientes()])
        setOrdens(dados)

        // Nomes dos clientes num único mapa (1 leitura da coleção, em vez de uma
        // busca por cliente para cada OS da lista)
        const mapa: Record<string, string> = {}
        clientes.forEach((cliente: any) => {
          mapa[cliente.id] = cliente.nome
        })
        setClientesMap(mapa)
      } catch (err) {
        console.error('Erro ao carregar OS:', err)
      } finally {
        setLoading(false)
      }
    }

    carregarDados()
  }, [])

  const ordensFiltradas = filtroStatus === 'todos' 
    ? ordens 
    : ordens.filter(os => os.status === filtroStatus)

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string; icon: any; label: string }> = {
      aberta: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Plus, label: 'Aberta' },
      em_diagnostico: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock, label: 'Em Diagnóstico' },
      aguardando_aprovacao: { bg: 'bg-purple-100', text: 'text-purple-800', icon: AlertCircle, label: 'Aguardando Aprovação' },
      em_reparo: { bg: 'bg-orange-100', text: 'text-orange-800', icon: Clock, label: 'Em Reparo' },
      concluida: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle2, label: 'Concluída' },
      entregue: { bg: 'bg-emerald-100', text: 'text-emerald-800', icon: CheckCircle2, label: 'Entregue' },
      cancelada: { bg: 'bg-red-100', text: 'text-red-800', icon: AlertCircle, label: 'Cancelada' },
    }
    const config = statusMap[status] || statusMap.aberta
    const Icon = config.icon
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        <Icon size={14} />
        {config.label}
      </div>
    )
  }

  const formatarData = (data: string | null) => {
    if (!data) return '-'
    try {
      return new Date(data).toLocaleDateString('pt-BR')
    } catch {
      return data
    }
  }

  async function handleDeleteOS(id: string) {
    if (confirm('Tem certeza que deseja deletar esta OS?')) {
      await deletarOS(id)
      setOrdens(ordens.filter(os => os.id !== id))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando ordens de serviço...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-400">
              Ordens de Serviço
            </h1>
            <p className="text-gray-400 mt-2">Total de {ordensFiltradas.length} OS</p>
          </div>
          <Link
            href="/os/nova"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-orange-500/50"
          >
            <Plus size={20} />
            Nova OS
          </Link>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {['todos', 'aberta', 'em_diagnostico', 'em_reparo', 'concluida', 'cancelada'].map((status) => (
            <button
              key={status}
              onClick={() => setFiltroStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filtroStatus === status
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {status === 'todos' ? 'Todas' : status.replace(/_/g, ' ').charAt(0).toUpperCase() + status.replace(/_/g, ' ').slice(1)}
            </button>
          ))}
        </div>

        {/* Tabela */}
        {ordensFiltradas.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle size={48} className="mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400 text-lg">Nenhuma ordem de serviço encontrada</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {ordensFiltradas.map((os) => (
              <div
                key={os.id}
                className="bg-gray-900 border border-gray-800 hover:border-orange-600/50 rounded-lg p-6 transition-all hover:shadow-lg hover:shadow-orange-500/10"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold">{os.numero}</h3>
                      {getStatusBadge(os.status)}
                    </div>
                    <p className="text-gray-400 text-sm">Cliente: {clientesMap[os.cliente_id] || 'Carregando...'}</p>
                    {os.equipamento && (os.equipamento.marca || os.equipamento.modelo) && (
                      <p className="text-gray-400 text-sm">
                        Equipamento: {os.equipamento.marca} {os.equipamento.modelo}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/os/${os.id}`}
                      className="p-2 hover:bg-gray-800 rounded transition-colors"
                      title="Ver detalhes"
                      aria-label={`Ver detalhes da OS ${os.numero}`}
                    >
                      <Eye size={18} />
                    </Link>
                    <button
                      onClick={() => handleDeleteOS(os.id)}
                      className="p-2 hover:bg-red-900/20 text-red-500 rounded transition-colors"
                      title="Deletar"
                      aria-label={`Deletar OS ${os.numero}`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <p className="text-gray-300 mb-4">{os.defeito_relatado}</p>

                <div className="flex justify-between items-center text-sm text-gray-400">
                  <span>Entrada: {formatarData(os.data_entrada)}</span>
                  <div className="flex gap-4">
                    {os.status !== 'concluida' && os.status !== 'entregue' && os.status !== 'cancelada' && (
                      <button
                        onClick={async () => {
                          const proxStatuses: Record<string, string> = {
                            aberta: 'em_diagnostico',
                            em_diagnostico: 'em_reparo',
                            em_reparo: 'concluida',
                          }
                          const proximo = proxStatuses[os.status] || 'concluida'
                          await atualizarStatusOS(os.id, proximo)
                          setOrdens(ordens.map(o => o.id === os.id ? { ...o, status: proximo } : o))
                        }}
                        className="px-3 py-1 bg-orange-600 hover:bg-orange-700 rounded text-orange-100 font-medium transition-colors"
                      >
                        Avançar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
