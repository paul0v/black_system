'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  Menu,
  X,
  Wrench,
  Package,
  ShoppingCart,
  Printer,
  Bell,
  BarChart3,
  Users,
  Settings,
  LogOut,
} from 'lucide-react'
import { logout } from '@/modules/auth/actions'
import type { AuthUser } from '@/modules/auth/types'
import { useRouter } from 'next/navigation'

interface SidebarProps {
  open: boolean
  onToggle: () => void
  user: AuthUser
}

const menuItems = [
  { label: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { label: 'Ordens de Serviço', href: '/os', icon: Wrench },
  { label: 'Clientes', href: '/clientes', icon: Users },
  { label: 'Estoque', href: '/estoque', icon: Package },
  { label: 'Vendas (PDV)', href: '/vendas', icon: ShoppingCart },
  { label: 'Documentos', href: '/impressao', icon: Printer },
  { label: 'Notificações', href: '/notificacoes', icon: Bell },
]

const adminMenuItems = [...menuItems, { label: 'Configurações', href: '/configuracoes', icon: Settings }]

export function Sidebar({ open, onToggle, user }: SidebarProps) {
  const router = useRouter()
  const items = user.perfil === 'admin' ? adminMenuItems : menuItems

  async function handleLogout() {
    const result = await logout()
    if (result.success) {
      router.push('/login')
      router.refresh()
    }
  }

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={onToggle}
        className="absolute top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-black text-orange-500 hover:bg-gray-900"
      >
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed md:relative w-64 h-screen bg-black border-r border-orange-600 flex flex-col transition-transform duration-300 z-40',
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-orange-600 bg-gradient-to-r from-black to-gray-900">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">
            ⚙️ Black Tech
          </h1>
          <p className="text-xs text-orange-500 mt-2 font-semibold">{user.perfil.toUpperCase()}</p>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-orange-600 hover:text-white transition-all duration-200 group"
              >
                <Icon size={20} className="group-hover:text-white transition-colors" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-orange-600 bg-gray-950 space-y-3">
          <div className="text-sm bg-gray-900 p-3 rounded-lg border border-orange-600/30">
            <p className="text-orange-500 text-xs font-semibold uppercase">Usuário</p>
            <p className="text-white font-semibold mt-1 truncate">{user.nome}</p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
          >
            <LogOut size={18} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onToggle}
        />
      )}
    </>
  )
}
