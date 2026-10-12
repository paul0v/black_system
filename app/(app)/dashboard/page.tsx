'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BarChart3, DollarSign, Clock, CheckCircle2, AlertCircle, TrendingUp, TrendingDown, Users, ArrowLeft, Wallet } from 'lucide-react'
import { buscarEstatisticasOS } from '@/modules/os/queries'
import { buscarResumoFinanceiro, type ResumoFinanceiro } from '@/modules/financeiro/queries'

const formatarMoeda = (valor: number) =>
  valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalOS: 0,
    osAberta: 0,
    osEmReparo: 0,
    osConcluida: 0,
    totalClientes: 0,
    osAprovadas: 0,
  })
  const [financeiro, setFinanceiro] = useState<ResumoFinanceiro | null>(null)

  useEffect(() => {
    async function carregarDados() {
      try {
        // Estatísticas via contagem agregada do Firestore (não baixa a coleção inteira)
        const [estatisticas, resumoFinanceiro] = await Promise.all([
          buscarEstatisticasOS(),
          buscarResumoFinanceiro(),
        ])

        setStats(estatisticas)
        setFinanceiro(resumoFinanceiro)
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-orange-600/50 transition-all text-gray-300 hover:text-orange-400"
            >
              <ArrowLeft size={20} />
              <span>Voltar</span>
            </button>
          </div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-400">
            Dashboard
          </h1>
          <p className="text-gray-400 mt-2">Visão geral do sistema de gestão de OS</p>
        </div>

        {/* KPIs Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Total OS */}
          <div className="bg-gray-900 border border-gray-800 hover:border-orange-600/50 rounded-lg p-6 transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-400">Total de OS</p>
                <p className="text-4xl font-bold text-orange-400 mt-3">{stats.totalOS}</p>
              </div>
              <div className="bg-orange-500/10 rounded-lg p-3">
                <BarChart3 size={24} className="text-orange-500" />
              </div>
            </div>
          </div>

          {/* OS Aberta */}
          <div className="bg-gray-900 border border-gray-800 hover:border-blue-600/50 rounded-lg p-6 transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-400">OS Abertas</p>
                <p className="text-4xl font-bold text-blue-400 mt-3">{stats.osAberta}</p>
              </div>
              <div className="bg-blue-500/10 rounded-lg p-3">
                <AlertCircle size={24} className="text-blue-500" />
              </div>
            </div>
          </div>

          {/* OS Em Reparo */}
          <div className="bg-gray-900 border border-gray-800 hover:border-yellow-600/50 rounded-lg p-6 transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-400">Em Reparo</p>
                <p className="text-4xl font-bold text-yellow-400 mt-3">{stats.osEmReparo}</p>
              </div>
              <div className="bg-yellow-500/10 rounded-lg p-3">
                <Clock size={24} className="text-yellow-500" />
              </div>
            </div>
          </div>

          {/* OS Concluída */}
          <div className="bg-gray-900 border border-gray-800 hover:border-green-600/50 rounded-lg p-6 transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-400">Concluídas</p>
                <p className="text-4xl font-bold text-green-400 mt-3">{stats.osConcluida}</p>
              </div>
              <div className="bg-green-500/10 rounded-lg p-3">
                <CheckCircle2 size={24} className="text-green-500" />
              </div>
            </div>
          </div>

          {/* Total Clientes */}
          <div className="bg-gray-900 border border-gray-800 hover:border-purple-600/50 rounded-lg p-6 transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-400">Total de Clientes</p>
                <p className="text-4xl font-bold text-purple-400 mt-3">{stats.totalClientes}</p>
              </div>
              <div className="bg-purple-500/10 rounded-lg p-3">
                <Users size={24} className="text-purple-500" />
              </div>
            </div>
          </div>

          {/* Taxa Aprovação */}
          <div className="bg-gray-900 border border-gray-800 hover:border-cyan-600/50 rounded-lg p-6 transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-400">Orçamentos Aprovados</p>
                <p className="text-4xl font-bold text-cyan-400 mt-3">
                  {stats.totalOS > 0 ? ((stats.osAprovadas / stats.totalOS) * 100).toFixed(0) : 0}%
                </p>
              </div>
              <div className="bg-cyan-500/10 rounded-lg p-3">
                <TrendingUp size={24} className="text-cyan-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Financeiro */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Financeiro</h2>
            <button
              onClick={() => router.push('/financeiro')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-semibold transition-all shadow-lg hover:shadow-orange-500/30"
            >
              <Wallet size={18} />
              Ver Caixa (Entradas e Saídas)
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-900 border border-gray-800 hover:border-red-600/50 rounded-lg p-6 transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-400">Gasto com Manutenção</p>
                  <p className="text-3xl font-bold text-red-400 mt-3">
                    {formatarMoeda(financeiro?.custoManutencao ?? 0)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Custo de peças usadas nas OS</p>
                </div>
                <div className="bg-red-500/10 rounded-lg p-3">
                  <TrendingDown size={24} className="text-red-500" />
                </div>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 hover:border-green-600/50 rounded-lg p-6 transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-400">Receita Total</p>
                  <p className="text-3xl font-bold text-green-400 mt-3">
                    {formatarMoeda(financeiro?.receitaTotal ?? 0)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">OS + Vendas (PDV)</p>
                </div>
                <div className="bg-green-500/10 rounded-lg p-3">
                  <DollarSign size={24} className="text-green-500" />
                </div>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 hover:border-orange-600/50 rounded-lg p-6 transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-400">Lucro</p>
                  <p
                    className={`text-3xl font-bold mt-3 ${
                      (financeiro?.lucroTotal ?? 0) >= 0 ? 'text-orange-400' : 'text-red-400'
                    }`}
                  >
                    {formatarMoeda(financeiro?.lucroTotal ?? 0)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Receita - custos</p>
                </div>
                <div className="bg-orange-500/10 rounded-lg p-3">
                  <TrendingUp size={24} className="text-orange-500" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Distribuição por Status</h2>
          <div className="space-y-4">
            {/* Aberta */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-300">Aberta</span>
                <span className="text-blue-400 font-semibold">{stats.osAberta}</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-500 h-full transition-all"
                  style={{ width: `${stats.totalOS > 0 ? (stats.osAberta / stats.totalOS) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Em Reparo */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-300">Em Reparo / Diagnóstico</span>
                <span className="text-yellow-400 font-semibold">{stats.osEmReparo}</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-yellow-500 h-full transition-all"
                  style={{ width: `${stats.totalOS > 0 ? (stats.osEmReparo / stats.totalOS) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Concluída */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-300">Concluída / Entregue</span>
                <span className="text-green-400 font-semibold">{stats.osConcluida}</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-green-500 h-full transition-all"
                  style={{ width: `${stats.totalOS > 0 ? (stats.osConcluida / stats.totalOS) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
