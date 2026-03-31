import { redirect } from 'next/navigation'
import { getSession, getCurrentUser } from '@/modules/auth/actions'
import { MainLayout } from '@/components/layout/main-layout'

export const metadata = {
  title: 'Ordens de Serviço - Sistema de Assistência Técnica',
  description: 'Gerencie suas ordens de serviço',
}

export default async function OSLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  const user = await getCurrentUser()

  if (!session || !user) {
    redirect('/login')
  }

  return <MainLayout user={user}>{children}</MainLayout>
}
