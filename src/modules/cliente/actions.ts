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
import { criarClienteSchema } from '@/modules/os/schema'
import type { CriarClienteInput } from '@/modules/os/schema'

/**
 * Cria um novo cliente
 */
export async function criarCliente(input: CriarClienteInput): Promise<ActionResponse> {
  return handleServerAction(async () => {
    const validado = criarClienteSchema.parse(input)
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('cliente')
      .insert([validado])
      .select('id')
      .single()

    if (error) {
      throw error
    }

    logBusinessEvent('Cliente Criado', 'cliente.actions', {
      clienteId: data.id,
      nome: validado.nome,
    })

    return {
      success: true,
      message: 'Cliente criado com sucesso',
      id: data.id,
    }
  }, 'criarCliente')
}

/**
 * Atualiza um cliente
 */
export async function atualizarCliente(
  id: string,
  updates: Partial<CriarClienteInput>
): Promise<ActionResponse> {
  return handleServerAction(async () => {
    const supabase = await createClient()

    const { error } = await supabase
      .from('cliente')
      .update(updates)
      .eq('id', id)

    if (error) {
      throw error
    }

    logBusinessEvent('Cliente Atualizado', 'cliente.actions', {
      clienteId: id,
      camposAtualizados: Object.keys(updates),
    })

    return { success: true, message: 'Cliente atualizado com sucesso' }
  }, 'atualizarCliente')
}

/**
 * Deleta um cliente
 */
export async function deletarCliente(id: string): Promise<ActionResponse> {
  return handleServerAction(async () => {
    const supabase = await createClient()

    const { error } = await supabase
      .from('cliente')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }

    logBusinessEvent('Cliente Deletado', 'cliente.actions', { clienteId: id })

    return { success: true, message: 'Cliente deletado com sucesso' }
  }, 'deletarCliente')
}
