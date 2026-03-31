'use client'

import { useState } from 'react'
import { X, AlertCircle, Loader, Download } from 'lucide-react'
import { criarOS } from '@/modules/os/actions'
import { baixarPDFOS } from '@/lib/impressao/gerar-pdf-os'
import type { PDFOSData } from '@/lib/impressao/gerar-pdf-os'

interface Cliente {
  id: string
  nome: string
  telefone: string
  email?: string
  endereco?: string
}

interface ModalDadosOSProps {
  isOpen: boolean
  cliente: Cliente | null
  onSuccess: (osId: string, numero: number) => void
  onCancel: () => void
}

export function ModalDadosOS({
  isOpen,
  cliente,
  onSuccess,
  onCancel,
}: ModalDadosOSProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [gerando, setGerando] = useState(false)
  const [osData, setOsData] = useState<any>(null)

  const [formData, setFormData] = useState({
    defeito_relatado: '',
    equipamento_tipo: 'celular',
    equipamento_marca: '',
    equipamento_modelo: '',
    equipamento_imei: '',
    acessorios_entregues: '',
    data_entrada: new Date().toISOString().split('T')[0],
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cliente) {
      setError('Cliente não selecionado')
      return
    }

    setError('')
    setLoading(true)

    try {
      const result = await criarOS({
        cliente_id: cliente.id,
        defeito_relatado: formData.defeito_relatado,
        equipamento_tipo: formData.equipamento_tipo as any,
        equipamento_marca: formData.equipamento_marca,
        equipamento_modelo: formData.equipamento_modelo,
        equipamento_imei: formData.equipamento_imei,
        acessorios_entregues: formData.acessorios_entregues || undefined,
        data_entrada: new Date(formData.data_entrada),
      })

      if (!result.success) {
        setError(result.error || 'Erro ao criar OS')
        return
      }

      // Salvar dados para gerar PDF
      setOsData({
        numero: result.numero,
        cliente: {
          nome: cliente.nome,
          telefone: cliente.telefone,
          email: cliente.email,
          endereco: cliente.endereco,
        },
        equipamento: {
          tipo: formData.equipamento_tipo,
          marca: formData.equipamento_marca,
          modelo: formData.equipamento_modelo,
          imei: formData.equipamento_imei,
          acessorios: formData.acessorios_entregues,
        },
        defeito: formData.defeito_relatado,
        dataEntrada: new Date(formData.data_entrada),
      })

      // Gerar e fazer download do PDF
      setGerando(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      setLoading(false)
    }
  }

  // Quando PDF é gerado, fazer download e fechar modal
  const handlePDFGerado = async () => {
    if (!osData) return

    try {
      await baixarPDFOS(osData, `OS-${osData.numero}.pdf`)
      onSuccess(osData.numero, osData.numero)
      // Reset form
      setFormData({
        defeito_relatado: '',
        equipamento_tipo: 'celular',
        equipamento_marca: '',
        equipamento_modelo: '',
        equipamento_imei: '',
        acessorios_entregues: '',
        data_entrada: new Date().toISOString().split('T')[0],
      })
      setOsData(null)
    } catch (err) {
      setError('Erro ao gerar PDF')
      console.error(err)
    } finally {
      setLoading(false)
      setGerando(false)
    }
  }

  // Mostrar modal de confirmação após envio
  if (osData && gerando) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
          <div className="p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="animate-spin">
                <Loader size={32} className="text-blue-600" />
              </div>
            </div>
            <h2 className="text-lg font-semibold mb-2">Gerando PDF...</h2>
            <p className="text-gray-600 mb-6">
              Processando ordem de serviço #${osData.numero}
            </p>
            <p className="text-sm text-gray-500">
              Um PDF com 2 vias (loja e cliente) será baixado automaticamente.
            </p>
          </div>
          <button
            onClick={handlePDFGerado}
            className="w-full border-t p-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-b-lg transition"
          >
            <Download size={16} className="inline mr-2" />
            Prosseguir
          </button>
        </div>
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 my-8">
        <div className="flex items-center justify-between border-b p-6">
          <h2 className="text-lg font-semibold">Criar Nova Ordem de Serviço</h2>
          <button
            onClick={onCancel}
            disabled={loading}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3 flex gap-2 text-sm text-red-600">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Cliente Info */}
          <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Cliente:</span> {cliente?.nome}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Telefone:</span> {cliente?.telefone}
            </p>
          </div>

          {/* Data de Entrada */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data de Entrada *
            </label>
            <input
              type="date"
              name="data_entrada"
              value={formData.data_entrada}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Defeito Relatado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição do Defeito *
            </label>
            <textarea
              name="defeito_relatado"
              value={formData.defeito_relatado}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Descreva o defeito relatado pelo cliente..."
              rows={4}
            />
          </div>

          {/* Tipo de Equipamento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Equipamento *
            </label>
            <select
              name="equipamento_tipo"
              value={formData.equipamento_tipo}
              onChange={handleChange}
              disabled={loading}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="celular">Celular</option>
              <option value="notebook">Notebook</option>
              <option value="tablet">Tablet</option>
              <option value="console">Console</option>
              <option value="outro">Outro</option>
            </select>
          </div>

          {/* Marca e Modelo */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marca *
              </label>
              <input
                type="text"
                name="equipamento_marca"
                value={formData.equipamento_marca}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Samsung"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Modelo *
              </label>
              <input
                type="text"
                name="equipamento_modelo"
                value={formData.equipamento_modelo}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Galaxy A13"
              />
            </div>
          </div>

          {/* IMEI/Serial */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              IMEI ou Serial *
            </label>
            <input
              type="text"
              name="equipamento_imei"
              value={formData.equipamento_imei}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="12345678901234567"
            />
          </div>

          {/* Acessórios */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Acessórios Entregues
            </label>
            <textarea
              name="acessorios_entregues"
              value={formData.acessorios_entregues}
              onChange={handleChange}
              disabled={loading}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Cabo, carregador, capa, etc..."
              rows={2}
            />
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
            >
              {loading && <Loader size={16} className="animate-spin" />}
              {loading ? 'Criando...' : 'Criar OS e Gerar PDF'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
