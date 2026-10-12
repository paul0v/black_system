import type { OSRepository } from '@/domain/os/repository'

export async function atualizarOSUseCase(repo: OSRepository, osId: string, dados: Record<string, any>): Promise<void> {
  await repo.atualizarCampos(osId, dados)
}

export async function deletarOSUseCase(repo: OSRepository, osId: string): Promise<void> {
  await repo.deletar(osId)
}

export async function aprovarOrcamentoUseCase(repo: OSRepository, osId: string, valor: number): Promise<void> {
  await repo.aprovarOrcamento(osId, valor)
}
