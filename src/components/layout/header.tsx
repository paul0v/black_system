'use client'

import { Menu } from 'lucide-react'
import type { AuthUser } from '@/modules/auth/types'

interface HeaderProps {
  user: AuthUser
  onMenuClick: () => void
}

export function Header({ user, onMenuClick }: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-black to-gray-900 border-b border-orange-600 px-6 py-4 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg hover:bg-gray-800 text-orange-500 transition-colors"
        >
          <Menu size={24} />
        </button>
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-400">
          🔧 Sistema de Gestão
        </h2>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-sm text-gray-300 text-right">
          <p className="font-semibold text-white">{user.nome}</p>
          <p className="text-xs text-orange-500 uppercase font-bold">{user.perfil}</p>
        </div>
        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-lg">{user.nome.charAt(0).toUpperCase()}</span>
        </div>
      </div>
    </header>
  )
}
