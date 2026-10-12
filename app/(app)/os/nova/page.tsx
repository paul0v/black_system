'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Camera, X } from 'lucide-react'
import { criarOS, criarCliente } from '@/modules/os/actions'
import { buscarTodosClientes } from '@/modules/os/queries'
import { CHECKLIST_ENTRADA_ITENS } from '@/modules/os/checklist'
import { PatternLockInput } from '@/components/os/pattern-lock'
import { SeletorCliente } from '@/components/os/seletor-cliente'
import { baixarPDFOS } from '@/lib/impressao/gerar-pdf-os'
import { buscarConfiguracaoEmpresa, buscarPreferencias } from '@/modules/configuracoes/queries'
import { comprimirImagem } from '@/lib/utils/comprimir-imagem'

const MAX_FOTOS = 10

export default function NovaOSPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [clientes, setClientes] = useState<any[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    cliente_id: '',
    cliente_nome: '',
    cliente_telefone: '',
    defeito_relatado: '',
    equipamento_tipo: 'celular',
    equipamento_marca: '',
    equipamento_modelo: '',
    equipamento_imei: '',
    acessorios_entregues: '',
  })

  const [criarNovoCliente, setCriarNovoCliente] = useState(false)

  const [checklist, setChecklist] = useState<Record<string, boolean>>({})
  const [checklistItens, setChecklistItens] = useState(CHECKLIST_ENTRADA_ITENS)
  const [prazos, setPrazos] = useState({ prazoRetiradaDias: 30, prazoAbandonoDias: 90 })
  const [fotos, setFotos] = useState<string[]>([])
  const [enviandoFoto, setEnviandoFoto] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [senhaTipo, setSenhaTipo] = useState<'nenhuma' | 'padrao' | 'pin' | 'senha'>('nenhuma')
  const [senhaValor, setSenhaValor] = useState('')

  const toggleChecklistItem = (chave: string) => {
    setChecklist(prev => ({ ...prev, [chave]: !prev[chave] }))
  }

  const handleFotosSelecionadas = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivos = Array.from(e.target.files || [])
    if (!arquivos.length) return

    setEnviandoFoto(true)
    try {
      const restante = MAX_FOTOS - fotos.length
      const selecionados = arquivos.slice(0, restante)
      const novasFotos = await Promise.all(selecionados.map(arquivo => comprimirImagem(arquivo)))
      setFotos(prev => [...prev, ...novasFotos])
    } catch (err) {
      setError('Erro ao processar as fotos')
    } finally {
      setEnviandoFoto(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const removerFoto = (index: number) => {
    setFotos(prev => prev.filter((_, i) => i !== index))
  }

  useEffect(() => {
    async function carregarClientes() {
      try {
        const dados = await buscarTodosClientes()
        setClientes(dados)
      } catch (err) {
        console.error('Erro ao carregar clientes:', err)
      }
    }

    async function carregarPreferencias() {
      try {
        const prefs = await buscarPreferencias()
        setChecklistItens(prefs.checklistEntrada)
        setPrazos({ prazoRetiradaDias: prefs.prazoRetiradaDias, prazoAbandonoDias: prefs.prazoAbandonoDias })
      } catch (err) {
        console.error('Erro ao carregar preferências:', err)
      }
    }

    carregarClientes()
    carregarPreferencias()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    // Precisa abrir a janela ANTES dos awaits abaixo, senão o navegador
    // bloqueia como pop-up (perde o gesto do clique do usuário).
    const janelaImpressao = window.open('', '_blank')

    try {
      let clienteId = formData.cliente_id

      // Se está criando novo cliente
      if (criarNovoCliente) {
        const resultCliente = await criarCliente({
          nome: formData.cliente_nome,
          telefone: formData.cliente_telefone,
        })

        if (!resultCliente.success || !resultCliente.id) {
          janelaImpressao?.close()
          setError('Erro ao criar cliente')
          setLoading(false)
          return
        }

        clienteId = resultCliente.id
      }

      if (!clienteId) {
        janelaImpressao?.close()
        setError('Selecione ou crie um cliente')
        setLoading(false)
        return
      }

      // Criar OS
      const result = await criarOS({
        cliente_id: clienteId,
        defeito_relatado: formData.defeito_relatado,
        equipamento_tipo: formData.equipamento_tipo,
        equipamento_marca: formData.equipamento_marca,
        equipamento_modelo: formData.equipamento_modelo,
        equipamento_imei: formData.equipamento_imei,
        acessorios_entregues: formData.acessorios_entregues,
        equipamento_checklist: checklist,
        equipamento_fotos: fotos,
        equipamento_senha_tipo: senhaTipo,
        equipamento_senha_valor: senhaValor,
      })

      if (result.success) {
        setSuccess(result.message || 'OS criada com sucesso')

        const clienteSelecionado = clientes.find((c) => c.id === clienteId)
        const clienteNome = criarNovoCliente ? formData.cliente_nome : (clienteSelecionado?.nome || '')
        const clienteTelefone = criarNovoCliente ? formData.cliente_telefone : (clienteSelecionado?.telefone || '')

        try {
          const empresa = await buscarConfiguracaoEmpresa()
          await baixarPDFOS({
            numero: result.numero || result.id || '',
            cliente: {
              nome: clienteNome,
              telefone: clienteTelefone,
              email: clienteSelecionado?.email,
            },
            equipamento: {
              tipo: formData.equipamento_tipo,
              marca: formData.equipamento_marca,
              modelo: formData.equipamento_modelo,
              imei: formData.equipamento_imei,
              acessorios: formData.acessorios_entregues,
            },
            defeito: formData.defeito_relatado,
            dataEntrada: new Date(),
            empresa,
            prazoRetiradaDias: prazos.prazoRetiradaDias,
            prazoAbandonoDias: prazos.prazoAbandonoDias,
          }, undefined, janelaImpressao)
        } catch (pdfErr) {
          janelaImpressao?.close()
          console.error('Erro ao gerar impressão da OS:', pdfErr)
        }

        setTimeout(() => {
          router.push('/os')
        }, 2000)
      } else {
        janelaImpressao?.close()
        setError(result.error || 'Erro ao criar ordem de serviço')
      }
    } catch (err) {
      janelaImpressao?.close()
      setError('Erro ao criar ordem de serviço')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <Link
          href="/os"
          className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-400 mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          Voltar para Ordens
        </Link>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-400 mb-8">
            Nova Ordem de Serviço
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Opção: Cliente Existente ou Novo */}
            <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
              <label className="flex items-center gap-3 cursor-pointer mb-3">
                <input
                  type="radio"
                  name="cliente_type"
                  checked={!criarNovoCliente}
                  onChange={() => setCriarNovoCliente(false)}
                  className="w-4 h-4 accent-orange-500"
                />
                <span className="font-medium">Cliente Existente</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="cliente_type"
                  checked={criarNovoCliente}
                  onChange={() => setCriarNovoCliente(true)}
                  className="w-4 h-4 accent-orange-500"
                />
                <span className="font-medium">Criar Novo Cliente</span>
              </label>
            </div>

            {/* Cliente */}
            {!criarNovoCliente ? (
              <div>
                <label className="block text-sm font-semibold text-orange-400 mb-2">
                  Selecione o Cliente *
                </label>
                <SeletorCliente
                  clientesIniciais={clientes}
                  value={formData.cliente_id}
                  onChange={(clienteId) => setFormData({ ...formData, cliente_id: clienteId })}
                  required={!criarNovoCliente}
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-semibold text-orange-400 mb-2">
                    Nome do Cliente *
                  </label>
                  <input
                    type="text"
                    value={formData.cliente_nome}
                    onChange={(e) => setFormData({ ...formData, cliente_nome: e.target.value })}
                    required={criarNovoCliente}
                    placeholder="João Silva"
                    className="w-full px-4 py-2.5 bg-gray-800/50 border border-orange-600/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-orange-400 mb-2">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={formData.cliente_telefone}
                    onChange={(e) => setFormData({ ...formData, cliente_telefone: e.target.value })}
                    placeholder="11999999999"
                    className="w-full px-4 py-2.5 bg-gray-800/50 border border-orange-600/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </>
            )}

            {/* Equipamento */}
            <div className="border-t border-orange-600/20 pt-6">
              <h2 className="text-lg font-semibold text-white mb-4">Equipamento</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-orange-400 mb-2">
                    Tipo de Equipamento *
                  </label>
                  <select
                    value={formData.equipamento_tipo}
                    onChange={(e) => setFormData({ ...formData, equipamento_tipo: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 bg-gray-800/50 border border-orange-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="celular">Celular</option>
                    <option value="notebook">Notebook</option>
                    <option value="tablet">Tablet</option>
                    <option value="console">Console</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-orange-400 mb-2">
                    IMEI ou Serial *
                  </label>
                  <input
                    type="text"
                    value={formData.equipamento_imei}
                    onChange={(e) => setFormData({ ...formData, equipamento_imei: e.target.value })}
                    required
                    placeholder="12345678901234567"
                    className="w-full px-4 py-2.5 bg-gray-800/50 border border-orange-600/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-orange-400 mb-2">
                    Marca *
                  </label>
                  <input
                    type="text"
                    value={formData.equipamento_marca}
                    onChange={(e) => setFormData({ ...formData, equipamento_marca: e.target.value })}
                    required
                    placeholder="Ex: Samsung"
                    className="w-full px-4 py-2.5 bg-gray-800/50 border border-orange-600/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-orange-400 mb-2">
                    Modelo *
                  </label>
                  <input
                    type="text"
                    value={formData.equipamento_modelo}
                    onChange={(e) => setFormData({ ...formData, equipamento_modelo: e.target.value })}
                    required
                    placeholder="Ex: Galaxy A13"
                    className="w-full px-4 py-2.5 bg-gray-800/50 border border-orange-600/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-orange-400 mb-2">
                  Acessórios Entregues
                </label>
                <input
                  type="text"
                  value={formData.acessorios_entregues}
                  onChange={(e) => setFormData({ ...formData, acessorios_entregues: e.target.value })}
                  placeholder="Cabo, carregador, capa, etc..."
                  className="w-full px-4 py-2.5 bg-gray-800/50 border border-orange-600/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Checklist de Entrada */}
            <div className="border-t border-orange-600/20 pt-6">
              <h2 className="text-lg font-semibold text-white mb-1">Checklist de Entrada</h2>
              <p className="text-sm text-gray-400 mb-4">
                Vistoria de conferência do aparelho no recebimento, para segurança da assistência técnica.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-gray-800/30 border border-gray-700/50 rounded-lg p-4">
                {checklistItens.map((item) => (
                  <label
                    key={item.chave}
                    className="flex items-center gap-3 cursor-pointer py-1.5 px-2 rounded-lg hover:bg-gray-800/60 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={!!checklist[item.chave]}
                      onChange={() => toggleChecklistItem(item.chave)}
                      className="w-4 h-4 accent-orange-500"
                    />
                    <span className="text-sm text-gray-200">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Fotos do Equipamento */}
            <div className="border-t border-orange-600/20 pt-6">
              <h2 className="text-lg font-semibold text-white mb-1">Fotos do Equipamento</h2>
              <p className="text-sm text-gray-400 mb-4">
                Registre fotos do estado atual do aparelho (tela, carcaça, avarias) para maior segurança.
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                onChange={handleFotosSelecionadas}
                disabled={fotos.length >= MAX_FOTOS || enviandoFoto}
                className="hidden"
                id="input-fotos"
              />

              <label
                htmlFor="input-fotos"
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-orange-600/30 text-orange-400 transition-all ${
                  fotos.length >= MAX_FOTOS || enviandoFoto
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer hover:bg-orange-600/10'
                }`}
              >
                {enviandoFoto ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
                {enviandoFoto ? 'Processando...' : 'Tirar Foto / Escolher Imagem'}
              </label>
              <span className="ml-3 text-sm text-gray-500">{fotos.length}/{MAX_FOTOS} fotos</span>

              {fotos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                  {fotos.map((foto, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={foto}
                        alt={`Foto do equipamento ${index + 1}`}
                        className="w-full h-28 object-cover rounded-lg border border-gray-700"
                      />
                      <button
                        type="button"
                        onClick={() => removerFoto(index)}
                        className="absolute top-1 right-1 p-1 bg-red-600/90 hover:bg-red-700 text-white rounded-full transition-colors"
                        title="Remover foto"
                        aria-label={`Remover foto ${index + 1}`}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Senha do Aparelho */}
            <div className="border-t border-orange-600/20 pt-6">
              <h2 className="text-lg font-semibold text-white mb-1">Senha do Aparelho</h2>
              <p className="text-sm text-gray-400 mb-4">
                Necessária para testes e diagnóstico. Fica registrada apenas na OS.
              </p>

              <div className="flex flex-wrap gap-4 mb-4">
                {[
                  { valor: 'nenhuma', label: 'Nenhuma' },
                  { valor: 'padrao', label: 'Padrão' },
                  { valor: 'pin', label: 'PIN' },
                  { valor: 'senha', label: 'Senha' },
                ].map((opcao) => (
                  <label key={opcao.valor} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="senha_tipo"
                      checked={senhaTipo === opcao.valor}
                      onChange={() => {
                        setSenhaTipo(opcao.valor as typeof senhaTipo)
                        setSenhaValor('')
                      }}
                      className="w-4 h-4 accent-orange-500"
                    />
                    <span className="text-sm text-gray-200">{opcao.label}</span>
                  </label>
                ))}
              </div>

              {senhaTipo === 'padrao' && (
                <PatternLockInput value={senhaValor} onChange={setSenhaValor} />
              )}

              {senhaTipo === 'pin' && (
                <input
                  type="text"
                  inputMode="numeric"
                  value={senhaValor}
                  onChange={(e) => setSenhaValor(e.target.value.replace(/\D/g, ''))}
                  placeholder="Ex: 1234"
                  maxLength={8}
                  className="w-full max-w-xs px-4 py-2.5 bg-gray-800/50 border border-orange-600/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              )}

              {senhaTipo === 'senha' && (
                <input
                  type="text"
                  value={senhaValor}
                  onChange={(e) => setSenhaValor(e.target.value)}
                  placeholder="Senha do aparelho"
                  className="w-full max-w-xs px-4 py-2.5 bg-gray-800/50 border border-orange-600/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              )}
            </div>

            {/* Defeito */}
            <div>
              <label className="block text-sm font-semibold text-orange-400 mb-2">
                Defeito Relatado *
              </label>
              <textarea
                value={formData.defeito_relatado}
                onChange={(e) => setFormData({ ...formData, defeito_relatado: e.target.value })}
                required
                placeholder="Descreva o problema do equipamento..."
                rows={5}
                className="w-full px-4 py-2.5 bg-gray-800/50 border border-orange-600/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Mensagens */}
            {error && (
              <div className="p-3 bg-red-500/15 border border-red-500/50 rounded-lg text-red-400 text-sm">
                ⚠️ {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-500/15 border border-green-500/50 rounded-lg text-green-400 text-sm">
                ✓ {success}
              </div>
            )}

            {/* Botões */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 disabled:opacity-50 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                {loading ? 'Criando...' : 'Criar Ordem de Serviço'}
              </button>

              <Link
                href="/os"
                className="py-3 px-6 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-all"
              >
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
