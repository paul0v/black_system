'use server'

import { createClient } from '@/lib/firebase/server'
import { loginSchema, signupSchema } from '@/modules/auth/schema'
import type { LoginInput, SignupInput } from '@/modules/auth/types'
import { criarSessao, destruirSessao, obterSessao } from '@/lib/auth/session'
import { verificarBloqueio, registrarTentativaFalha, limparTentativas } from '@/lib/auth/rate-limit'

/**
 * Fazer login com email e senha
 */
export async function login(input: LoginInput) {
  try {
    const { email, password } = loginSchema.parse(input)

    // Mensagem de erro de login é sempre a mesma genérica, não importa o
    // motivo real (senha errada, email inexistente, usuário sem cadastro em
    // `usuarios`) — evita que alguém descubra quais emails estão cadastrados
    // só testando login e comparando as respostas (enumeração de usuários).
    const CREDENCIAIS_INVALIDAS = { success: false as const, error: 'Email ou senha inválidos' }

    const bloqueio = await verificarBloqueio(email)
    if (bloqueio.bloqueado) {
      return {
        success: false,
        error: `Muitas tentativas de login. Tente novamente em ${bloqueio.minutosRestantes} minuto(s).`,
      }
    }

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Erro ao autenticar:', error.message)
      await registrarTentativaFalha(email)
      return CREDENCIAIS_INVALIDAS
    }

    // Buscar usuário na tabela usuarios
    const { data: usuario, error: usuarioError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .single()

    if (usuarioError || !usuario) {
      console.error('Usuário autenticado no Firebase Auth mas sem registro em usuarios:', email)
      await registrarTentativaFalha(email)
      return CREDENCIAIS_INVALIDAS
    }

    if (usuario.ativo === false) {
      return { success: false, error: 'Usuário desativado. Entre em contato com o administrador.' }
    }

    // Login certo: limpa o contador de tentativas falhas desse email.
    await limparTentativas(email)

    // Cria a sessão real (cookie httpOnly assinado) — é isso que as Server Actions
    // passam a confiar, não mais o localStorage escrito pelo navegador.
    await criarSessao({
      uid: usuario.id,
      email: usuario.email,
      nome: usuario.nome,
      perfil: usuario.perfil,
    })

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
    const { email, password, nome } = validated
    const supabase = await createClient()

    // Autocadastro público é sempre perfil "atendente" (menor privilégio).
    // O valor de `perfil` vindo do formulário é ignorado de propósito: sem essa
    // trava, qualquer pessoa poderia se cadastrar como admin direto pelo /signup.
    const perfil = 'atendente' as const

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

    return { success: true, usuario: { id: authData.user.id, nome, email, perfil } }
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
    await destruirSessao()
    return { success: true }
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Erro desconhecido'
    return { success: false, error }
  }
}

/**
 * Obter sessão atual (a partir do cookie assinado no servidor)
 */
export async function getSession() {
  try {
    const sessao = await obterSessao()
    if (!sessao) return null

    return {
      id: sessao.uid,
      nome: sessao.nome,
      email: sessao.email,
      perfil: sessao.perfil,
      ativo: true,
    }
  } catch (err) {
    console.error('Erro ao obter sessão:', err)
    return null
  }
}

/**
 * Obter usuário autenticado (dados completos, buscados no Firestore)
 */
export async function getCurrentUser() {
  try {
    const sessao = await obterSessao()
    if (!sessao) return null

    const supabase = await createClient()
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', sessao.uid)
      .single()

    return usuario
  } catch (err) {
    console.error('Erro ao obter usuário atual:', err)
    return null
  }
}
