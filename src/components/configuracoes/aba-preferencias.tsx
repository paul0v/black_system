'use client'

import { useEffect, useState } from 'react'
import { Save, Loader2, Plus, Trash2 } from 'lucide-react'
import { buscarPreferencias } from '@/modules/configuracoes/queries'
import { salvarPreferencias } from '@/modules/configuracoes/actions'
import type { ConfiguracaoPreferencias } from '@/modules/configuracoes/types'

const ACENTOS: Record<string, string> = {
  a: 'áàâãä', e: 'éèêë', i: 'íìîï', o: 'óòôõö', u: 'úùûü', c: 'ç', n: 'ñ',
}

function removerAcentos(texto: string): string {
  let resultado = texto
  for (const [semAcento, comAcento] of Object.entries(ACENTOS)) {
    for (const letra of comAcento) {
      resultado = resultado.split(letra).join(semAcento)
    }
  }
  return resultado
}

function gerarChave(label: string): string {
  const slug = removerAcentos(label.toLowerCase())
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
  return slug || `item_${Date.now()}`
}

export function AbaPreferencias() {
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [novoItem, setNovoItem] = useState('')
  const [form, setForm] = useState<ConfiguracaoPreferencias>({
    checklistEntrada: [],
    estoqueMinimoPadrao: 1,
    prazoRetiradaDias: 30,
    prazoAbandonoDias: 90,
  })

  useEffect(() => {
    buscarPreferencias()
      .then(setForm)
      .catch(() => setError('Erro ao carregar preferências'))
      .finally(() => setLoading(false))
  }, [])

  function adicionarItemChecklist() {
    const label = novoItem.trim()
    if (!label) return
    setForm((f) => ({
      ...f,
      checklistEntrada: [...f.checklistEntrada, { chave: gerarChave(label), label }],
    }))
    setNovoItem('')
  }

  function removerItemChecklist(chave: string) {
    setForm((f) => ({ ...f, checklistEntrada: f.checklistEntrada.filter((i) => i.chave !== chave) }))
  }

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSalvando(true)
    try {
      const result = await salvarPreferencias(form)
      if (result.success) {
        setSuccess(result.message || 'Preferências salvas com sucesso')
      } else {
        setError(result.error || 'Erro ao salvar preferências')
      }
    } catch {
      setError('Erro ao salvar preferências')
    } finally {
      setSalvando(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-8 text-center">
        <p className="text-orange-400 font-medium">Carregando...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSalvar} className="space-y-6 max-w-2xl">
      <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-6 space-y-4">
        <h3 className="text-lg font-bold text-orange-400">Checklist de Entrada (Nova OS)</h3>
        <p className="text-sm text-gray-400">Itens conferidos na recepção do equipamento, exibidos no formulário de nova OS.</p>

        <div className="space-y-2">
          {form.checklistEntrada.map((item) => (
            <div key={item.chave} className="flex items-center justify-between gap-3 px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg">
              <span className="text-sm text-gray-200">{item.label}</span>
              <button
                type="button"
                onClick={() => removerItemChecklist(item.chave)}
                className="p-1.5 text-red-500 hover:bg-red-950/30 rounded transition-colors"
                title="Remover"
                aria-label={`Remover item do checklist: ${item.label}`}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {form.checklistEntrada.length === 0 && (
            <p className="text-sm text-gray-500">Nenhum item no checklist.</p>
          )}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={novoItem}
            onChange={(e) => setNovoItem(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); adicionarItemChecklist() } }}
            placeholder="Novo item do checklist..."
            className="flex-1 px-4 py-2.5 bg-gray-800/50 border border-orange-600/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            type="button"
            onClick={adicionarItemChecklist}
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
          >
            <Plus size={18} />
            Adicionar
          </button>
        </div>
      </div>

      <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-6 space-y-4">
        <h3 className="text-lg font-bold text-orange-400">Estoque</h3>
        <div>
          <label className="block text-sm font-semibold text-orange-400 mb-2">Estoque Mínimo Padrão (novos produtos)</label>
          <input
            type="number"
            min="0"
            value={form.estoqueMinimoPadrao}
            onChange={(e) => setForm({ ...form, estoqueMinimoPadrao: Number(e.target.value) || 0 })}
            className="w-full max-w-xs px-4 py-2.5 bg-gray-800/50 border border-orange-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-6 space-y-4">
        <h3 className="text-lg font-bold text-orange-400">Prazos da Cláusula de Retirada (impressão da OS)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-orange-400 mb-2">Prazo de Retirada (dias)</label>
            <input
              type="number"
              min="1"
              value={form.prazoRetiradaDias}
              onChange={(e) => setForm({ ...form, prazoRetiradaDias: Number(e.target.value) || 0 })}
              className="w-full px-4 py-2.5 bg-gray-800/50 border border-orange-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-orange-400 mb-2">Prazo de Abandono (dias)</label>
            <input
              type="number"
              min="1"
              value={form.prazoAbandonoDias}
              onChange={(e) => setForm({ ...form, prazoAbandonoDias: Number(e.target.value) || 0 })}
              className="w-full px-4 py-2.5 bg-gray-800/50 border border-orange-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-500/15 border border-red-500/50 rounded-lg text-red-400 text-sm font-medium">
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-500/15 border border-green-500/50 rounded-lg text-green-400 text-sm font-medium">
          ✓ {success}
        </div>
      )}

      <button
        type="submit"
        disabled={salvando}
        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 disabled:opacity-50 text-white font-semibold rounded-lg transition-all"
      >
        {salvando ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
        {salvando ? 'Salvando...' : 'Salvar Preferências'}
      </button>
    </form>
  )
}
