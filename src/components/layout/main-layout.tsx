'use client'

import { useState } from 'react'
import { Sidebar } from './sidebar'
import { Header } from './header'
import type { AuthUser } from '@/modules/auth/types'

interface MainLayoutProps {
  children: React.ReactNode
  user: AuthUser
}

export function MainLayout({ children, user }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen bg-gray-950">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} user={user} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header user={user} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6 bg-gradient-to-br from-gray-950 via-gray-900 to-black">
          {children}
        </main>
      </div>
    </div>
  )
}
