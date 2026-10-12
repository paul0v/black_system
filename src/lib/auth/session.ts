// Sessão de servidor assinada (HMAC) armazenada em cookie httpOnly.
// Substitui o modelo antigo (localStorage + cookie não assinado), que permitia
// a qualquer pessoa forjar uma sessão só escrevendo no localStorage do navegador.
import { cookies } from 'next/headers'
import type { UserProfile } from '@/modules/auth/types'
import { codificarToken, decodificarToken, type SessionPayload } from './session-token'

export type { SessionPayload }

const SESSION_COOKIE = 'bs_session'
const SESSION_MAX_AGE_SEGUNDOS = 60 * 60 * 24 * 7 // 7 dias

function getSecret(): string {
  const secret = process.env.SESSION_SECRET
  if (!secret) {
    throw new Error('SESSION_SECRET não configurado no .env.local')
  }
  return secret
}

export async function criarSessao(dados: Omit<SessionPayload, 'exp'>) {
  const payload: SessionPayload = {
    ...dados,
    exp: Date.now() + SESSION_MAX_AGE_SEGUNDOS * 1000,
  }
  const token = codificarToken(payload, getSecret())

  const store = await cookies()
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE_SEGUNDOS,
    path: '/',
  })
}

export async function destruirSessao() {
  const store = await cookies()
  store.delete(SESSION_COOKIE)
}

export async function obterSessao(): Promise<SessionPayload | null> {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  if (!token) return null

  return decodificarToken(token, getSecret())
}

/** Para Server Actions: retorna um objeto de erro pronto para `return` se não houver sessão válida, ou `null` se autenticado. */
export async function checarAutenticado(): Promise<{ success: false; error: string } | null> {
  const sessao = await obterSessao()
  if (!sessao) {
    return { success: false, error: 'Sessão expirada ou inválida. Faça login novamente.' }
  }
  return null
}

/** Para Server Actions: exige que o usuário esteja autenticado E tenha um dos perfis informados. */
export async function checarPerfil(perfis: UserProfile[]): Promise<{ success: false; error: string } | null> {
  const sessao = await obterSessao()
  if (!sessao) {
    return { success: false, error: 'Sessão expirada ou inválida. Faça login novamente.' }
  }
  if (!perfis.includes(sessao.perfil)) {
    return { success: false, error: 'Você não tem permissão para esta ação.' }
  }
  return null
}
