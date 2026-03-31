'use client'

import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Produto {
  id: string
  nome: string
  sku: string
  tipo: string
  categoria: string
  quantidade: number
  estoque_minimo: number
  preco_custo: number
  preco_venda: number
  alerta_ativo: boolean
}

export default function EstoquePage() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroAlerta, setFiltroAlerta] = useState(false)

  useEffect(() => {
    async function carregarProdutos() {
      try {
        const supabase = createClient()

        let query = supabase
          .from('produto')
          .select('*')
          .eq('ativo', true)
          .order('nome')

        if (filtroAlerta) {
          query = query.eq('alerta_ativo', true)
        }

        const { data, error } = await query

        if (error) throw error
        setProdutos(data || [])
      } catch (err) {
        console.error('Erro ao carregar produtos:', err)
      } finally {
        setLoading(false)
      }
    }

    carregarProdutos()
  }, [filtroAlerta])

  const handleAtualizarQuantidade = async (id: string, novaQuantidade: number) => {
    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('produto')
        .update({ quantidade: novaQuantidade })
        .eq('id', id)

      if (error) throw error

      setProdutos(produtos.map(p => p.id === id ? { ...p, quantidade: novaQuantidade } : p))
    } catch (err) {
      console.error('Erro ao atualizar quantidade:', err)
    }
  }

  const getStatusEstoque = (quantidade: number, minimo: number) => {
    if (quantidade <= 0) return { label: 'Sem Estoque', color: 'bg-red-100 text-red-800', icon: '🔴' }
    if (quantidade <= minimo) return { label: 'Crítico', color: 'bg-orange-100 text-orange-800', icon: '🟠' }
    if (quantidade <= minimo * 1.5) return { label: 'Baixo', color: 'bg-yellow-100 text-yellow-800', icon: '🟡' }
    return { label: 'OK', color: 'bg-green-100 text-green-800', icon: '🟢' }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-orange-600/30 pb-6">
        <div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">Estoque</h1>
          <p className="text-gray-400 mt-2 text-lg">Gerencie produtos e quantidades</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setFiltroAlerta(!filtroAlerta)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              filtroAlerta
                ? 'bg-red-600/20 border border-red-600/50 text-red-400 shadow-lg shadow-red-600/50'
                : 'bg-gray-700/50 hover:bg-gray-700 text-gray-300 border border-gray-600/30'
            }`}
          >
            <AlertTriangle size={18} />
            {filtroAlerta ? 'Mostrando Alertas' : 'Mostrar Alertas'}
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-orange-600/50">
            <Plus size={20} />
            Novo Produto
          </button>
        </div>
      </div>

      {/* Tabela */}
      {loading ? (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-8 text-center">
          <p className="text-orange-400 font-medium">Carregando produtos...</p>
        </div>
      ) : produtos.length === 0 ? (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-12 text-center">
          <AlertTriangle className="mx-auto text-orange-500 mb-3" size={40} />
          <p className="text-white text-lg font-medium">
            {filtroAlerta ? 'Nenhum produto com alerta' : 'Nenhum produto cadastrado'}
          </p>
        </div>
      ) : (
        <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 overflow-hidden shadow-2xl backdrop-blur">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-orange-600 to-orange-500 border-b border-orange-600/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-white">Produto</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white">SKU</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white">Tipo</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white">Quantidade</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white">Mínimo</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white">Status</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white">Custo</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white">Venda</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/30">
              {produtos.map(produto => {
                const status = getStatusEstoque(produto.quantidade, produto.estoque_minimo)

                return (
                  <tr key={produto.id} className={`hover:bg-gray-800/30 transition-colors border-b border-gray-700/30 ${produto.alerta_ativo ? 'bg-orange-950/30' : ''}`}>
                    <td className="px-6 py-4 text-sm font-medium text-orange-400">{produto.nome}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{produto.sku}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-3 py-1 bg-blue-600/30 text-blue-300 rounded-full text-xs font-medium border border-blue-600/50">
                        {produto.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        value={produto.quantidade}
                        onChange={(e) => handleAtualizarQuantidade(produto.id, parseInt(e.target.value) || 0)}
                        className="w-20 px-3 py-2 bg-gray-800/50 border border-orange-600/30 rounded text-gray-100 focus:ring-2 focus:ring-orange-600"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">{produto.estoque_minimo}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold`}>
                        {status.icon} {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      R$ {(produto.preco_custo / 100).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      R$ {(produto.preco_venda / 100).toFixed(2)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Resumo */}
      {produtos.length > 0 && (
        <div className="grid grid-cols-4 gap-6">
          <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-6 shadow-lg backdrop-blur hover:border-orange-600/50 transition-all">
            <p className="text-orange-400 text-sm font-medium uppercase tracking-widest">Total Produtos</p>
            <p className="text-4xl font-bold text-white mt-3">{produtos.length}</p>
          </div>
          <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-6 shadow-lg backdrop-blur hover:border-orange-600/50 transition-all">
            <p className="text-orange-400 text-sm font-medium uppercase tracking-widest">Com Alerta</p>
            <p className="text-4xl font-bold text-white mt-3">
              {produtos.filter(p => p.alerta_ativo).length}
            </p>
          </div>
          <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-6 shadow-lg backdrop-blur hover:border-green-600/50 transition-all">
            <p className="text-green-400 text-sm font-medium uppercase tracking-widest">Valor Total</p>
            <p className="text-4xl font-bold text-white mt-3">
              R$ {(produtos.reduce((acc, p) => acc + (p.preco_custo * p.quantidade), 0) / 100).toFixed(0)}
            </p>
          </div>
          <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-6 shadow-lg backdrop-blur hover:border-red-600/50 transition-all">
            <p className="text-red-400 text-sm font-medium uppercase tracking-widest">Sem Estoque</p>
            <p className="text-4xl font-bold text-white mt-3">
              {produtos.filter(p => p.quantidade <= 0).length}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
