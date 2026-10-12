import { describe, it, expect, vi } from 'vitest'
import { registrarVendaUseCase } from './registrar-venda'
import { ValidacaoError } from '@/domain/errors'
import type { VendaRepository } from '@/domain/vendas/repository'

function criarRepoFalso(): VendaRepository {
  return {
    registrar: vi.fn().mockResolvedValue({ id: 'venda-1', numero: 'VENDA-1', forma_pagamento: 'dinheiro', total: 100, data: '2026-01-01' }),
  }
}

describe('registrarVendaUseCase', () => {
  it('rejeita venda sem itens, sem nunca chegar no repositório', async () => {
    const repo = criarRepoFalso()

    await expect(
      registrarVendaUseCase(repo, { itens: [], forma_pagamento: 'dinheiro', total: 0 })
    ).rejects.toThrow(ValidacaoError)
    expect(repo.registrar).not.toHaveBeenCalled()
  })

  it('rejeita item com quantidade zero ou negativa', async () => {
    const repo = criarRepoFalso()

    await expect(
      registrarVendaUseCase(repo, {
        itens: [{ produto_id: 'p1', quantidade: 0, preco_unitario: 10 }],
        forma_pagamento: 'dinheiro',
        total: 0,
      })
    ).rejects.toThrow(ValidacaoError)
    expect(repo.registrar).not.toHaveBeenCalled()
  })

  it('rejeita item sem produto_id', async () => {
    const repo = criarRepoFalso()

    await expect(
      registrarVendaUseCase(repo, {
        itens: [{ produto_id: '', quantidade: 1, preco_unitario: 10 }],
        forma_pagamento: 'dinheiro',
        total: 10,
      })
    ).rejects.toThrow(ValidacaoError)
  })

  it('encaminha pro repositório quando a venda é válida', async () => {
    const repo = criarRepoFalso()

    const resultado = await registrarVendaUseCase(repo, {
      itens: [{ produto_id: 'p1', quantidade: 2, preco_unitario: 10 }],
      forma_pagamento: 'dinheiro',
      total: 20,
    })

    expect(repo.registrar).toHaveBeenCalledOnce()
    expect(resultado.id).toBe('venda-1')
  })
})
