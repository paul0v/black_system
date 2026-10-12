import type { OSRepository } from '@/domain/os/repository'
import type { NovoItemOS, ItemOS } from '@/domain/os/entities'

export interface AdicionarItemResultado {
  item: ItemOS
  valorOrcamento: number
}

export async function adicionarItemOSUseCase(repo: OSRepository, dados: NovoItemOS): Promise<AdicionarItemResultado> {
  const item = await repo.adicionarItem(dados)
  const valorOrcamento = await repo.sincronizarValorOrcamento(dados.os_id)
  return { item, valorOrcamento }
}

export async function removerItemOSUseCase(repo: OSRepository, itemId: string, osId: string): Promise<number> {
  await repo.removerItem(itemId)
  return repo.sincronizarValorOrcamento(osId)
}
