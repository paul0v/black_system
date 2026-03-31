'use client'

import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, Save, X, AlertCircle } from 'lucide-react'
import { buscarTodosClientes } from '@/modules/cliente/queries'
import { criarCliente, atualizarCliente, deletarCliente } from '@/modules/cliente/actions'

interface Cliente {
  id: string
  nome: string
  cpf?: string
  telefone?: string
  email?: string
  endereco?: string
  criado_em: string
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [mostraFormulario, setMostraFormulario] = useState(false)

  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    telefone: '',
    email: '',
    endereco: '',
  })

  const [editData, setEditData] = useState<Partial<Cliente>>({})

  // Carregar clientes
  useEffect(() => {
    async function carregar() {
      try {
        const dados = await buscarTodosClientes()
        setClientes(dados)
      } catch (err) {
        setError('Erro ao carregar clientes')
      } finally {
        setLoading(false)
      }
    }
    carregar()
  }, [])

  const handleNovoCliente = () => {
    setMostraFormulario(true)
    setFormData({ nome: '', cpf: '', telefone: '', email: '', endereco: '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const result = await criarCliente(formData)
      if (result.success) {
        const novoCliente = {
          id: result.id!,
          ...formData,
          criado_em: new Date().toISOString(),
        }
        setClientes([...clientes, novoCliente])
        setMostraFormulario(false)
        setFormData({ nome: '', cpf: '', telefone: '', email: '', endereco: '' })
      } else {
        setError(result.error || 'Erro ao criar cliente')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar cliente')
    }
  }

  const handleEditar = (cliente: Cliente) => {
    setEditandoId(cliente.id)
    setEditData({ ...cliente })
  }

  const handleSalvarEdicao = async (id: string) => {
    setError('')

    try {
      const result = await atualizarCliente(id, editData)
      if (result.success) {
        setClientes(clientes.map(c => c.id === id ? { ...c, ...editData } : c))
        setEditandoId(null)
      } else {
        setError(result.error || 'Erro ao atualizar cliente')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar cliente')
    }
  }

  const handleDeletar = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este cliente?')) return

    setError('')

    try {
      const result = await deletarCliente(id)
      if (result.success) {
        setClientes(clientes.filter(c => c.id !== id))
      } else {
        setError(result.error || 'Erro ao deletar cliente')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar cliente')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-orange-600/30 pb-6">
        <div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">Clientes</h1>
          <p className="text-gray-400 mt-2 text-lg">Gerencie seus clientes e contatos</p>
        </div>
        <button
          onClick={handleNovoCliente}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-orange-600/50"
        >
          <Plus size={20} />
          Novo Cliente
        </button>
      </div>

      {/* Erro */}
      {error && (
        <div className="bg-red-950/50 border border-red-600/50 rounded-lg p-4 flex gap-3">
          <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
          <div className="text-red-300">{error}</div>
        </div>
      )}

      {/* Formulário Novo Cliente */}
      {mostraFormulario && (
        <form onSubmit={handleSubmit} className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-6 space-y-4 shadow-lg backdrop-blur">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">Novo Cliente</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Nome *"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              required
              className="px-4 py-2 bg-gray-800/50 border border-orange-600/30 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-orange-600 focus:border-transparent transition-all"
            />
            <input
              type="text"
              placeholder="CPF"
              value={formData.cpf}
              onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
              className="px-4 py-2 bg-gray-800/50 border border-orange-600/30 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-orange-600 focus:border-transparent transition-all"
            />
            <input
              type="tel"
              placeholder="Telefone"
              value={formData.telefone}
              onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
              className="px-4 py-2 bg-gray-800/50 border border-orange-600/30 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-orange-600 focus:border-transparent transition-all"
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="px-4 py-2 bg-gray-800/50 border border-orange-600/30 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-orange-600 focus:border-transparent transition-all"
            />
          </div>

          <input
            type="text"
            placeholder="Endereço"
            value={formData.endereco}
            onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
            className="w-full px-4 py-2 bg-gray-800/50 border border-orange-600/30 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-orange-600 focus:border-transparent transition-all"
          />

          <div className="flex gap-4">
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white rounded-lg font-medium transition-all shadow-lg shadow-orange-600/50"
            >
              Salvar
            </button>
            <button
              type="button"
              onClick={() => setMostraFormulario(false)}
              className="px-6 py-2 border border-gray-600 text-gray-300 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Tabela */}
      {loading ? (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-8 text-center">
          <p className="text-orange-400 font-medium">Carregando clientes...</p>
        </div>
      ) : clientes.length === 0 ? (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-12 text-center">
          <AlertCircle className="mx-auto text-orange-500 mb-3" size={40} />
          <p className="text-white text-lg font-medium">Nenhum cliente cadastrado</p>
          <p className="text-gray-400 text-sm mt-1">Clique em "Novo Cliente" para começar</p>
        </div>
      ) : (
        <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 overflow-hidden shadow-2xl backdrop-blur">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-orange-600 to-orange-500 border-b border-orange-600/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-white">Nome</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white">CPF</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white">Telefone</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white">Email</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white">Endereço</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/30">
              {clientes.map(cliente => (
                editandoId === cliente.id ? (
                  <tr key={cliente.id} className="bg-orange-950/30 border-b border-orange-600/30">
                    <td colSpan={6} className="px-6 py-4">
                      <div className="grid grid-cols-3 gap-3">
                        <input
                          type="text"
                          value={editData.nome || ''}
                          onChange={(e) => setEditData({ ...editData, nome: e.target.value })}
                          className="px-3 py-2 bg-gray-800/50 border border-orange-600/30 rounded text-gray-100 focus:ring-2 focus:ring-orange-600"
                        />
                        <input
                          type="text"
                          value={editData.cpf || ''}
                          onChange={(e) => setEditData({ ...editData, cpf: e.target.value })}
                          className="px-3 py-2 bg-gray-800/50 border border-orange-600/30 rounded text-gray-100 focus:ring-2 focus:ring-orange-600"
                        />
                        <input
                          type="tel"
                          value={editData.telefone || ''}
                          onChange={(e) => setEditData({ ...editData, telefone: e.target.value })}
                          className="px-3 py-2 bg-gray-800/50 border border-orange-600/30 rounded text-gray-100 focus:ring-2 focus:ring-orange-600"
                        />
                        <input
                          type="email"
                          value={editData.email || ''}
                          onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                          className="px-3 py-2 bg-gray-800/50 border border-orange-600/30 rounded text-gray-100 focus:ring-2 focus:ring-orange-600"
                        />
                        <input
                          type="text"
                          value={editData.endereco || ''}
                          onChange={(e) => setEditData({ ...editData, endereco: e.target.value })}
                          className="px-3 py-2 bg-gray-800/50 border border-orange-600/30 rounded text-gray-100 focus:ring-2 focus:ring-orange-600"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSalvarEdicao(cliente.id)}
                            className="p-2 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white rounded transition-all"
                            title="Salvar"
                          >
                            <Save size={18} />
                          </button>
                          <button
                            onClick={() => setEditandoId(null)}
                            className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                            title="Cancelar"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={cliente.id} className="hover:bg-gray-800/30 transition-colors border-b border-gray-700/30">
                    <td className="px-6 py-4 text-sm font-medium text-orange-400">{cliente.nome}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{cliente.cpf || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{cliente.telefone || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{cliente.email || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{cliente.endereco || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditar(cliente)}
                          className="p-2 text-orange-500 hover:bg-orange-600/20 rounded-lg transition-colors border border-orange-600/30"
                          title="Editar"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeletar(cliente.id)}
                          className="p-2 text-red-500 hover:bg-red-950/30 rounded-lg transition-colors border border-red-700/30"
                          title="Deletar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
