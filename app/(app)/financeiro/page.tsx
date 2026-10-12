'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowDownCircle, ArrowUpCircle, Wallet, Plus, Trash2 } from 'lucide-react'
import { buscarMovimentacoesCaixa, type MovimentacaoCaixa } from '@/modules/financeiro/queries'
import { criarLancamento, deletarLancamento } from '@/modules/financeiro/actions'

const formatarMoeda = (valor: number) =>
  valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const formatarData = (iso: string) => {
  const data = new Date(iso)
  return Number.isNaN(data.getTime()) ? '-' : data.toLocaleDateString('pt-BR')
}

export default function FinanceiroPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoCaixa[]>([])
  const [filtro, setFiltro] = useState<'todas' | 'entrada' | 'saida'>('todas')
  const [mostraFormulario, setMostraFormulario] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [formData, setFormData] = useState({ tipo: 'saida' as 'entrada' | 'saida', descricao: '', valor: '' })

  function carregarMovimentacoes() {
    return buscarMovimentacoesCaixa()
      .then(setMovimentacoes)
      .catch((err) => console.error('Erro ao carregar caixa:', err))
  }

  useEffect(() => {
    carregarMovimentacoes().finally(() => setLoading(false))
  }, [])

  async function handleAdicionarLancamento(e: React.FormEvent) {
    e.preventDefault()
    setErro('')

    if (!formData.descricao.trim() || !formData.valor) {
      setErro('Preencha a descrição e o valor')
      return
    }

    setSalvando(true)
    try {
      const result = await criarLancamento({
        tipo: formData.tipo,
        descricao: formData.descricao,
        valor: Number(formData.valor),
      })

      if (!result.success) {
        setErro(result.error || 'Erro ao adicionar lançamento')
        return
      }

      setFormData({ tipo: 'saida', descricao: '', valor: '' })
      setMostraFormulario(false)
      await carregarMovimentacoes()
    } catch (err) {
      setErro('Erro ao adicionar lançamento')
      console.error(err)
    } finally {
      setSalvando(false)
    }
  }

  async function handleDeletar(lancamentoId: string) {
    if (!confirm('Remover este lançamento?')) return
    try {
      await deletarLancamento(lancamentoId)
      await carregarMovimentacoes()
    } catch (err) {
      console.error('Erro ao remover lançamento:', err)
    }
  }

  const totalEntradas = movimentacoes.filter((m) => m.tipo === 'entrada').reduce((acc, m) => acc + m.valor, 0)
  const totalSaidas = movimentacoes.filter((m) => m.tipo === 'saida').reduce((acc, m) => acc + m.valor, 0)
  const saldo = totalEntradas - totalSaidas

  const movimentacoesFiltradas =
    filtro === 'todas' ? movimentacoes : movimentacoes.filter((m) => m.tipo === filtro)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando caixa...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-orange-600/50 transition-all text-gray-300 hover:text-orange-400 mb-4"
          >
            <ArrowLeft size={20} />
            <span>Voltar</span>
          </button>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-400">
            Caixa
          </h1>
          <p className="text-gray-400 mt-2">Todas as entradas e saídas financeiras</p>
        </div>

        {/* Totais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-400">Entradas</p>
                <p className="text-3xl font-bold text-green-400 mt-3">{formatarMoeda(totalEntradas)}</p>
              </div>
              <div className="bg-green-500/10 rounded-lg p-3">
                <ArrowUpCircle size={24} className="text-green-500" />
              </div>
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-400">Saídas</p>
                <p className="text-3xl font-bold text-red-400 mt-3">{formatarMoeda(totalSaidas)}</p>
              </div>
              <div className="bg-red-500/10 rounded-lg p-3">
                <ArrowDownCircle size={24} className="text-red-500" />
              </div>
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-400">Saldo</p>
                <p className={`text-3xl font-bold mt-3 ${saldo >= 0 ? 'text-orange-400' : 'text-red-400'}`}>
                  {formatarMoeda(saldo)}
                </p>
              </div>
              <div className="bg-orange-500/10 rounded-lg p-3">
                <Wallet size={24} className="text-orange-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtros + Novo Lançamento */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex gap-2">
            {(['todas', 'entrada', 'saida'] as const).map((tipo) => (
              <button
                key={tipo}
                onClick={() => setFiltro(tipo)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  filtro === tipo
                    ? 'bg-orange-600 border-orange-600 text-white'
                    : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-orange-600/50'
                }`}
              >
                {tipo === 'todas' ? 'Todas' : tipo === 'entrada' ? 'Entradas' : 'Saídas'}
              </button>
            ))}
          </div>
          <button
            onClick={() => setMostraFormulario(!mostraFormulario)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-semibold transition-all"
          >
            <Plus size={18} />
            Novo Lançamento
          </button>
        </div>

        {/* Formulário de novo lançamento */}
        {mostraFormulario && (
          <form
            onSubmit={handleAdicionarLancamento}
            className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-4 space-y-4"
          >
            <h3 className="text-lg font-bold text-orange-400">Novo Lançamento Manual</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'entrada' | 'saida' })}
                className="px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="saida">Saída (despesa)</option>
                <option value="entrada">Entrada (receita)</option>
              </select>
              <input
                type="text"
                placeholder="Descrição (ex: Aluguel, Energia)"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                className="px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 sm:col-span-1"
              />
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Valor (R$)"
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                className="px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            {erro && (
              <div className="p-3 bg-red-500/15 border border-red-500/50 rounded-lg text-red-400 text-sm font-medium">
                ⚠️ {erro}
              </div>
            )}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={salvando}
                className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
              >
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
              <button
                type="button"
                onClick={() => setMostraFormulario(false)}
                className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 font-semibold rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Lista */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
          {movimentacoesFiltradas.length === 0 ? (
            <p className="text-center text-gray-500 py-12">Nenhuma movimentação encontrada</p>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Data</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Descrição</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Origem</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-400 uppercase">Valor</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-400 uppercase"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {movimentacoesFiltradas.map((mov) => (
                  <tr key={mov.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-400">{formatarData(mov.data)}</td>
                    <td className="px-6 py-4 text-sm text-gray-200">{mov.descricao}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 capitalize">{mov.origem}</td>
                    <td
                      className={`px-6 py-4 text-sm font-semibold text-right ${
                        mov.tipo === 'entrada' ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {mov.tipo === 'entrada' ? '+' : '-'} {formatarMoeda(mov.valor)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {mov.lancamentoId && (
                        <button
                          onClick={() => handleDeletar(mov.lancamentoId!)}
                          className="p-1.5 text-red-500 hover:bg-red-950/30 rounded-lg transition-colors"
                          title="Remover lançamento"
                          aria-label="Remover lançamento"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
