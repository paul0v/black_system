import type { OSRepository, EstatisticasOS } from '@/domain/os/repository'
import type { OrdemServico, ItemOS } from '@/domain/os/entities'

export function listarOSRecentesUseCase(repo: OSRepository, limite: number): Promise<OrdemServico[]> {
  return repo.listarRecentes(limite)
}

export function buscarOSPorIdUseCase(repo: OSRepository, id: string): Promise<OrdemServico | null> {
  return repo.buscarPorId(id)
}

export function listarItensPorOSUseCase(repo: OSRepository, osId: string): Promise<ItemOS[]> {
  return repo.listarItens(osId)
}

export function listarOSPorClienteUseCase(repo: OSRepository, clienteId: string): Promise<OrdemServico[]> {
  return repo.listarPorCliente(clienteId)
}

export function buscarEstatisticasOSUseCase(repo: OSRepository): Promise<EstatisticasOS> {
  return repo.estatisticas()
}
