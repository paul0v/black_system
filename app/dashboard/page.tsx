'use client'

import { useEffect, useState } from 'react'
import { BarChart3, DollarSign, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { buscarTodasOS, buscarOSVencidas } from '@/modules/os/queries'
import { createClient } from '@/lib/supabase/client'

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalOS: 0,
    osPorStatus: {} as Record<string, number>,
    osVencidas: 0,
    faturamentoMes: 0,
    clientesAtivos: 0,
    produtosAlerta: 0,
  })

  useEffect(() => {
    async function carregarDados() {
      try {
        const supabase = createClient()

        // Buscar todas as OS
        const todas = await buscarTodasOS()

        // Buscar OS vencidas
        const vencidas = await buscarOSVencidas()

        // Buscar clientes
        const { data: clientes } = await supabase
          .from('cliente')
          .select('id')

        // Buscar produtos com alerta
        const { data: produtosAlerta } = await supabase
          .from('produto')
          .select('id')
          .eq('alerta_ativo', true)

        // Contar por status
        const porStatus: Record<string, number> = {}
        todas.forEach(os => {
          porStatus[os.status] = (porStatus[os.status] || 0) + 1
        })

        // Calcular faturamento do mês (simulado)
        const osAprovadas = todas.filter(os => os.orcamento_aprovado).length
        const faturamento = osAprovadas * 150 // Valor médio simulado

        setStats({
          totalOS: todas.length,
          osPorStatus: porStatus,
          osVencidas: vencidas.length,
          faturamentoMes: faturamento,
          clientesAtivos: clientes?.length || 0,
          produtosAlerta: produtosAlerta?.length || 0,
        })
      } catch (err) {
        console.error('Erro ao carregar dashboard:', err)
      } finally {
        setLoading(false)
      }
    }

    carregarDados()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
        <p className="text-orange-400 text-lg font-medium">Carregando dashboard...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-orange-600/30 pb-8">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">Dashboard</h1>
        <p className="text-gray-400 mt-2 text-lg">Gestão de Assistência Técnica - Visão Geral</p>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-4 gap-6">
        {/* Total de OS */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-orange-600/40 p-6 shadow-2xl hover:border-orange-600/60 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-orange-400 uppercase tracking-widest">Total OS</p>
              <p className="text-4xl font-bold text-white mt-3">{stats.totalOS}</p>
            </div>
            <div className="bg-orange-600/20 rounded-full p-3">
              <BarChart3 size={28} className="text-orange-500" />
            </div>
          </div>
        </div>

        {/* Faturamento do Mês */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-orange-600/40 p-6 shadow-2xl hover:border-orange-600/60 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-orange-400 uppercase tracking-widest">Faturamento</p>
              <p className="text-4xl font-bold text-white mt-3">
                R$ {(stats.faturamentoMes / 100).toFixed(0)}
              </p>
            </div>
            <div className="bg-orange-600/20 rounded-full p-3">
              <DollarSign size={28} className="text-orange-500" />
            </div>
          </div>
        </div>

        {/* OS Vencidas */}
        <div className="bg-gradient-to-br from-red-950 to-red-900 rounded-xl border border-red-600/40 p-6 shadow-2xl hover:border-red-600/60 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-red-400 uppercase tracking-widest">Vencidas</p>
              <p className="text-4xl font-bold text-white mt-3">{stats.osVencidas}</p>
            </div>
            <div className="bg-red-600/20 rounded-full p-3">
              <AlertCircle size={28} className="text-red-500" />
            </div>
          </div>
        </div>

        {/* Clientes Ativos */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-orange-600/40 p-6 shadow-2xl hover:border-orange-600/60 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-orange-400 uppercase tracking-widest">Clientes</p>
              <p className="text-4xl font-bold text-white mt-3">{stats.clientesAtivos}</p>
            </div>
            <div className="bg-orange-600/20 rounded-full p-3">
              <CheckCircle size={28} className="text-orange-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos e Informações */}
      <div className="grid grid-cols-2 gap-6">
        {/* Status das OS */}
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-8 shadow-2xl backdrop-blur-lg">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></div>
            Distribuição por Status
          </h2>
          <div className="space-y-4">
            {Object.entries(stats.osPorStatus).map(([status, count]) => {
              const statusLabels: Record<string, string> = {
                aberta: 'Aberta',
                em_diagnostico: 'Em Diagnóstico',
                aguardando_aprovacao: 'Aguardando Aprovação',
                em_reparo: 'Em Reparo',
                concluida: 'Concluída',
                entregue: 'Entregue',
                cancelada: 'Cancelada',
              }
              const colors: Record<string, string> = {
                aberta: 'bg-blue-500',
                em_diagnostico: 'bg-yellow-500',
                aguardando_aprovacao: 'bg-purple-500',
                em_reparo: 'bg-orange-500',
                concluida: 'bg-green-500',
                entregue: 'bg-emerald-500',
                cancelada: 'bg-red-500',
              }

              const percentage = (count / stats.totalOS) * 100

              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-700">{statusLabels[status]}</p>
                    <p className="text-sm font-bold text-gray-900">{count} ({percentage.toFixed(0)}%)</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${colors[status]}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Alertas */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Alertas e Notificações</h2>
          <div className="space-y-4">
            {stats.osVencidas > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                <div>
                  <p className="font-semibold text-red-900">{stats.osVencidas} OS vencidas</p>
                  <p className="text-sm text-red-700">Precisam de atenção imediata</p>
                </div>
              </div>
            )}

            {stats.produtosAlerta > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
                <AlertCircle className="text-yellow-600 flex-shrink-0" size={20} />
                <div>
                  <p className="font-semibold text-yellow-900">{stats.produtosAlerta} produtos com alerta</p>
                  <p className="text-sm text-yellow-700">Estoque abaixo do mínimo</p>
                </div>
              </div>
            )}

            {stats.totalOS > 0 && stats.osPorStatus.em_reparo && stats.osPorStatus.em_reparo > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex gap-3">
                <Clock className="text-orange-600 flex-shrink-0" size={20} />
                <div>
                  <p className="font-semibold text-orange-900">{stats.osPorStatus.em_reparo} OS em reparo</p>
                  <p className="text-sm text-orange-700">Aguardando conclusão ou entrega</p>
                </div>
              </div>
            )}

            {stats.osVencidas === 0 && stats.produtosAlerta === 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="font-semibold text-green-900">✓ Tudo em dia!</p>
                <p className="text-sm text-green-700">Nenhum alerta pendente no momento</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Estatísticas Detalhadas */}
      <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-lg">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Resumo</h2>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600 font-medium">OS Ativas</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {(stats.osPorStatus.aberta || 0) + (stats.osPorStatus.em_diagnostico || 0) + (stats.osPorStatus.em_reparo || 0)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">OS Concluídas</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {(stats.osPorStatus.concluida || 0) + (stats.osPorStatus.entregue || 0)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">Taxa de Conclusão</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {stats.totalOS > 0 ? (((stats.osPorStatus.concluida || 0) / stats.totalOS) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
