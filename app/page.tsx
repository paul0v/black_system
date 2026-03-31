'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Redireciona para dashboard por padrão
    router.push('/dashboard')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <p className="text-gray-400">Redirecionando...</p>
    </div>
  )
}
