import { redirect } from 'next/navigation'
import { obterSessao } from '@/lib/auth/session'
import { MainLayout } from '@/components/layout/main-layout'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const sessao = await obterSessao()

  if (!sessao) {
    redirect('/login')
  }

  return (
    <MainLayout
      user={{
        id: sessao.uid,
        email: sessao.email,
        perfil: sessao.perfil,
        nome: sessao.nome,
        ativo: true,
        criado_em: '',
        atualizado_em: null,
      }}
    >
      {children}
    </MainLayout>
  )
}
