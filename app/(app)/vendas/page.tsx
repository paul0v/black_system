'use client'

import {useEffect, useState} from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, DollarSign, ShoppingCart, ArrowLeft } from 'lucide-react'
import { buscarProdutosDisponiveis } from '@/modules/estoque/queries'
import { registrarVenda } from '@/modules/vendas/actions'

interface Produto {
  id: string
  nome: string
  sku: string
  preco_venda: number
  quantidade: number
}

interface ItemCarrinho {
  produto_id: string
  nome: string
  preco_unitario: number
  quantidade: number
}

export default function VendasPage() {
  const router = useRouter()
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [formaPagamento, setFormaPagamento] = useState('dinheiro')

  useEffect(() => {
    async function carregarProdutos() {
      try {
        const dados = await buscarProdutosDisponiveis()
        setProdutos(dados)
      } catch (err) {
        console.error('Erro ao carregar produtos:', err)
      } finally {
        setLoading(false)
      }
    }

    carregarProdutos()
  }, [])

  const produtosFiltrados = produtos.filter(p =>
    p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const adicionarAoCarrinho = (produto: Produto) => {
    const itemExistente = carrinho.find(item => item.produto_id === produto.id)

    if (itemExistente) {
      if (itemExistente.quantidade < produto.quantidade) {
        setCarrinho(carrinho.map(item =>
          item.produto_id === produto.id
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        ))
      }
    } else {
      setCarrinho([...carrinho, {
        produto_id: produto.id,
        nome: produto.nome,
        preco_unitario: produto.preco_venda,
        quantidade: 1,
      }])
    }
  }

  const removerDoCarrinho = (produto_id: string) => {
    setCarrinho(carrinho.filter(item => item.produto_id !== produto_id))
  }

  const atualizarQuantidade = (produto_id: string, quantidade: number) => {
    if (quantidade <= 0) {
      removerDoCarrinho(produto_id)
    } else {
      setCarrinho(carrinho.map(item =>
        item.produto_id === produto_id
          ? { ...item, quantidade }
          : item
      ))
    }
  }

  const calcularTotal = () => {
    return carrinho.reduce((acc, item) => acc + (item.preco_unitario * item.quantidade), 0)
  }

  const handleFinalizarVenda = async () => {
    if (carrinho.length === 0) {
      alert('Adicione produtos ao carrinho')
      return
    }

    try {
      const result = await registrarVenda({
        itens: carrinho.map(item => ({
          produto_id: item.produto_id,
          quantidade: item.quantidade,
          preco_unitario: item.preco_unitario,
        })),
        forma_pagamento: formaPagamento,
        total: calcularTotal(),
      })

      if (!result.success) throw new Error(result.error)

      alert('Venda finalizada com sucesso!')
      setCarrinho([])
      setFormaPagamento('dinheiro')
    } catch (err) {
      console.error('Erro ao finalizar venda:', err)
      alert(err instanceof Error ? err.message : 'Erro ao finalizar venda')
    }
  }

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
      <div className="border-b border-orange-600/30 pb-6">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">PDV - Ponto de Venda</h1>
        <p className="text-gray-400 mt-2 text-base sm:text-lg">Registre vendas e processe pagamentos</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Busca de Produtos */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-6 shadow-lg backdrop-blur">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></div>
              Produtos Disponíveis
            </h2>

            {/* Busca */}
            <input
              type="text"
              placeholder="Buscar produto por nome ou SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800/50 border border-orange-600/30 rounded-lg mb-4 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-orange-600"
            />

            {/* Lista de Produtos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {loading ? (
                <p className="text-orange-400">Carregando produtos...</p>
              ) : produtosFiltrados.length === 0 ? (
                <p className="text-gray-400 col-span-2">Nenhum produto encontrado</p>
              ) : (
                produtosFiltrados.map(produto => (
                  <button
                    key={produto.id}
                    onClick={() => adicionarAoCarrinho(produto)}
                    className="p-3 bg-gray-800/50 border border-orange-600/30 rounded-lg hover:border-orange-600/60 hover:bg-orange-950/30 transition-all text-left"
                  >
                    <p className="font-semibold text-white">{produto.nome}</p>
                    <p className="text-sm text-gray-400">SKU: {produto.sku}</p>
                    <p className="text-lg font-bold text-orange-400 mt-2">
                      R$ {Number(produto.preco_venda).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Estoque: {produto.quantidade}</p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Carrinho */}
        <div className="space-y-4">
          {/* Carrinho */}
          <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-6 shadow-lg backdrop-blur">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart size={24} className="text-orange-500" />
              <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">Carrinho</h2>
              <span className="ml-auto bg-orange-600 text-white px-3 py-1 rounded-full font-bold">
                {carrinho.length}
              </span>
            </div>

            {carrinho.length === 0 ? (
              <p className="text-gray-400 text-center py-8">Carrinho vazio</p>
            ) : (
              <>
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {carrinho.map((item) => (
                    <div key={item.produto_id} className="bg-gray-800/50 rounded-lg p-3 border border-orange-600/30">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-semibold text-white text-sm">{item.nome}</p>
                        <button
                          onClick={() => removerDoCarrinho(item.produto_id)}
                          className="p-1 text-red-500 hover:bg-red-950/30 rounded border border-red-700/30"
                          title="Remover"
                          aria-label={`Remover ${item.nome} do carrinho`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="flex gap-2 items-center mb-2">
                        <input
                          type="number"
                          min={1}
                          value={item.quantidade}
                          onChange={(e) => atualizarQuantidade(item.produto_id, parseInt(e.target.value) || 0)}
                          className="w-16 px-2 py-1 bg-gray-700/50 border border-orange-600/30 rounded text-sm text-gray-100 focus:ring-2 focus:ring-orange-600"
                        />
                        <span className="text-sm text-gray-400">x R$ {Number(item.preco_unitario).toFixed(2)}</span>
                      </div>

                      <p className="text-right font-bold text-orange-400">
                        R$ {(item.preco_unitario * item.quantidade).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Total e Forma de Pagamento */}
                <div className="space-y-4 border-t border-orange-600/30 pt-4">
                  <div className="bg-gradient-to-br from-orange-600 to-orange-500 rounded-lg p-4">
                    <p className="text-orange-100 text-sm mb-1">Total</p>
                    <p className="text-4xl font-bold text-white">
                      R$ {calcularTotal().toFixed(2)}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-100 mb-2">Forma de Pagamento</label>
                    <select
                      value={formaPagamento}
                      onChange={(e) => setFormaPagamento(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-orange-600/30 rounded-lg text-gray-100 focus:ring-2 focus:ring-orange-600 text-sm"
                    >
                      <option value="dinheiro" className="bg-gray-800 text-gray-100">💵 Dinheiro</option>
                      <option value="cartao_credito" className="bg-gray-800 text-gray-100">💳 Cartão Crédito</option>
                      <option value="cartao_debito" className="bg-gray-800 text-gray-100">💳 Cartão Débito</option>
                      <option value="pix" className="bg-gray-800 text-gray-100">🔲 PIX</option>
                    </select>
                  </div>

                  <button
                    onClick={handleFinalizarVenda}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white rounded-lg font-semibold transition-all shadow-lg shadow-green-600/50"
                  >
                    <DollarSign size={20} />
                    Finalizar Venda
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
