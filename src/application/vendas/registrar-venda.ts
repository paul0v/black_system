import type { VendaRepository } from '@/domain/vendas/repository'
import type { Venda, NovaVenda } from '@/domain/vendas/entities'
import { ValidacaoError } from '@/domain/errors'

export async function registrarVendaUseCase(repo: VendaRepository, venda: NovaVenda): Promise<Venda> {
  if (!venda.itens || venda.itens.length === 0) {
    throw new ValidacaoError('Adicione ao menos um item à venda')
  }

  for (const item of venda.itens) {
    if (!item.produto_id || !(Number(item.quantidade) > 0) || !(Number(item.preco_unitario) >= 0)) {
      throw new ValidacaoError('Há um item inválido na venda')
    }
  }

  // A atomicidade (não vender além do estoque, mesmo com vendas concorrentes)
  // é uma garantia do repositório — ver domain/vendas/repository.ts.
  return repo.registrar(venda)
}
