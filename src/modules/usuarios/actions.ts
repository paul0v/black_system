'use server'

import { signupSchema } from '@/modules/auth/schema'
import type { UserProfile } from '@/modules/auth/types'
import { checarPerfil } from '@/lib/auth/session'
import { mensagemDeValidacao } from '@/lib/validacao'
import { FirestoreUsuarioRepository } from '@/infrastructure/firestore/usuario-repository'
import {
  criarUsuarioUseCase,
  atualizarPerfilUsuarioUseCase,
  alternarAtivoUsuarioUseCase,
} from '@/application/usuarios/gerenciar-usuario'

const usuarioRepo = new FirestoreUsuarioRepository()

export async function criarUsuario(input: {
  nome: string
  email: string
  password: string
  perfil: UserProfile
}) {
  const bloqueio = await checarPerfil(['admin'])
  if (bloqueio) return bloqueio

  try {
    const validated = signupSchema.parse({ ...input, confirmPassword: input.password })
    const resultado = await criarUsuarioUseCase(usuarioRepo, validated)
    return { success: true, message: 'Usuário criado com sucesso', id: resultado.id }
  } catch (err) {
    const error = mensagemDeValidacao(err) || (err instanceof Error ? err.message : 'Erro ao criar usuário')
    return { success: false, error }
  }
}

export async function atualizarPerfilUsuario(id: string, perfil: UserProfile) {
  const bloqueio = await checarPerfil(['admin'])
  if (bloqueio) return bloqueio

  try {
    await atualizarPerfilUsuarioUseCase(usuarioRepo, id, perfil)
    return { success: true, message: 'Perfil atualizado com sucesso' }
  } catch (err) {
    console.error('Erro ao atualizar perfil:', err)
    return { success: false, error: 'Erro ao atualizar perfil' }
  }
}

export async function alternarAtivoUsuario(id: string, ativo: boolean) {
  const bloqueio = await checarPerfil(['admin'])
  if (bloqueio) return bloqueio

  try {
    await alternarAtivoUsuarioUseCase(usuarioRepo, id, ativo)
    return { success: true, message: ativo ? 'Usuário reativado' : 'Usuário desativado' }
  } catch (err) {
    console.error('Erro ao alterar status do usuário:', err)
    return { success: false, error: 'Erro ao alterar status do usuário' }
  }
}
