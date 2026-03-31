/**
 * Integração com Evolution API para envio de WhatsApp
 */

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || ''
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || ''
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE_NAME || 'black_system'

export async function enviarMensagemWhatsApp(
  telefone: string,
  mensagem: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validação básica
    if (!telefone || !mensagem) {
      return { success: false, error: 'Telefone e mensagem são obrigatórios' }
    }

    // Se não houver Evolution API configurada, log apenas
    if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) {
      console.log(
        '[WHATSAPP] Mensagem não enviada - Evolution API não configurada',
        { telefone, mensagem: mensagem.substring(0, 50) }
      )
      return { success: true } // Não falha, apenas não envia
    }

    // Normalizar telefone (remover caracteres especiais)
    const telefoneLimpo = telefone.replace(/\D/g, '')
    if (telefoneLimpo.length < 10) {
      return { success: false, error: 'Telefone inválido' }
    }

    // Endpoint da Evolution API
    const url = `${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`

    const payload = {
      number: telefoneLimpo,
      text: mensagem,
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': EVOLUTION_API_KEY,
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('[WHATSAPP] Erro ao enviar:', error)
      return {
        success: false,
        error: `Erro ao enviar WhatsApp: ${response.status}`,
      }
    }

    console.log('[WHATSAPP] Mensagem enviada com sucesso para:', telefoneLimpo)
    return { success: true }
  } catch (error) {
    console.error('[WHATSAPP] Erro:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}

/**
 * Envia mensagem de orçamento pronto via WhatsApp
 */
export async function enviarOrcamentoProto(
  telefone: string,
  nomeCliente: string,
  numeroOS: number,
  valorOrcamento: number
) {
  const mensagem = `
*Orçamento Pronto! 🎉*

Olá ${nomeCliente}!

O orçamento para sua OS #${numeroOS} foi finalizado.

💰 *Valor do Orçamento:* R$ ${valorOrcamento.toFixed(2)}

Por favor, entre em contato conosco para aprovação.

Obrigado!`

  return enviarMensagemWhatsApp(telefone, mensagem)
}

/**
 * Envia mensagem de equipamento pronto via WhatsApp
 */
export async function enviarEquipamentoPronto(
  telefone: string,
  nomeCliente: string,
  numeroOS: number
) {
  const mensagem = `
*Seu Equipamento Está Pronto! ✅*

Olá ${nomeCliente}!

Seu equipamento (OS #${numeroOS}) está pronto para retirada!

Por favor, agende um horário para vir buscar.

Obrigado por confiar em nosso serviço!`

  return enviarMensagemWhatsApp(telefone, mensagem)
}
