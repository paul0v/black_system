'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Busca todos os clientes
 */
export async function buscarTodosClientes() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('cliente')
      .select('*')
      .order('nome')

    if (error) return []
    return data || []
  } catch (err) {
    console.error('Erro ao buscar clientes:', err)
    return []
  }
}

/**
 * Busca um cliente pelo ID
 */
export async function buscarClientePorId(id: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('cliente')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return null
    return data
  } catch (err) {
    console.error('Erro ao buscar cliente:', err)
    return null
  }
}
