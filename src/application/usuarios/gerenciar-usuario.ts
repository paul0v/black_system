import type { UsuarioRepository } from '@/domain/usuarios/repository'
import type { NovoUsuario, Usuario, UserProfile } from '@/domain/usuarios/entities'

export function criarUsuarioUseCase(repo: UsuarioRepository, dados: NovoUsuario): Promise<{ id: string }> {
  return repo.criar(dados)
}

export function atualizarPerfilUsuarioUseCase(repo: UsuarioRepository, id: string, perfil: UserProfile): Promise<void> {
  return repo.atualizarPerfil(id, perfil)
}

export function alternarAtivoUsuarioUseCase(repo: UsuarioRepository, id: string, ativo: boolean): Promise<void> {
  return repo.alternarAtivo(id, ativo)
}

export function listarUsuariosUseCase(repo: UsuarioRepository): Promise<Usuario[]> {
  return repo.listarTodos()
}
