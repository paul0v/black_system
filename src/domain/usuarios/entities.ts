export type UserProfile = 'admin' | 'tecnico' | 'atendente'

export interface Usuario {
  id: string
  nome: string
  email: string
  perfil: UserProfile
  ativo: boolean
}

export interface NovoUsuario {
  nome: string
  email: string
  password: string
  perfil: UserProfile
}
