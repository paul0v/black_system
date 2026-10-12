import type { OSRepository } from '@/domain/os/repository'
import { transicaoValida } from '@/domain/os/status'
import { NaoEncontradoError, TransicaoInvalidaError } from '@/domain/errors'

export async function atualizarStatusOSUseCase(repo: OSRepository, osId: string, novoStatus: string): Promise<void> {
  const osAtual = await repo.buscarPorId(osId)
  if (!osAtual) throw new NaoEncontradoError('OS')

  if (!transicaoValida(osAtual.status, novoStatus)) {
    throw new TransicaoInvalidaError(`Não é possível mudar o status de "${osAtual.status}" para "${novoStatus}"`)
  }

  await repo.atualizarStatus(osId, novoStatus)
}

export async function concluirOSUseCase(repo: OSRepository, osId: string): Promise<void> {
  const osAtual = await repo.buscarPorId(osId)
  if (!osAtual) throw new NaoEncontradoError('OS')

  if (!transicaoValida(osAtual.status, 'concluida')) {
    throw new TransicaoInvalidaError(`Não é possível finalizar uma OS com status "${osAtual.status}"`)
  }

  await repo.atualizarStatus(osId, 'concluida', { data_saida: new Date().toISOString() })
}
