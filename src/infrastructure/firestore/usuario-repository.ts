import { createClient } from '@/lib/firebase/server'
import type { UsuarioRepository } from '@/domain/usuarios/repository'
import type { Usuario, NovoUsuario, UserProfile } from '@/domain/usuarios/entities'

export class FirestoreUsuarioRepository implements UsuarioRepository {
  async criar(dados: NovoUsuario): Promise<{ id: string }> {
    const db = await createClient()
    const { data, error } = await db.auth.signUp({
      email: dados.email,
      password: dados.password,
      options: { data: { nome: dados.nome, perfil: dados.perfil } },
    })

    if (error) throw new Error(error.message)

    return { id: data?.user?.id || '' }
  }

  async atualizarPerfil(id: string, perfil: UserProfile): Promise<void> {
    const db = await createClient()
    const { error } = await db.from('usuarios').update({ perfil }).eq('id', id)
    if (error) throw error
  }

  async alternarAtivo(id: string, ativo: boolean): Promise<void> {
    const db = await createClient()
    const { error } = await db.from('usuarios').update({ ativo }).eq('id', id)
    if (error) throw error
  }

  async listarTodos(): Promise<Usuario[]> {
    const db = await createClient()
    const { data, error } = await db.from('usuarios').select()
    if (error) throw error
    return (data || []).sort((a: any, b: any) => (a.nome || '').localeCompare(b.nome || ''))
  }
}
