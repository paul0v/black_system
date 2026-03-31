'use client'

import Link from 'next/link'
import { Plus, Eye, Edit2, Trash2, AlertCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { buscarTodasOS } from '@/modules/os/queries'

export default function OSPage() {
  const [ordens, setOrdens] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroStatus, setFiltroStatus] = useState<string>('todos')

  useEffect(() => {
    async function carregarOS() {
      try {
        const dados = await buscarTodasOS()
        setOrdens(dados)
      } catch (err) {
        console.error('Erro ao carregar OS:', err)
      } finally {
        setLoading(false)
      }
    }

    carregarOS()
  }, [])

  const ordensFiltradas = filtroStatus === 'todos' 
    ? ordens 
    : ordens.filter(os => os.status === filtroStatus)

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string; label: string }> = {
      aberta: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Aberta' },
      em_diagnostico: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Em Diagnóstico' },
      aguardando_aprovacao: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Aguardando Aprova.' },
      em_reparo: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Em Reparo' },
      concluida: { bg: 'bg-green-100', text: 'text-green-800', label: 'Concluída' },
      entregue: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Entregue' },
      cancelada: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelada' },
    }
    const config = statusMap[status] || statusMap.aberta
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    )
  }

  const formatarData = (data: string | null) => {
    if (!data) return '-'
    return new Date(data).toLocaleDateString('pt-BR')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-orange-600/30 pb-6">
        <div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">Ordens de Serviço</h1>
          <p className="text-gray-400 mt-2 text-lg">Gerencie todas as ordens de serviço do sistema</p>
        </div>
        <Link
          href="/os/nova"
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-orange-600/50"
        >
          <Plus size={20} />
          Nova OS
        </Link>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 flex-wrap bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
        {['todos', 'aberta', 'em_diagnostico', 'em_reparo', 'concluida', 'entregue'].map(status => (
          <button
            key={status}
            onClick={() => setFiltroStatus(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filtroStatus === status
                ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg shadow-orange-600/50'
                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 border border-gray-600/30'
            }`}
          >
            {status === 'todos' ? 'Todas' : status.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Tabela */}
      {loading ? (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-8 text-center">
          <p className="text-orange-400 font-medium">Carregando ordens de serviço...</p>
        </div>
      ) : ordensFiltradas.length === 0 ? (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-12 text-center">
          <div className="text-gray-400 space-y-3">
            <AlertCircle className="mx-auto text-orange-500" size={40} />
            <p className="text-lg font-medium text-white">Nenhuma ordem de serviço encontrada</p>
            <p className="text-sm">Clique em "Nova OS" para começar</p>
          </div>
        </div>
      ) : (
        <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 overflow-hidden shadow-2xl backdrop-blur">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-orange-600 to-orange-500 border-b border-orange-600/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-white">Nº OS</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white">Cliente</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white">Telefone</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white">Status</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white">Técnico</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white">Data Entrada</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white">Prazo</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/30">
              {ordensFiltradas.map(os => (
                <tr key={os.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-semibold text-orange-400">{os.numero}</td>
                  <td className="px-6 py-4 text-sm text-gray-200">{os.cliente?.nome || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{os.cliente?.telefone || '-'}</td>
                  <td className="px-6 py-4">{getStatusBadge(os.status)}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{os.tecnico?.nome || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{formatarData(os.data_entrada)}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{formatarData(os.prazo_estimado)}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Link
                        href={`/os/${os.id}`}
                        className="p-2 text-orange-500 hover:bg-orange-600/20 rounded-lg transition-colors border border-orange-600/30"
                        title="Visualizar"
                      >
                        <Eye size={18} />
                      </Link>
                      <button className="p-2 text-gray-400 hover:bg-gray-700 rounded-lg transition-colors border border-gray-700/50" title="Editar">
                        <Edit2 size={18} />
                      </button>
                      <button className="p-2 text-red-500 hover:bg-red-950/30 rounded-lg transition-colors border border-red-700/30" title="Deletar">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Stats */}
      {ordens.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-6 shadow-lg backdrop-blur hover:border-orange-600/50 transition-all">
            <p className="text-orange-400 text-sm font-medium uppercase tracking-widest">Total OS</p>
            <p className="text-4xl font-bold text-white mt-3">{ordens.length}</p>
          </div>
          <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-6 shadow-lg backdrop-blur hover:border-blue-600/50 transition-all">
            <p className="text-blue-400 text-sm font-medium uppercase tracking-widest">Abertas</p>
            <p className="text-4xl font-bold text-white mt-3">
              {ordens.filter(os => os.status === 'aberta').length}
            </p>
          </div>
          <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-6 shadow-lg backdrop-blur hover:border-orange-600/50 transition-all">
            <p className="text-orange-400 text-sm font-medium uppercase tracking-widest">Em Reparo</p>
            <p className="text-4xl font-bold text-white mt-3">
              {ordens.filter(os => os.status === 'em_reparo').length}
            </p>
          </div>
          <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-6 shadow-lg backdrop-blur hover:border-green-600/50 transition-all">
            <p className="text-green-400 text-sm font-medium uppercase tracking-widest">Concluídas</p>
            <p className="text-4xl font-bold text-white mt-3">
              {ordens.filter(os => os.status === 'concluida').length}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
