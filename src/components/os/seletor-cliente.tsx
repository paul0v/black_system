'use client'

import { useEffect, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { buscarClientesPorNome } from '@/modules/os/queries'

interface ClienteOpcao {
  id: string
  nome: string
  telefone?: string
}

interface SeletorClienteProps {
  clientesIniciais: ClienteOpcao[]
  value: string
  onChange: (clienteId: string) => void
  required?: boolean
}

/**
 * Combobox com busca server-side — em vez de carregar TODOS os clientes num
 * <select>, mostra uma lista inicial curta e busca no servidor conforme o
 * usuário digita, então clientes antigos continuam encontráveis mesmo com a
 * listagem limitada (ver buscarClientesPorNome).
 */
export function SeletorCliente({ clientesIniciais, value, onChange, required }: SeletorClienteProps) {
  const [termo, setTermo] = useState('')
  const [opcoes, setOpcoes] = useState<ClienteOpcao[]>(clientesIniciais)
  const [aberto, setAberto] = useState(false)
  const [buscando, setBuscando] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const clienteSelecionado = opcoes.find((c) => c.id === value) || clientesIniciais.find((c) => c.id === value)

  useEffect(() => {
    if (!termo.trim()) {
      setOpcoes(clientesIniciais)
      return
    }

    setBuscando(true)
    const timeout = setTimeout(async () => {
      try {
        const resultado = await buscarClientesPorNome(termo)
        setOpcoes(resultado)
      } catch (err) {
        console.error('Erro ao buscar clientes:', err)
      } finally {
        setBuscando(false)
      }
    }, 300)

    return () => clearTimeout(timeout)
  }, [termo, clientesIniciais])

  useEffect(() => {
    function handleClickFora(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setAberto(false)
      }
    }
    document.addEventListener('mousedown', handleClickFora)
    return () => document.removeEventListener('mousedown', handleClickFora)
  }, [])

  if (clienteSelecionado && !aberto) {
    return (
      <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-800/50 border border-orange-600/30 rounded-lg text-white">
        <span className="flex-1 truncate">
          {clienteSelecionado.nome} {clienteSelecionado.telefone ? `(${clienteSelecionado.telefone})` : ''}
        </span>
        <button
          type="button"
          onClick={() => {
            onChange('')
            setTermo('')
            setAberto(true)
          }}
          className="text-gray-400 hover:text-red-400 flex-shrink-0"
          aria-label="Trocar cliente selecionado"
        >
          <X size={18} />
        </button>
      </div>
    )
  }

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          onFocus={() => setAberto(true)}
          placeholder="Digite o nome do cliente..."
          required={required && !value}
          className="w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-orange-600/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {aberto && (
        <div className="absolute z-20 mt-1 w-full max-h-60 overflow-y-auto bg-gray-800 border border-orange-600/30 rounded-lg shadow-xl">
          {buscando ? (
            <p className="px-4 py-3 text-sm text-gray-400">Buscando...</p>
          ) : opcoes.length === 0 ? (
            <p className="px-4 py-3 text-sm text-gray-400">Nenhum cliente encontrado</p>
          ) : (
            opcoes.map((cliente) => (
              <button
                key={cliente.id}
                type="button"
                onClick={() => {
                  onChange(cliente.id)
                  setTermo('')
                  setAberto(false)
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-200 hover:bg-orange-600/20 transition-colors"
              >
                {cliente.nome} {cliente.telefone ? `(${cliente.telefone})` : ''}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
