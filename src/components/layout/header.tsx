'use client'

import { Menu, X } from 'lucide-react'
import type { AuthUser } from '@/modules/auth/types'

interface HeaderProps {
  user: AuthUser
  onMenuClick: () => void
  sidebarOpen: boolean
}

export function Header({ user, onMenuClick, sidebarOpen }: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-black to-gray-900 border-b border-orange-600 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2 shadow-lg">
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg hover:bg-gray-800 text-orange-500 transition-colors flex-shrink-0"
          aria-label={sidebarOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={sidebarOpen}
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <div className="flex items-center gap-2 min-w-0">
          <img src="/logo-blackcell.png" alt="BlackCell" className="w-8 h-8 rounded-md flex-shrink-0 md:hidden" />
          <h2 className="text-base sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-400 truncate">
            Sistema de Gestão
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0">
        <div className="hidden sm:block text-sm text-gray-300 text-right">
          <p className="font-semibold text-white">{user.nome}</p>
          <p className="text-xs text-orange-500 uppercase font-bold">{user.perfil}</p>
        </div>
        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-base sm:text-lg">{user.nome.charAt(0).toUpperCase()}</span>
        </div>
      </div>
    </header>
  )
}
