import { describe, it, expect, vi } from 'vitest'
import { atualizarStatusOSUseCase, concluirOSUseCase } from './atualizar-status-os'
import { NaoEncontradoError, TransicaoInvalidaError } from '@/domain/errors'
import type { OSRepository } from '@/domain/os/repository'
import type { OrdemServico } from '@/domain/os/entities'

// Repositório falso em memória — nenhum Firestore, nenhum emulador, nenhum
// Next.js. Isso é só possível porque o use case depende da INTERFACE
// (OSRepository), não da implementação concreta.
function criarRepoFalso(osExistente: Partial<OrdemServico> | null): OSRepository {
  return {
    buscarPorId: vi.fn().mockResolvedValue(osExistente),
    atualizarStatus: vi.fn().mockResolvedValue(undefined),
  } as unknown as OSRepository
}

describe('atualizarStatusOSUseCase', () => {
  it('atualiza o status quando a transição é válida', async () => {
    const repo = criarRepoFalso({ id: 'os-1', status: 'aberta' })

    await atualizarStatusOSUseCase(repo, 'os-1', 'em_diagnostico')

    expect(repo.atualizarStatus).toHaveBeenCalledWith('os-1', 'em_diagnostico')
  })

  it('rejeita transição inválida sem nunca gravar nada', async () => {
    const repo = criarRepoFalso({ id: 'os-1', status: 'aberta' })

    await expect(atualizarStatusOSUseCase(repo, 'os-1', 'concluida')).rejects.toThrow(TransicaoInvalidaError)
    expect(repo.atualizarStatus).not.toHaveBeenCalled()
  })

  it('rejeita quando a OS não existe', async () => {
    const repo = criarRepoFalso(null)

    await expect(atualizarStatusOSUseCase(repo, 'os-inexistente', 'em_diagnostico')).rejects.toThrow(NaoEncontradoError)
  })
})

describe('concluirOSUseCase', () => {
  it('finaliza e registra data_saida quando o status permite', async () => {
    const repo = criarRepoFalso({ id: 'os-1', status: 'em_reparo' })

    await concluirOSUseCase(repo, 'os-1')

    expect(repo.atualizarStatus).toHaveBeenCalledWith('os-1', 'concluida', expect.objectContaining({ data_saida: expect.any(String) }))
  })

  it('rejeita finalizar uma OS recém-aberta (pulando etapas)', async () => {
    const repo = criarRepoFalso({ id: 'os-1', status: 'aberta' })

    await expect(concluirOSUseCase(repo, 'os-1')).rejects.toThrow(TransicaoInvalidaError)
    expect(repo.atualizarStatus).not.toHaveBeenCalled()
  })
})
