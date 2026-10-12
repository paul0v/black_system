'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit2, Trash2, AlertTriangle, X, Check, ArrowLeft } from 'lucide-react'
import { buscarProdutos } from '@/modules/estoque/queries'
import { atualizarQuantidadeProduto, criarProduto, atualizarProduto, deletarProduto } from '@/modules/estoque/actions'
import { buscarPreferencias } from '@/modules/configuracoes/queries'

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
}

const TIPOS = [
  { value: 'peca', label: 'Peça' },
  { value: 'acessorio', label: 'Acessório' },
  { value: 'aparelho_venda', label: 'Aparelho para Venda' },
]

const PRODUTO_VAZIO = {
  nome: '',
  sku: '',
  tipo: 'peca',
  categoria: '',
  preco_custo: '',
  preco_venda: '',
  estoque_minimo: '1',
}

export default function EstoquePage() {
  const router = useRouter()
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroAlerta, setFiltroAlerta] = useState(false)
  const [mostraFormulario, setMostraFormulario] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [formData, setFormData] = useState(PRODUTO_VAZIO)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<Produto>>({})

  function carregarProdutos() {
    return buscarProdutos()
      .then(setProdutos)
      .catch((err) => console.error('Erro ao carregar produtos:', err))
  }

  useEffect(() => {
    carregarProdutos().finally(() => setLoading(false))
    buscarPreferencias()
      .then((prefs) => setFormData((f) => ({ ...f, estoque_minimo: String(prefs.estoqueMinimoPadrao) })))
      .catch((err) => console.error('Erro ao carregar preferências:', err))
  }, [])

  const handleAtualizarQuantidade = async (id: string, novaQuantidade: number) => {
    try {
      const result = await atualizarQuantidadeProduto(id, novaQuantidade)
      if (!result.success) throw new Error(result.error)

      setProdutos(produtos.map(p => p.id === id ? { ...p, quantidade: novaQuantidade } : p))
    } catch (err) {
      console.error('Erro ao atualizar quantidade:', err)
    }
  }

  async function handleCriarProduto(e: React.FormEvent) {
    e.preventDefault()
    setErro('')

    if (!formData.nome.trim() || !formData.categoria.trim() || !formData.preco_custo || !formData.preco_venda) {
      setErro('Preencha nome, categoria, custo e preço de venda')
      return
    }

    setSalvando(true)
    try {
      const result = await criarProduto({
        nome: formData.nome,
        sku: formData.sku || undefined,
        tipo: formData.tipo as 'peca' | 'acessorio' | 'aparelho_venda',
        categoria: formData.categoria,
        preco_custo: Number(formData.preco_custo),
        preco_venda: Number(formData.preco_venda),
        estoque_minimo: Number(formData.estoque_minimo) || 0,
      })

      if (!result.success) {
        setErro(result.error || 'Erro ao criar produto')
        return
      }

      setFormData(PRODUTO_VAZIO)
      setMostraFormulario(false)
      await carregarProdutos()
    } catch (err) {
      setErro('Erro ao criar produto')
      console.error(err)
    } finally {
      setSalvando(false)
    }
  }

  function handleEditar(produto: Produto) {
    setEditandoId(produto.id)
    setEditData({ ...produto })
  }

  async function handleSalvarEdicao(id: string) {
    try {
      const result = await atualizarProduto(id, {
        nome: editData.nome,
        sku: editData.sku,
        categoria: editData.categoria,
        preco_custo: Number(editData.preco_custo),
        preco_venda: Number(editData.preco_venda),
        estoque_minimo: Number(editData.estoque_minimo),
      })
      if (!result.success) throw new Error(result.error)

      setProdutos(produtos.map(p => (p.id === id ? { ...p, ...editData } as Produto : p)))
      setEditandoId(null)
    } catch (err) {
      console.error('Erro ao salvar produto:', err)
    }
  }

  async function handleDeletar(id: string) {
    if (!confirm('Remover este produto?')) return
    try {
      const result = await deletarProduto(id)
      if (!result.success) throw new Error(result.error)
      setProdutos(produtos.filter(p => p.id !== id))
    } catch (err) {
      console.error('Erro ao remover produto:', err)
    }
  }

  const getStatusEstoque = (quantidade: number, minimo: number) => {
    if (quantidade <= 0) return { label: 'Sem Estoque', icon: '🔴' }
    if (quantidade <= minimo) return { label: 'Crítico', icon: '🟠' }
    if (quantidade <= minimo * 1.5) return { label: 'Baixo', icon: '🟡' }
    return { label: 'OK', icon: '🟢' }
  }

  const produtosExibidos = filtroAlerta
    ? produtos.filter(p => p.quantidade <= p.estoque_minimo)
    : produtos

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-orange-600/50 transition-all text-gray-300 hover:text-orange-400"
      >
        <ArrowLeft size={20} />
        <span>Voltar</span>
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-orange-600/30 pb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">Estoque</h1>
          <p className="text-gray-400 mt-2 text-base sm:text-lg">Gerencie produtos e quantidades</p>
        </div>
        <div className="flex flex-wrap gap-3">
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
          <button
            onClick={() => setMostraFormulario(!mostraFormulario)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-orange-600/50"
          >
            <Plus size={20} />
            Novo Produto
          </button>
        </div>
      </div>

      {/* Formulário de novo produto */}
      {mostraFormulario && (
        <form
          onSubmit={handleCriarProduto}
          className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-6 space-y-4"
        >
          <h3 className="text-lg font-bold text-orange-400">Novo Produto</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Nome *"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className="px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <input
              type="text"
              placeholder="SKU"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              className="px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <select
              value={formData.tipo}
              onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
              className="px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {TIPOS.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Categoria *"
              value={formData.categoria}
              onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
              className="px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Preço de Custo (R$) *"
              value={formData.preco_custo}
              onChange={(e) => setFormData({ ...formData, preco_custo: e.target.value })}
              className="px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Preço de Venda (R$) *"
              value={formData.preco_venda}
              onChange={(e) => setFormData({ ...formData, preco_venda: e.target.value })}
              className="px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <input
              type="number"
              min="0"
              placeholder="Estoque Mínimo"
              value={formData.estoque_minimo}
              onChange={(e) => setFormData({ ...formData, estoque_minimo: e.target.value })}
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

      {/* Tabela */}
      {loading ? (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-8 text-center">
          <p className="text-orange-400 font-medium">Carregando produtos...</p>
        </div>
      ) : produtosExibidos.length === 0 ? (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-12 text-center">
          <AlertTriangle className="mx-auto text-orange-500 mb-3" size={40} />
          <p className="text-white text-lg font-medium">
            {filtroAlerta ? 'Nenhum produto com alerta' : 'Nenhum produto cadastrado'}
          </p>
        </div>
      ) : (
        <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 shadow-2xl backdrop-blur overflow-x-auto">
          <table className="w-full min-w-[960px]">
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
                <th className="px-6 py-4 text-left text-sm font-bold text-white">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/30">
              {produtosExibidos.map(produto => {
                const status = getStatusEstoque(produto.quantidade, produto.estoque_minimo)
                const emEdicao = editandoId === produto.id

                if (emEdicao) {
                  return (
                    <tr key={produto.id} className="bg-orange-950/30 border-b border-orange-600/30">
                      <td colSpan={9} className="px-6 py-5">
                        <p className="text-xs font-semibold text-orange-400 uppercase tracking-wide mb-3">
                          Editando produto
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          <label className="block">
                            <span className="block text-xs text-gray-400 mb-1">Nome</span>
                            <input
                              type="text"
                              value={editData.nome || ''}
                              onChange={(e) => setEditData({ ...editData, nome: e.target.value })}
                              className="w-full px-3 py-2 bg-gray-800/50 border border-orange-600/30 rounded text-gray-100 focus:ring-2 focus:ring-orange-600"
                            />
                          </label>
                          <label className="block">
                            <span className="block text-xs text-gray-400 mb-1">SKU</span>
                            <input
                              type="text"
                              value={editData.sku || ''}
                              onChange={(e) => setEditData({ ...editData, sku: e.target.value })}
                              className="w-full px-3 py-2 bg-gray-800/50 border border-orange-600/30 rounded text-gray-100 focus:ring-2 focus:ring-orange-600"
                            />
                          </label>
                          <label className="block">
                            <span className="block text-xs text-gray-400 mb-1">Categoria</span>
                            <input
                              type="text"
                              value={editData.categoria || ''}
                              onChange={(e) => setEditData({ ...editData, categoria: e.target.value })}
                              className="w-full px-3 py-2 bg-gray-800/50 border border-orange-600/30 rounded text-gray-100 focus:ring-2 focus:ring-orange-600"
                            />
                          </label>
                          <label className="block">
                            <span className="block text-xs text-gray-400 mb-1">Estoque Mínimo</span>
                            <input
                              type="number"
                              value={editData.estoque_minimo ?? ''}
                              onChange={(e) => setEditData({ ...editData, estoque_minimo: Number(e.target.value) })}
                              className="w-full px-3 py-2 bg-gray-800/50 border border-orange-600/30 rounded text-gray-100 focus:ring-2 focus:ring-orange-600"
                            />
                          </label>
                          <label className="block">
                            <span className="block text-xs text-gray-400 mb-1">Preço de Custo (R$)</span>
                            <input
                              type="number"
                              step="0.01"
                              value={editData.preco_custo ?? ''}
                              onChange={(e) => setEditData({ ...editData, preco_custo: Number(e.target.value) })}
                              className="w-full px-3 py-2 bg-gray-800/50 border border-orange-600/30 rounded text-gray-100 focus:ring-2 focus:ring-orange-600"
                            />
                          </label>
                          <label className="block">
                            <span className="block text-xs text-gray-400 mb-1">Preço de Venda (R$)</span>
                            <input
                              type="number"
                              step="0.01"
                              value={editData.preco_venda ?? ''}
                              onChange={(e) => setEditData({ ...editData, preco_venda: Number(e.target.value) })}
                              className="w-full px-3 py-2 bg-gray-800/50 border border-orange-600/30 rounded text-gray-100 focus:ring-2 focus:ring-orange-600"
                            />
                          </label>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => handleSalvarEdicao(produto.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium transition-colors"
                          >
                            <Check size={16} /> Salvar
                          </button>
                          <button
                            onClick={() => setEditandoId(null)}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-medium transition-colors"
                          >
                            <X size={16} /> Cancelar
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                }

                return (
                  <tr key={produto.id} className="hover:bg-gray-800/30 transition-colors border-b border-gray-700/30">
                    <td className="px-6 py-4 text-sm font-medium text-orange-400">{produto.nome}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{produto.sku || '-'}</td>
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
                      <span className="px-3 py-1 rounded-full text-sm font-semibold">
                        {status.icon} {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      R$ {Number(produto.preco_custo).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      R$ {Number(produto.preco_venda).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditar(produto)}
                          className="p-2 text-orange-500 hover:bg-orange-600/20 rounded-lg transition-colors border border-orange-600/30"
                          title="Editar"
                          aria-label="Editar produto"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeletar(produto.id)}
                          className="p-2 text-red-500 hover:bg-red-950/30 rounded-lg transition-colors border border-red-700/30"
                          title="Remover"
                          aria-label="Remover produto"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-6 shadow-lg backdrop-blur hover:border-orange-600/50 transition-all">
            <p className="text-orange-400 text-sm font-medium uppercase tracking-widest">Total Produtos</p>
            <p className="text-4xl font-bold text-white mt-3">{produtos.length}</p>
          </div>
          <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-6 shadow-lg backdrop-blur hover:border-orange-600/50 transition-all">
            <p className="text-orange-400 text-sm font-medium uppercase tracking-widest">Com Alerta</p>
            <p className="text-4xl font-bold text-white mt-3">
              {produtos.filter(p => p.quantidade <= p.estoque_minimo).length}
            </p>
          </div>
          <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-6 shadow-lg backdrop-blur hover:border-green-600/50 transition-all">
            <p className="text-green-400 text-sm font-medium uppercase tracking-widest">Valor Total</p>
            <p className="text-4xl font-bold text-white mt-3">
              R$ {produtos.reduce((acc, p) => acc + (Number(p.preco_custo) * p.quantidade), 0).toFixed(0)}
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
