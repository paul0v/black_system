import type { Usuario, NovoUsuario, UserProfile } from './entities'

export interface UsuarioRepository {
  criar(dados: NovoUsuario): Promise<{ id: string }>
  atualizarPerfil(id: string, perfil: UserProfile): Promise<void>
  alternarAtivo(id: string, ativo: boolean): Promise<void>
  listarTodos(): Promise<Usuario[]>
}
