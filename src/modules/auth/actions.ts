'use server'

import { createClient } from '@/lib/supabase/server'
import { loginSchema, signupSchema } from '@/modules/auth/schema'
import type { LoginInput, SignupInput } from '@/modules/auth/types'

/**
 * Fazer login com email e senha
 */
export async function login(input: LoginInput) {
  try {
    const { email, password } = loginSchema.parse(input)
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    // Buscar o usuário no banco para obter perfil
    const { data: usuario, error: usuarioError } = await supabase
      .from('usuario')
      .select('id, nome, email, perfil')
      .eq('id', data.user.id)
      .single()

    if (usuarioError) {
      return { success: false, error: 'Usuário não encontrado no sistema' }
    }

    return { success: true, usuario }
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Erro desconhecido'
    return { success: false, error }
  }
}

/**
 * Registrar novo usuário
 */
export async function signup(input: SignupInput) {
  try {
    const validated = signupSchema.parse(input)
    const { email, password, nome, perfil } = validated
    const supabase = await createClient()

    // 1. Criar usuário no Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nome,
          perfil,
        },
      },
    })

    if (authError) {
      return { success: false, error: authError.message }
    }

    if (!authData.user) {
      return { success: false, error: 'Erro ao criar usuário' }
    }

    // 2. Criar registro do usuário na tabela usuario
    const { data: usuario, error: usuarioError } = await supabase
      .from('usuario')
      .insert([
        {
          id: authData.user.id,
          nome,
          email,
          perfil,
          ativo: true,
          criado_em: new Date().toISOString(),
        },
      ])
      .select('id, nome, email, perfil')
      .single()

    if (usuarioError) {
      // Tentar deletar o auth user se falha o registro na tabela
      await supabase.auth.admin.deleteUser(authData.user.id)
      return { success: false, error: usuarioError.message }
    }

    return { success: true, usuario }
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Erro desconhecido'
    return { success: false, error }
  }
}

/**
 * Fazer logout
 */
export async function logout() {
  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Erro desconhecido'
    return { success: false, error }
  }
}

/**
 * Obter sessão atual
 */
export async function getSession() {
  try {
    const supabase = await createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return null
    }

    // Buscar dados completos do usuário
    const { data: usuario } = await supabase
      .from('usuario')
      .select('id, nome, email, perfil, ativo')
      .eq('id', session.user.id)
      .single()

    return usuario
  } catch (err) {
    console.error('Erro ao obter sessão:', err)
    return null
  }
}

/**
 * Obter usuário autenticado
 */
export async function getCurrentUser() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return null
    }

    // Buscar dados completos
    const { data: usuario } = await supabase
      .from('usuario')
      .select('*')
      .eq('id', user.id)
      .single()

    return usuario
  } catch (err) {
    console.error('Erro ao obter usuário atual:', err)
    return null
  }
}
