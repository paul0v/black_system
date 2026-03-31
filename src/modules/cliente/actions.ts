'use server'

import { createClient } from '@/lib/supabase/server'
import { criarClienteSchema } from '@/modules/os/schema'
import type { CriarClienteInput } from '@/modules/os/schema'

/**
 * Cria um novo cliente
 */
export async function criarCliente(input: CriarClienteInput) {
  try {
    const validado = criarClienteSchema.parse(input)
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('cliente')
      .insert([validado])
      .select('id')
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return {
      success: true,
      message: 'Cliente criado com sucesso',
      id: data.id,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao criar cliente',
    }
  }
}

/**
 * Atualiza um cliente
 */
export async function atualizarCliente(id: string, updates: Partial<CriarClienteInput>) {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('cliente')
      .update(updates)
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, message: 'Cliente atualizado com sucesso' }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao atualizar cliente',
    }
  }
}

/**
 * Deleta um cliente
 */
export async function deletarCliente(id: string) {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('cliente')
      .delete()
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, message: 'Cliente deletado com sucesso' }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao deletar cliente',
    }
  }
}
