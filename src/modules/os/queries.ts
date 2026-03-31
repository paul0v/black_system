'use server'

import { createClient } from '@/lib/supabase/server'
import type { OrdemServico } from './types'

/**
 * Obtém todas as ordens de serviço com relacionamentos
 */
export async function buscarTodasOS(): Promise<(OrdemServico & { cliente: { nome: string; telefone?: string } | null; tecnico: { nome: string } | null })[]> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('ordem_servico')
      .select(`
        id,
        numero,
        status,
        defeito_relatado,
        diagnostico,
        valor_orcamento,
        orcamento_aprovado,
        prazo_estimado,
        data_entrada,
        data_saida,
        dias_garantia,
        cliente_id,
        tecnico_id,
        atendente_id,
        cliente:cliente_id(id, nome, telefone),
        tecnico:tecnico_id(id, nome)
      `)
      .order('data_entrada', { ascending: false })

    if (error) {
      console.error('Erro ao buscar OS:', error)
      return []
    }

    return (data as any) || []
  } catch (err) {
    console.error('Erro ao buscar OS:', err)
    return []
  }
}

/**
 * Obtém uma OS pelo ID
 */
export async function buscarOSPorId(id: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('ordem_servico')
      .select(`
        *,
        cliente:cliente_id(*),
        tecnico:tecnico_id(*),
        equipamento(*)
      `)
      .eq('id', id)
      .single()

    if (error) return null
    return data
  } catch (err) {
    console.error('Erro ao buscar OS:', err)
    return null
  }
}

/**
 * Obtém todas as OS de um cliente
 */
export async function buscarOSPorCliente(clienteId: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('ordem_servico')
      .select('*')
      .eq('cliente_id', clienteId)
      .order('data_entrada', { ascending: false })

    if (error) return []
    return data || []
  } catch (err) {
    console.error('Erro ao buscar OS por cliente:', err)
    return []
  }
}

/**
 * Obtém todas as OS de um técnico
 */
export async function buscarOSPorTecnico(tecnicoId: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('ordem_servico')
      .select('*')
      .eq('tecnico_id', tecnicoId)
      .order('data_entrada', { ascending: false })

    if (error) return []
    return data || []
  } catch (err) {
    console.error('Erro ao buscar OS por técnico:', err)
    return []
  }
}

/**
 * Obtém OS vencidas (prazo passado)
 */
export async function buscarOSVencidas() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('ordem_servico')
      .select(`
        *,
        cliente:cliente_id(nome, telefone)
      `)
      .lt('prazo_estimado', new Date().toISOString())
      .not('status', 'in', '(entregue,cancelada)')
      .order('prazo_estimado', { ascending: true })

    if (error) return []
    return data || []
  } catch (err) {
    console.error('Erro ao buscar OS vencidas:', err)
    return []
  }
}

/**
 * Obtém próximo número de OS
 */
export async function proximoNumeroOS() {
  // TODO: Implementar
  // SELECT MAX(numero) FROM ordem_servico
  return 'OS0001'
}
