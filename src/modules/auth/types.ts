/**
 * Módulo de Autenticação - Tipos
 * Definições de tipos para login, signup, usuário autenticado
 */

export type UserProfile = 'admin' | 'tecnico' | 'atendente'

export type LoginInput = {
  email: string
  password: string
}

export type SignupInput = {
  email: string
  password: string
  confirmPassword: string
  nome: string
  perfil: UserProfile
}

export type AuthUser = {
  id: string
  email: string
  nome: string
  perfil: UserProfile
  ativo: boolean
  criado_em: string
  atualizado_em: string | null
}

export type AuthResponse = {
  success: boolean
  error?: string
  usuario?: Omit<AuthUser, 'criado_em' | 'atualizado_em'>
}
