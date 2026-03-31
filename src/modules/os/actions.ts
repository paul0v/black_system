// Server Actions para Ordens de Serviço

'use server'

import { createClient } from '@/lib/supabase/server'
import { criarOSSchema, CriarOSInput } from './schema'

/**
 * Cria uma nova ordem de serviço
 */
export async function criarOS(input: CriarOSInput) {
  try {
    // Validar entrada
    const validado = criarOSSchema.parse(input)
    const supabase = await createClient()

    // 1. Inserir OS (número é gerado automaticamente pelo trigger)
    const { data: os, error: osError } = await supabase
      .from('ordem_servico')
      .insert([
        {
          cliente_id: validado.cliente_id,
          defeito_relatado: validado.defeito_relatado,
          prazo_estimado: validado.prazo_estimado,
          status: 'aberta',
          orcamento_aprovado: false,
          dias_garantia: 30,
        },
      ])
      .select('id, numero')
      .single()

    if (osError) {
      return { success: false, error: osError.message }
    }

    // 2. Inserir equipamento
    const { error: equipError } = await supabase
      .from('equipamento')
      .insert([
        {
          os_id: os.id,
          tipo: validado.equipamento_tipo,
          marca: validado.equipamento_marca,
          modelo: validado.equipamento_modelo,
          imei_serial: validado.equipamento_imei,
          acessorios_entregues: validado.acessorios_entregues || '',
        },
      ])

    if (equipError) {
      // Deletar OS criada se falhar o equipamento
      await supabase.from('ordem_servico').delete().eq('id', os.id)
      return { success: false, error: 'Erro ao registrar equipamento' }
    }

    return {
      success: true,
      message: `OS #${os.numero} criada com sucesso`,
      id: os.id,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao criar OS',
    }
  }
}

/**
 * Atualiza uma ordem de serviço
 */
export async function atualizarOS(id: string, updates: Partial<CriarOSInput>) {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('ordem_servico')
      .update(updates)
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, message: 'OS atualizada com sucesso' }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao atualizar OS',
    }
  }
}

/**
 * Atualiza o status da OS
 */
export async function atualizarStatusOS(id: string, status: string) {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('ordem_servico')
      .update({ status })
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, message: 'Status atualizado com sucesso' }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao atualizar status',
    }
  }
}

/**
 * Deleta uma ordem de serviço
 */
export async function deletarOS(id: string) {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('ordem_servico')
      .delete()
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, message: 'OS deletada com sucesso' }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao deletar OS',
    }
  }
}

/**
 * Aprova um orçamento de OS
 */
export async function aprovarOrcamento(osId: string, valor: number) {
  try {
    // TODO: Implementar
    return {
      success: true,
      message: 'Placeholder: implementar aprovarOrcamento',
    }
  } catch (error) {
    return {
      success: false,
      message: 'Erro ao aprovar orçamento',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}

/**
 * Conclui uma ordem de serviço
 */
export async function concluirOS(osId: string) {
  try {
    // TODO: Implementar
    // 1. Validar serviço concluído
    // 2. Baixar peças do estoque
    // 3. Atualizar status
    // 4. Gerar termo de garantia
    // 5. Notificar cliente
    
    return {
      success: true,
      message: 'Placeholder: implementar concluirOS',
    }
  } catch (error) {
    return {
      success: false,
      message: 'Erro ao concluir OS',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}
