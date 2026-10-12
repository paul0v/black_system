'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Building2, Users, MessageCircle, SlidersHorizontal } from 'lucide-react'
import { AbaEmpresa } from '@/components/configuracoes/aba-empresa'
import { AbaUsuarios } from '@/components/configuracoes/aba-usuarios'
import { AbaWhatsApp } from '@/components/configuracoes/aba-whatsapp'
import { AbaPreferencias } from '@/components/configuracoes/aba-preferencias'

const ABAS = [
  { id: 'empresa', label: 'Empresa', icon: Building2 },
  { id: 'usuarios', label: 'Usuários', icon: Users },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { id: 'preferencias', label: 'Preferências', icon: SlidersHorizontal },
] as const

type AbaId = (typeof ABAS)[number]['id']

export default function ConfiguracoesPage() {
  const router = useRouter()
  const [aba, setAba] = useState<AbaId>('empresa')

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-orange-600/50 transition-all text-gray-300 hover:text-orange-400"
      >
        <ArrowLeft size={20} />
        <span>Voltar</span>
      </button>

      <div className="border-b border-orange-600/30 pb-6">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">Configurações</h1>
        <p className="text-gray-400 mt-2 text-base sm:text-lg">Empresa, usuários, integrações e preferências do sistema</p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-gray-800 pb-3">
        {ABAS.map((item) => {
          const Icon = item.icon
          const ativa = aba === item.id
          return (
            <button
              key={item.id}
              onClick={() => setAba(item.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                ativa
                  ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg shadow-orange-600/30'
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800 border border-gray-700/50'
              }`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          )
        })}
      </div>

      {aba === 'empresa' && <AbaEmpresa />}
      {aba === 'usuarios' && <AbaUsuarios />}
      {aba === 'whatsapp' && <AbaWhatsApp />}
      {aba === 'preferencias' && <AbaPreferencias />}
    </div>
  )
}
