'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Edit2, Save, X, Trash2, CheckCircle, Plus, Printer, ShieldCheck } from 'lucide-react'
import { buscarOSPorId } from '@/modules/os/queries'
import { atualizarStatusOS, atualizarOS, deletarOS, concluirOS, adicionarItemOS, removerItemOS } from '@/modules/os/actions'
import { useRouter } from 'next/navigation'
import { CHECKLIST_ENTRADA_ITENS } from '@/modules/os/checklist'
import { statusSeguintesValidos } from '@/domain/os/status'
import { PatternLockDisplay } from '@/components/os/pattern-lock'
import { baixarPDFGarantia } from '@/lib/impressao/gerar-pdf-garantia'
import { baixarPDFOS } from '@/lib/impressao/gerar-pdf-os'
import { buscarConfiguracaoEmpresa } from '@/modules/configuracoes/queries'
import { enviarOrcamentoProto, enviarEquipamentoPronto } from '@/lib/notificacoes/whatsapp'

export default function DetalhesOSPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  const [os, setOS] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState(false)
  const [error, setError] = useState('')
  const [salvandoItem, setSalvandoItem] = useState(false)
  const [novoItem, setNovoItem] = useState({
    descricao: '',
    quantidade: '1',
    preco_custo: '',
    preco_unitario: '',
  })

  const [formData, setFormData] = useState({
    defeito_relatado: '',
    diagnostico: '',
  })

  useEffect(() => {
    async function carregar() {
      try {
        const dados = await buscarOSPorId(id)
        setOS(dados)
        if (dados) {
          setFormData({
            defeito_relatado: dados.defeito_relatado,
            diagnostico: dados.diagnostico || '',
          })
        }
      } catch (err) {
        setError('Erro ao carregar OS')
      } finally {
        setLoading(false)
      }
    }
    carregar()
  }, [id])

  const handleAdicionarItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!novoItem.descricao || !novoItem.preco_unitario) {
      setError('Informe ao menos a descrição e o valor cobrado do item')
      return
    }

    setSalvandoItem(true)
    try {
      const result = await adicionarItemOS({
        os_id: id,
        descricao: novoItem.descricao,
        quantidade: novoItem.quantidade,
        preco_custo: novoItem.preco_custo || 0,
        preco_unitario: novoItem.preco_unitario,
      })

      if (result.success) {
        const dados = await buscarOSPorId(id)
        setOS(dados)
        setNovoItem({ descricao: '', quantidade: '1', preco_custo: '', preco_unitario: '' })
      } else {
        setError(result.error || 'Erro ao adicionar item')
      }
    } catch (err) {
      setError('Erro ao adicionar item')
    } finally {
      setSalvandoItem(false)
    }
  }

  const handleRemoverItem = async (itemId: string) => {
    if (!confirm('Remover este item do orçamento?')) return
    try {
      const result = await removerItemOS(itemId, id)
      if (result.success) {
        const dados = await buscarOSPorId(id)
        setOS(dados)
      } else {
        setError(result.error || 'Erro ao remover item')
      }
    } catch (err) {
      setError('Erro ao remover item')
    }
  }

  const formatarMoeda = (valor: number) =>
    valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  const parseChecklist = (condicaoEntrada: unknown): Record<string, boolean> => {
    if (typeof condicaoEntrada !== 'string' || !condicaoEntrada) return {}
    try {
      return JSON.parse(condicaoEntrada)
    } catch {
      return {}
    }
  }

  const totalCusto = (os?.itens || []).reduce(
    (acc: number, item: any) => acc + Number(item.quantidade) * Number(item.preco_custo),
    0
  )
  const totalCobranca = (os?.itens || []).reduce(
    (acc: number, item: any) => acc + Number(item.quantidade) * Number(item.preco_unitario),
    0
  )

  const imprimirGarantia = async (janelaPreAberta?: Window | null) => {
    try {
      const servicoRealizado = (os.itens || []).length
        ? os.itens.map((item: any) => item.descricao).join(', ')
        : os.diagnostico || os.defeito_relatado || '-'

      const empresa = await buscarConfiguracaoEmpresa()

      await baixarPDFGarantia({
        numero: os.numero,
        cliente: {
          nome: os.cliente?.nome || '',
          telefone: os.cliente?.telefone || '',
          email: os.cliente?.email,
          endereco: os.cliente?.endereco,
        },
        equipamento: {
          tipo: os.equipamento?.tipo || '',
          marca: os.equipamento?.marca || '',
          modelo: os.equipamento?.modelo || '',
          imei: os.equipamento?.imei_serial || '',
        },
        servicoRealizado,
        dataConclusao: new Date(),
        empresa,
      }, undefined, janelaPreAberta)
    } catch (err) {
      console.error('Erro ao gerar termo de garantia:', err)
    }
  }

  const imprimirViasOS = async (janelaPreAberta?: Window | null) => {
    try {
      const empresa = await buscarConfiguracaoEmpresa()

      await baixarPDFOS({
        numero: os.numero,
        cliente: {
          nome: os.cliente?.nome || '',
          telefone: os.cliente?.telefone || '',
          email: os.cliente?.email,
          endereco: os.cliente?.endereco,
        },
        equipamento: {
          tipo: os.equipamento?.tipo || '',
          marca: os.equipamento?.marca || '',
          modelo: os.equipamento?.modelo || '',
          imei: os.equipamento?.imei_serial || '',
          acessorios: os.equipamento?.acessorios_entregues || '',
        },
        defeito: os.defeito_relatado || '',
        dataEntrada: new Date(os.data_entrada),
        tecnico: os.tecnico?.nome,
        empresa,
      }, undefined, janelaPreAberta)
    } catch (err) {
      console.error('Erro ao gerar vias da OS:', err)
    }
  }

  const notificarOrcamentoPronto = async () => {
    try {
      if (!os.cliente?.telefone) return
      await enviarOrcamentoProto(os.cliente.telefone, os.cliente?.nome || '', os.numero, totalCobranca)
    } catch (err) {
      console.error('Erro ao enviar WhatsApp de orçamento pronto:', err)
    }
  }

  const notificarEquipamentoPronto = async () => {
    try {
      if (!os.cliente?.telefone) return
      await enviarEquipamentoPronto(os.cliente.telefone, os.cliente?.nome || '', os.numero)
    } catch (err) {
      console.error('Erro ao enviar WhatsApp de equipamento pronto:', err)
    }
  }

  const handleStatusChange = async (novoStatus: string) => {
    // Precisa abrir a janela ANTES do await abaixo, senão o navegador
    // bloqueia como pop-up (perde o gesto do clique do usuário).
    const janelaGarantia = novoStatus === 'concluida' ? window.open('', '_blank') : null
    try {
      const result = await atualizarStatusOS(id, novoStatus)
      if (result.success) {
        setOS({ ...os, status: novoStatus })
        if (novoStatus === 'aguardando_aprovacao') {
          await notificarOrcamentoPronto()
        }
        if (novoStatus === 'concluida') {
          await imprimirGarantia(janelaGarantia)
          await notificarEquipamentoPronto()
        } else {
          janelaGarantia?.close()
        }
      } else {
        janelaGarantia?.close()
        setError(result.error || 'Erro ao atualizar status')
      }
    } catch (err) {
      janelaGarantia?.close()
      setError('Erro ao atualizar status')
    }
  }

  const handleSave = async () => {
    try {
      const result = await atualizarOS(id, formData)
      if (result.success) {
        setOS({ ...os, ...formData })
        setEditando(false)
      } else {
        setError(result.error || 'Erro ao atualizar')
      }
    } catch (err) {
      setError('Erro ao atualizar')
    }
  }

  const handleConcluir = async () => {
    if (!confirm('Tem certeza que deseja finalizar esta OS?')) return
    // Precisa abrir a janela ANTES do await abaixo, senão o navegador
    // bloqueia como pop-up (perde o gesto do clique do usuário).
    const janelaGarantia = window.open('', '_blank')
    try {
      const result = await concluirOS(id)
      if (result.success) {
        setOS({ ...os, status: 'concluida' })
        await imprimirGarantia(janelaGarantia)
        await notificarEquipamentoPronto()
      } else {
        janelaGarantia?.close()
        setError(result.error || 'Erro ao finalizar OS')
      }
    } catch (err) {
      janelaGarantia?.close()
      setError('Erro ao finalizar OS')
    }
  }

  const handleDeletar = async () => {
    if (!confirm('Tem certeza que deseja deletar esta OS? Esta ação não pode ser desfeita.')) return
    try {
      const result = await deletarOS(id)
      if (result.success) {
        router.push('/os')
      } else {
        setError(result.error || 'Erro ao deletar OS')
      }
    } catch (err) {
      setError('Erro ao deletar OS')
    }
  }

  const getStatusOptions = () => statusSeguintesValidos(os?.status)

  const statuses = {
    aberta: { bg: 'bg-blue-950/50 border border-blue-600/50', text: 'text-blue-400', label: 'Aberta' },
    em_diagnostico: { bg: 'bg-yellow-950/50 border border-yellow-600/50', text: 'text-yellow-400', label: 'Em Diagnóstico' },
    aguardando_aprovacao: { bg: 'bg-purple-950/50 border border-purple-600/50', text: 'text-purple-400', label: 'Aguardando Aprovação' },
    em_reparo: { bg: 'bg-orange-950/50 border border-orange-600/50', text: 'text-orange-400', label: 'Em Reparo' },
    concluida: { bg: 'bg-green-950/50 border border-green-600/50', text: 'text-green-400', label: 'Concluída' },
    entregue: { bg: 'bg-emerald-950/50 border border-emerald-600/50', text: 'text-emerald-400', label: 'Entregue' },
    cancelada: { bg: 'bg-red-950/50 border border-red-600/50', text: 'text-red-400', label: 'Cancelada' },
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-400">Carregando...</p>
      </div>
    )
  }

  if (!os) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 mb-4">OS não encontrada</p>
        <Link href="/os" className="text-orange-500 hover:text-orange-400">
          Voltar para listagem
        </Link>
      </div>
    )
  }

  const statusConfig = statuses[os.status as keyof typeof statuses] || statuses.aberta

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-orange-600/30 pb-6">
        <div className="flex items-center gap-4 min-w-0">
          <Link href="/os" className="p-2 hover:bg-gray-800 rounded-lg flex-shrink-0">
            <ArrowLeft size={24} className="text-orange-500" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent truncate">OS #{os.numero}</h1>
            <p className="text-gray-400 mt-1">Detalhes da ordem de serviço</p>
          </div>
        </div>
        <button
          onClick={() => setEditando(!editando)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-600/50 self-start"
        >
          <Edit2 size={18} />
          {editando ? 'Cancelar' : 'Editar'}
        </button>
      </div>

      {error && (
        <div className="bg-red-950/50 border border-red-600/50 rounded-lg p-4 text-red-300">
          {error}
        </div>
      )}

      {/* Status */}
      <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-6 shadow-lg backdrop-blur">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm text-gray-400 font-medium">Status Atual</p>
            <div className="mt-2">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
                {statusConfig.label}
              </span>
            </div>
          </div>
          
          {getStatusOptions().length > 0 && !editando && (
            <div className="flex flex-wrap gap-2">
              {getStatusOptions().map(status => {
                const statusCfg = statuses[status as keyof typeof statuses]
                return (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusCfg.bg} ${statusCfg.text} hover:border-opacity-100`}
                  >
                    Mudar para {statusCfg.label}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Informações Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {/* Cliente */}
        <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-6 shadow-lg backdrop-blur">
          <p className="text-sm text-gray-400 font-medium mb-2">Cliente</p>
          <p className="text-2xl font-bold text-orange-400">{os.cliente?.nome || '-'}</p>
          {os.cliente?.telefone && (
            <p className="text-gray-400 mt-2">{os.cliente.telefone}</p>
          )}
        </div>

        {/* Técnico */}
        <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-6 shadow-lg backdrop-blur">
          <p className="text-sm text-gray-400 font-medium mb-2">Técnico Responsável</p>
          <p className="text-2xl font-bold text-orange-400">{os.tecnico?.nome || 'Não atribuído'}</p>
        </div>

        {/* Data Entrada */}
        <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-6 shadow-lg backdrop-blur">
          <p className="text-sm text-gray-400 font-medium mb-2">Data de Entrada</p>
          <p className="text-2xl font-bold text-gray-200">
            {new Date(os.data_entrada).toLocaleDateString('pt-BR')}
          </p>
        </div>

        {/* Status da OS */}
        <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-6 shadow-lg backdrop-blur">
          <p className="text-sm text-gray-400 font-medium mb-2">Criada em</p>
          <p className="text-2xl font-bold text-gray-200">
            {new Date(os.criado_em).toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>

      {/* Equipamento */}
      <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-6 shadow-lg backdrop-blur">
        <h2 className="text-xl font-bold text-white border-b border-orange-600/30 pb-3 mb-4">Equipamento</h2>
        {os.equipamento ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-400 font-medium mb-1">Marca</p>
              <p className="text-lg font-bold text-orange-400">{os.equipamento.marca || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 font-medium mb-1">Modelo</p>
              <p className="text-lg font-bold text-orange-400">{os.equipamento.modelo || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 font-medium mb-1">Tipo</p>
              <p className="text-lg font-bold text-gray-200 capitalize">{os.equipamento.tipo || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 font-medium mb-1">IMEI/Serial</p>
              <p className="text-lg font-bold text-gray-200">{os.equipamento.imei_serial || '-'}</p>
            </div>
            {os.equipamento.acessorios_entregues && (
              <div className="col-span-2 md:col-span-4">
                <p className="text-sm text-gray-400 font-medium mb-1">Acessórios Entregues</p>
                <p className="text-gray-300">{os.equipamento.acessorios_entregues}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-400">Nenhum equipamento cadastrado para esta OS</p>
        )}

        {os.equipamento && (
          <>
            {/* Checklist de Entrada */}
            <div className="mt-6 pt-6 border-t border-gray-700/50">
              <p className="text-sm text-gray-400 font-medium mb-3">Checklist de Entrada</p>
              {(() => {
                const checklist = parseChecklist(os.equipamento.condicao_entrada)
                const marcados = CHECKLIST_ENTRADA_ITENS.filter((item) => checklist[item.chave])
                if (marcados.length === 0) {
                  return <p className="text-gray-500 text-sm">Nenhum item de checklist registrado</p>
                }
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {marcados.map((item) => (
                      <div key={item.chave} className="flex items-center gap-2 text-sm text-gray-300">
                        <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                        {item.label}
                      </div>
                    ))}
                  </div>
                )
              })()}
            </div>

            {/* Fotos do Equipamento */}
            <div className="mt-6 pt-6 border-t border-gray-700/50">
              <p className="text-sm text-gray-400 font-medium mb-3">Fotos do Equipamento (entrada)</p>
              {os.equipamento.fotos_url && os.equipamento.fotos_url.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {os.equipamento.fotos_url.map((foto: string, index: number) => (
                    <a key={index} href={foto} target="_blank" rel="noopener noreferrer">
                      <img
                        src={foto}
                        alt={`Foto do equipamento ${index + 1}`}
                        className="w-full h-28 object-cover rounded-lg border border-gray-700 hover:border-orange-500 transition-colors"
                      />
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Nenhuma foto registrada na entrada</p>
              )}
            </div>

            {/* Senha do Aparelho */}
            <div className="mt-6 pt-6 border-t border-gray-700/50">
              <p className="text-sm text-gray-400 font-medium mb-3">Senha do Aparelho</p>
              {!os.equipamento.senha_tipo || os.equipamento.senha_tipo === 'nenhuma' ? (
                <p className="text-gray-500 text-sm">Nenhuma senha informada</p>
              ) : os.equipamento.senha_tipo === 'padrao' ? (
                <PatternLockDisplay value={os.equipamento.senha_valor || ''} />
              ) : (
                <p className="text-lg font-bold text-gray-200">
                  {os.equipamento.senha_valor || '-'}
                  <span className="ml-2 text-xs font-normal text-gray-500 uppercase">
                    ({os.equipamento.senha_tipo})
                  </span>
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Peças, Custos e Orçamento */}
      <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-6 shadow-lg backdrop-blur">
        <h2 className="text-xl font-bold text-white border-b border-orange-600/30 pb-3 mb-4">Peças e Orçamento</h2>

        {os.itens && os.itens.length > 0 ? (
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-700/50">
                  <th className="py-2 pr-4 font-medium">Descrição</th>
                  <th className="py-2 pr-4 font-medium">Qtd</th>
                  <th className="py-2 pr-4 font-medium">Custo Unit.</th>
                  <th className="py-2 pr-4 font-medium">Valor Cobrado Unit.</th>
                  <th className="py-2 pr-4 font-medium">Subtotal Custo</th>
                  <th className="py-2 pr-4 font-medium">Subtotal Cliente</th>
                  <th className="py-2 pr-4 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {os.itens.map((item: any) => (
                  <tr key={item.id} className="border-b border-gray-800/50 text-gray-300">
                    <td className="py-2 pr-4">{item.descricao}</td>
                    <td className="py-2 pr-4">{item.quantidade}</td>
                    <td className="py-2 pr-4">{formatarMoeda(Number(item.preco_custo))}</td>
                    <td className="py-2 pr-4">{formatarMoeda(Number(item.preco_unitario))}</td>
                    <td className="py-2 pr-4 text-gray-400">
                      {formatarMoeda(Number(item.quantidade) * Number(item.preco_custo))}
                    </td>
                    <td className="py-2 pr-4 text-orange-400 font-semibold">
                      {formatarMoeda(Number(item.quantidade) * Number(item.preco_unitario))}
                    </td>
                    <td className="py-2 pr-4">
                      <button
                        onClick={() => handleRemoverItem(item.id)}
                        className="text-red-500 hover:text-red-400"
                        title="Remover item"
                        aria-label="Remover item do orçamento"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400 mb-6">Nenhuma peça ou serviço lançado ainda</p>
        )}

        {/* Totais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
            <p className="text-sm text-gray-400 font-medium mb-1">Total de Custo (peças)</p>
            <p className="text-2xl font-bold text-gray-200">{formatarMoeda(totalCusto)}</p>
          </div>
          <div className="bg-orange-950/30 rounded-lg p-4 border border-orange-600/40">
            <p className="text-sm text-orange-300 font-medium mb-1">Valor Total a Cobrar do Cliente</p>
            <p className="text-2xl font-bold text-orange-400">{formatarMoeda(totalCobranca)}</p>
          </div>
        </div>

        {/* Formulário para novo item */}
        <form onSubmit={handleAdicionarItem} className="border-t border-gray-700/50 pt-4">
          <p className="text-sm font-semibold text-gray-100 mb-3">Adicionar peça/serviço</p>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <input
              type="text"
              placeholder="Descrição (ex: Tela LCD)"
              value={novoItem.descricao}
              onChange={(e) => setNovoItem({ ...novoItem, descricao: e.target.value })}
              className="md:col-span-2 px-3 py-2 bg-gray-800/50 border border-orange-600/30 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <input
              type="number"
              min="1"
              step="1"
              placeholder="Qtd"
              value={novoItem.quantidade}
              onChange={(e) => setNovoItem({ ...novoItem, quantidade: e.target.value })}
              className="px-3 py-2 bg-gray-800/50 border border-orange-600/30 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Custo unit. (R$)"
              value={novoItem.preco_custo}
              onChange={(e) => setNovoItem({ ...novoItem, preco_custo: e.target.value })}
              className="px-3 py-2 bg-gray-800/50 border border-orange-600/30 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Valor cobrado (R$)"
              value={novoItem.preco_unitario}
              onChange={(e) => setNovoItem({ ...novoItem, preco_unitario: e.target.value })}
              className="px-3 py-2 bg-gray-800/50 border border-orange-600/30 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <button
            type="submit"
            disabled={salvandoItem}
            className="mt-3 flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 disabled:opacity-50 text-white rounded-lg font-medium transition-all"
          >
            <Plus size={16} />
            {salvandoItem ? 'Adicionando...' : 'Adicionar Item'}
          </button>
        </form>
      </div>

      {/* Detalhes Técnicos */}
      <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-6 shadow-lg space-y-6 backdrop-blur">
        <h2 className="text-xl font-bold text-white border-b border-orange-600/30 pb-3">Detalhes Técnicos</h2>

        {/* Defeito Relatado */}
        <div>
          <label className="block text-sm font-semibold text-gray-100 mb-2">Defeito Relatado</label>
          {editando ? (
            <textarea
              value={formData.defeito_relatado}
              onChange={(e) => setFormData({ ...formData, defeito_relatado: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 bg-gray-800/50 border border-orange-600/30 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-orange-600"
            />
          ) : (
            <p className="text-gray-300 bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">{os.defeito_relatado}</p>
          )}
        </div>

        {/* Diagnóstico */}
        <div>
          <label className="block text-sm font-semibold text-gray-100 mb-2">Diagnóstico</label>
          {editando ? (
            <textarea
              value={formData.diagnostico}
              onChange={(e) => setFormData({ ...formData, diagnostico: e.target.value })}
              rows={3}
              placeholder="Digite o diagnóstico..."
              className="w-full px-4 py-3 bg-gray-800/50 border border-orange-600/30 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-orange-600"
            />
          ) : (
            <p className="text-gray-300 bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
              {os.diagnostico || 'Não foi feito diagnóstico ainda'}
            </p>
          )}
        </div>

        {/* Botão Salvar */}
        {editando && (
          <div className="flex gap-4 pt-4 border-t border-orange-600/30 flex-wrap">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white rounded-lg font-medium transition-all shadow-lg shadow-green-600/50"
            >
              <Save size={18} />
              Salvar Alterações
            </button>
            <button
              onClick={() => setEditando(false)}
              className="flex items-center gap-2 px-6 py-3 border border-gray-600/30 text-gray-300 rounded-lg font-medium hover:bg-gray-800/30 transition-colors"
            >
              <X size={18} />
              Cancelar
            </button>
          </div>
        )}
      </div>

      {/* Ações */}
      <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-6 shadow-lg backdrop-blur">
        <h2 className="text-xl font-bold text-white border-b border-orange-600/30 pb-3 mb-4">Ações</h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleConcluir}
            disabled={os.status === 'entregue' || os.status === 'cancelada'}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white rounded-lg font-medium transition-all shadow-lg shadow-green-600/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle size={18} />
            Finalizar OS
          </button>
          <button
            onClick={() => imprimirViasOS(window.open('', '_blank'))}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-600/50"
          >
            <Printer size={18} />
            Imprimir Vias da OS
          </button>
          <button
            onClick={() => imprimirGarantia(window.open('', '_blank'))}
            disabled={os.status !== 'concluida' && os.status !== 'entregue'}
            title={os.status !== 'concluida' && os.status !== 'entregue' ? 'Disponível quando o equipamento estiver pronto (Concluída ou Entregue)' : undefined}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white rounded-lg font-medium transition-all shadow-lg shadow-purple-600/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShieldCheck size={18} />
            Imprimir Vias da Garantia
          </button>
          <button
            onClick={handleDeletar}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-lg font-medium transition-all shadow-lg shadow-red-600/50"
          >
            <Trash2 size={18} />
            Deletar OS
          </button>
        </div>
      </div>
    </div>
  )
}
