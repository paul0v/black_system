import type { OSRepository } from '@/domain/os/repository'
import type { OrdemServico } from '@/domain/os/entities'

export interface CriarOSInput {
  cliente_id: string
  defeito_relatado: string
  data_entrada: Date
  equipamento_tipo: string
  equipamento_marca: string
  equipamento_modelo: string
  equipamento_imei: string
  acessorios_entregues?: string
  equipamento_checklist?: Record<string, boolean>
  equipamento_fotos?: string[]
  equipamento_senha_tipo?: 'nenhuma' | 'padrao' | 'pin' | 'senha'
  equipamento_senha_valor?: string
}

export async function criarOSUseCase(repo: OSRepository, input: CriarOSInput): Promise<OrdemServico> {
  const numero = await repo.gerarProximoNumero()

  return repo.criar(numero, {
    cliente_id: input.cliente_id,
    defeito_relatado: input.defeito_relatado,
    data_entrada: input.data_entrada,
    equipamento: {
      tipo: input.equipamento_tipo,
      marca: input.equipamento_marca,
      modelo: input.equipamento_modelo,
      imei_serial: input.equipamento_imei,
      acessorios_entregues: input.acessorios_entregues || '',
      condicao_entrada: JSON.stringify(input.equipamento_checklist || {}),
      fotos_url: input.equipamento_fotos || [],
      senha_tipo: input.equipamento_senha_tipo || 'nenhuma',
      senha_valor: input.equipamento_senha_valor || '',
    },
  })
}
