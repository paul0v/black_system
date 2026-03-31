'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ModalClienteExistente } from '@/components/os/modal-cliente-existente'
import { ModalCadastroCliente } from '@/components/os/modal-cadastro-cliente'
import { ModalDadosOS } from '@/components/os/modal-dados-os'

interface Cliente {
  id: string
  nome: string
  telefone: string
  email?: string
  endereco?: string
}

export default function NovaOSPage() {
  const router = useRouter()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [carregandoClientes, setCarregandoClientes] = useState(true)

  // Estados dos modais
  const [modals, setModals] = useState({
    clienteExistente: false,
    cadastroCliente: false,
    dadosOS: false,
  })

  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null)

  // Carregar clientes ao montar
  useEffect(() => {
    async function carregarClientes() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('cliente')
          .select('id, nome, telefone, email, endereco')
          .order('nome')

        if (error) throw error
        setClientes(data || [])
      } catch (err) {
        console.error('Erro ao carregar clientes:', err)
      } finally {
        setCarregandoClientes(false)
      }
    }

    carregarClientes()
  }, [])

  // Handlers para os modais
  const abrirModalClienteExistente = () => {
    setModals((prev) => ({ ...prev, clienteExistente: true }))
  }

  const fecharModalClienteExistente = () => {
    setModals((prev) => ({ ...prev, clienteExistente: false }))
  }

  const selecionarProcedimento = (tipo: 'existente' | 'novo') => {
    setModals((prev) => ({
      ...prev,
      clienteExistente: false,
      [tipo === 'existente' ? 'dadosOS' : 'cadastroCliente']: true,
    }))
  }

  const fecharModalCadastroCliente = () => {
    setModals((prev) => ({ ...prev, cadastroCliente: false }))
  }

  const aoCriarCliente = (clienteId: string) => {
    // Buscar cliente criado e atualizar lista
    const novoCliente = { id: clienteId, nome: '', telefone: '', email: '', endereco: '' }
    setClienteSelecionado(novoCliente)
    setModals((prev) => ({
      ...prev,
      cadastroCliente: false,
      dadosOS: true,
    }))
  }

  const fecharModalDadosOS = () => {
    setModals((prev) => ({ ...prev, dadosOS: false }))
    setClienteSelecionado(null)
  }

  const aoSucessoOS = (osId: string, numero: number) => {
    fecharModalDadosOS()
    // Redirecionar para detalhes da OS
    router.push(`/os/${osId}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/os"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
              >
                <ArrowLeft size={20} />
                <span>Voltar</span>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Nova Ordem de Serviço</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Opção 1: Cliente Existente */}
          <div
            onClick={abrirModalClienteExistente}
            className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer p-8 text-center"
          >
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Cliente Existente</h2>
            <p className="text-gray-600 mb-4">
              Abrir uma nova OS para um cliente já cadastrado no sistema
            </p>
            <button className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition">
              <Plus size={18} />
              Começar
            </button>
          </div>

          {/* Opção 2: Novo Cliente */}
          <div
            onClick={() =>
              setModals((prev) => ({
                ...prev,
                cadastroCliente: true,
              }))
            }
            className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer p-8 text-center"
          >
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Plus className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Novo Cliente</h2>
            <p className="text-gray-600 mb-4">
              Cadastrar um novo cliente e abrir sua primeira OS simultaneamente
            </p>
            <button className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition">
              <Plus size={18} />
              Cadastrar
            </button>
          </div>
        </div>

        {/* Clientes Recentes (Seção de Atalho) */}
        {!carregandoClientes && clientes.length > 0 && (
          <div className="mt-12 bg-white rounded-lg shadow p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Clientes Recentes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clientes.slice(0, 6).map((cliente) => (
                <button
                  key={cliente.id}
                  onClick={() => {
                    setClienteSelecionado(cliente)
                    setModals((prev) => ({ ...prev, dadosOS: true }))
                  }}
                  className="bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-lg p-4 text-left transition"
                >
                  <p className="font-medium text-gray-900">{cliente.nome}</p>
                  <p className="text-sm text-gray-600">{cliente.telefone}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modais */}
      <ModalClienteExistente
        isOpen={modals.clienteExistente}
        onExistente={() => {
          selecionarProcedimento('existente')
          // Mostrar seletor de cliente direto na OS
          setModals((prev) => ({ ...prev, dadosOS: true }))
        }}
        onNovo={() => selecionarProcedimento('novo')}
        onClose={fecharModalClienteExistente}
      />

      <ModalCadastroCliente
        isOpen={modals.cadastroCliente}
        onSuccess={aoCriarCliente}
        onCancel={fecharModalCadastroCliente}
      />

      {/* Modal de Dados OS com Seletor de Cliente */}
      {modals.dadosOS && !clienteSelecionado ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">Selecionar Cliente</h2>
            </div>
            <div className="p-6 max-h-96 overflow-y-auto">
              {carregandoClientes ? (
                <p className="text-gray-600">Carregando clientes...</p>
              ) : (
                <div className="space-y-2">
                  {clientes.map((cliente) => (
                    <button
                      key={cliente.id}
                      onClick={() => {
                        setClienteSelecionado(cliente)
                      }}
                      className="w-full text-left bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-lg p-4 transition"
                    >
                      <p className="font-medium text-gray-900">{cliente.nome}</p>
                      <p className="text-sm text-gray-600">{cliente.telefone}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="border-t p-4 flex gap-3">
              <button
                onClick={() => {
                  setModals((prev) => ({ ...prev, dadosOS: false }))
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-lg transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <ModalDadosOS
        isOpen={modals.dadosOS && !!clienteSelecionado}
        cliente={clienteSelecionado}
        onSuccess={aoSucessoOS}
        onCancel={fecharModalDadosOS}
      />
    </div>
  )
}
