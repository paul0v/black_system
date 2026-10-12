import { describe, it, expect } from 'vitest'
import { codificarToken, decodificarToken, type SessionPayload } from './session-token'

const SECRET = 'segredo-de-teste-nao-usar-em-producao'
const OUTRO_SECRET = 'outro-segredo-completamente-diferente'

function criarPayload(overrides: Partial<SessionPayload> = {}): SessionPayload {
  return {
    uid: 'usuario-123',
    email: 'teste@teste.local',
    nome: 'Usuário de Teste',
    perfil: 'admin',
    exp: Date.now() + 1000 * 60 * 60, // expira em 1h
    ...overrides,
  }
}

describe('session-token', () => {
  it('codifica e decodifica um payload válido (round-trip)', () => {
    const payload = criarPayload()
    const token = codificarToken(payload, SECRET)
    const decodificado = decodificarToken(token, SECRET)

    expect(decodificado).toEqual(payload)
  })

  it('rejeita um token sem nenhuma assinatura', () => {
    expect(decodificarToken('', SECRET)).toBeNull()
    expect(decodificarToken('abc', SECRET)).toBeNull()
  })

  it('rejeita um token com a assinatura adulterada (1 caractere trocado)', () => {
    const token = codificarToken(criarPayload(), SECRET)
    const [base64, assinatura] = token.split('.')
    const assinaturaAdulterada = (assinatura[0] === 'a' ? 'b' : 'a') + assinatura.slice(1)

    expect(decodificarToken(`${base64}.${assinaturaAdulterada}`, SECRET)).toBeNull()
  })

  it('rejeita um token com o payload adulterado mas assinatura antiga', () => {
    const tokenOriginal = codificarToken(criarPayload({ perfil: 'atendente' }), SECRET)
    const [, assinaturaOriginal] = tokenOriginal.split('.')

    // Ataque de escalonamento de privilégio: tenta trocar o perfil mantendo a assinatura antiga
    const payloadForjado = criarPayload({ perfil: 'admin' })
    const base64Forjado = Buffer.from(JSON.stringify(payloadForjado), 'utf-8').toString('base64url')

    expect(decodificarToken(`${base64Forjado}.${assinaturaOriginal}`, SECRET)).toBeNull()
  })

  it('rejeita um token assinado com outro segredo (simula não saber o SESSION_SECRET real)', () => {
    const token = codificarToken(criarPayload(), OUTRO_SECRET)
    expect(decodificarToken(token, SECRET)).toBeNull()
  })

  it('rejeita um token totalmente forjado sem conhecer o segredo', () => {
    const forjado = `${Buffer.from(JSON.stringify(criarPayload({ perfil: 'admin' })), 'utf-8').toString('base64url')}.assinaturainventada0000000000000000000000000000000000000000`
    expect(decodificarToken(forjado, SECRET)).toBeNull()
  })

  it('rejeita um token expirado', () => {
    const payloadExpirado = criarPayload({ exp: Date.now() - 1000 })
    const token = codificarToken(payloadExpirado, SECRET)

    expect(decodificarToken(token, SECRET)).toBeNull()
  })

  it('aceita um token que ainda não expirou, perto do limite', () => {
    const payload = criarPayload({ exp: Date.now() + 1000 })
    const token = codificarToken(payload, SECRET)

    expect(decodificarToken(token, SECRET)).not.toBeNull()
  })
})
