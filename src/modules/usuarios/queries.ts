'use server'

import { checarPerfil } from '@/lib/auth/session'
import { FirestoreUsuarioRepository } from '@/infrastructure/firestore/usuario-repository'
import { listarUsuariosUseCase } from '@/application/usuarios/gerenciar-usuario'

const usuarioRepo = new FirestoreUsuarioRepository()

export async function buscarUsuarios() {
  const bloqueio = await checarPerfil(['admin'])
  if (bloqueio) return []

  try {
    return await listarUsuariosUseCase(usuarioRepo)
  } catch (err) {
    console.error('Erro ao buscar usuários:', err)
    return []
  }
}
