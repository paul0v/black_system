// Server Actions para Ordens de Serviço

'use server'

import { ZodError } from 'zod'
import { createClient } from '@/lib/supabase/server'
import {
  handleZodError,
  handleDatabaseError,
  handleServerAction,
  logError,
  logBusinessEvent,
  type ActionResponse,
} from '@/lib/errors'
import { criarOSSchema, CriarOSInput } from './schema'
import { enviarMensagemWhatsApp } from '@/lib/notificacoes/whatsapp'

/**
 * Cria uma nova ordem de serviço e envia notificação WhatsApp
 */
export async function criarOS(input: CriarOSInput): Promise<ActionResponse> {
  return handleServerAction(async () => {
    // 1. Validar entrada
    const validado = criarOSSchema.parse(input)
    const supabase = await createClient()

    // 2. Inserir OS
    const { data: os, error: osError } = await supabase
      .from('ordem_servico')
      .insert([
        {
          cliente_id: validado.cliente_id,
          defeito_relatado: validado.defeito_relatado,
          data_entrada: validado.data_entrada,
          status: 'aberta',
          orcamento_aprovado: false,
          dias_garantia: 30,
        },
      ])
      .select('id, numero')
      .single()

    if (osError) {
      throw osError
    }

    // 3. Inserir equipamento
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
      // Tentar deletar OS se falhar o equipamento
      try {
        await supabase.from('ordem_servico').delete().eq('id', os.id)
      } catch (e) {
        logError(e instanceof Error ? e : new Error(String(e)))
      }
      throw equipError
    }

    // 4. Buscar dados do cliente para enviar WhatsApp
    const { data: cliente, error: clienteError } = await supabase
      .from('cliente')
      .select('nome, telefone')
      .eq('id', validado.cliente_id)
      .single()

    if (clienteError) {
      logError(clienteError instanceof Error ? clienteError : new Error(String(clienteError)))
    }

    // 5. Enviar WhatsApp se houver telefone
    if (cliente?.telefone) {
      const mensagem = `
*Ordem de Serviço #${os.numero}*

Olá ${cliente.nome}! 👋

Sua ordem de serviço foi aberta com sucesso.

📋 *Detalhes:*
- Número: OS-${os.numero}
- Equipamento: ${validado.equipamento_marca} ${validado.equipamento_modelo}
- Defeito: ${validado.defeito_relatado.substring(0, 50)}...

Entraremos em contato em breve com atualizações.

Obrigado!`

      const whatsappResult = await enviarMensagemWhatsApp(cliente.telefone, mensagem)
      if (!whatsappResult.success) {
        logError(
          new Error(whatsappResult.error || 'Erro desconhecido ao enviar WhatsApp'),
          undefined,
          'enviarMensagemWhatsApp em criarOS'
        )
      }
    }

    // 6. Log de sucesso
    logBusinessEvent('Ordem de Serviço Criada', 'os.actions', {
      osId: os.id,
      osNumero: os.numero,
      clienteId: validado.cliente_id,
      equipamento: `${validado.equipamento_marca} ${validado.equipamento_modelo}`,
    })

    return {
      success: true,
      message: `OS #${os.numero} criada com sucesso`,
      id: os.id,
      numero: os.numero,
    }
  }, 'criarOS')
}

/**
 * Atualiza uma ordem de serviço
 */
export async function atualizarOS(
  id: string,
  updates: Partial<CriarOSInput>
): Promise<ActionResponse> {
  return handleServerAction(async () => {
    const supabase = await createClient()

    const { error } = await supabase
      .from('ordem_servico')
      .update(updates)
      .eq('id', id)

    if (error) {
      throw error
    }

    logBusinessEvent('Ordem de Serviço Atualizada', 'os.actions', {
      osId: id,
      camposAtualizados: Object.keys(updates),
    })

    return {
      success: true,
      message: 'OS atualizada com sucesso',
    }
  }, 'atualizarOS')
}

/**
 * Atualiza o status da OS
 */
export async function atualizarStatusOS(
  id: string,
  status: string
): Promise<ActionResponse> {
  return handleServerAction(async () => {
    const supabase = await createClient()

    const { error } = await supabase
      .from('ordem_servico')
      .update({ status })
      .eq('id', id)

    if (error) {
      throw error
    }

    logBusinessEvent('Status de OS Atualizado', 'os.actions', {
      osId: id,
      novoStatus: status,
    })

    return {
      success: true,
      message: 'Status atualizado com sucesso',
    }
  }, 'atualizarStatusOS')
}

/**
 * Deleta uma ordem de serviço
 */
export async function deletarOS(id: string): Promise<ActionResponse> {
  return handleServerAction(async () => {
    const supabase = await createClient()

    const { error } = await supabase
      .from('ordem_servico')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }

    logBusinessEvent('Ordem de Serviço Deletada', 'os.actions', { osId: id })

    return {
      success: true,
      message: 'OS deletada com sucesso',
    }
  }, 'deletarOS')
}

/**
 * Aprova um orçamento de OS
 */
export async function aprovarOrcamento(
  osId: string,
  valor: number
): Promise<ActionResponse> {
  return handleServerAction(async () => {
    const supabase = await createClient()

    const { error: osError } = await supabase
      .from('ordem_servico')
      .update({
        orcamento_aprovado: true,
      })
      .eq('id', osId)

    if (osError) {
      throw osError
    }

    logBusinessEvent('Orçamento de OS Aprovado', 'os.actions', {
      osId,
      valor,
    })

    return {
      success: true,
      message: 'Orçamento aprovado com sucesso',
    }
  }, 'aprovarOrcamento')
}

/**
 * Conclui uma ordem de serviço
 */
export async function concluirOS(osId: string): Promise<ActionResponse> {
  return handleServerAction(async () => {
    const supabase = await createClient()

    // 1. Verificar se existem pendências
    const { data: os, error: osError } = await supabase
      .from('ordem_servico')
      .select('status, cliente_id')
      .eq('id', osId)
      .single()

    if (osError) {
      throw osError
    }

    if (!os) {
      throw new Error('OS não encontrada')
    }

    // 2. Atualizar status
    const { error: updateError } = await supabase
      .from('ordem_servico')
      .update({
        status: 'concluida',
        data_conclusao: new Date().toISOString(),
      })
      .eq('id', osId)

    if (updateError) {
      throw updateError
    }

    // 3. Buscar cliente para enviar notificação
    const { data: cliente } = await supabase
      .from('cliente')
      .select('nome, telefone')
      .eq('id', os.cliente_id)
      .single()

    if (cliente?.telefone) {
      const mensagem = `
*Sua OS foi concluída! ✅*

Olá ${cliente.nome}! 

Sua ordem de serviço foi concluída com sucesso.

Entre em contato conosco para retirar seu equipamento.

Obrigado! 🙏`

      await enviarMensagemWhatsApp(cliente.telefone, mensagem)
    }

    logBusinessEvent('Ordem de Serviço Concluída', 'os.actions', { osId })

    return {
      success: true,
      message: 'OS concluída com sucesso',
    }
  }, 'concluirOS')
}
