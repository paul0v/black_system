// Lógica pura de codificação/assinatura do token de sessão (HMAC-SHA256).
// Separado de session.ts de propósito: este arquivo não importa `next/headers`,
// então pode ser testado diretamente (sem precisar simular uma requisição HTTP).
import crypto from 'crypto'
import type { UserProfile } from '@/modules/auth/types'

export interface SessionPayload {
  uid: string
  email: string
  nome: string
  perfil: UserProfile
  exp: number
}

function assinar(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex')
}

function assinaturaValida(payload: string, assinatura: string, secret: string): boolean {
  const esperada = assinar(payload, secret)
  const bufEsperada = Buffer.from(esperada, 'hex')
  const bufRecebida = Buffer.from(assinatura, 'hex')
  if (bufEsperada.length !== bufRecebida.length) return false
  return crypto.timingSafeEqual(bufEsperada, bufRecebida)
}

/** Serializa e assina o payload da sessão, pronto para ir num cookie. */
export function codificarToken(payload: SessionPayload, secret: string): string {
  const base64 = Buffer.from(JSON.stringify(payload), 'utf-8').toString('base64url')
  return `${base64}.${assinar(base64, secret)}`
}

/** Verifica a assinatura e a expiração; retorna `null` se o token for inválido, adulterado ou expirado. */
export function decodificarToken(token: string, secret: string): SessionPayload | null {
  const [base64, assinatura] = token.split('.')
  if (!base64 || !assinatura) return null
  if (!assinaturaValida(base64, assinatura, secret)) return null

  try {
    const payload = JSON.parse(Buffer.from(base64, 'base64url').toString('utf-8')) as SessionPayload
    if (!payload.exp || payload.exp < Date.now()) return null
    return payload
  } catch {
    return null
  }
}
