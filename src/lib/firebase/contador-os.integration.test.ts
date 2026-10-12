import { describe, it, expect, beforeEach } from 'vitest'
import { limparEmulador } from '@/test/emulator-helpers'
import { gerarProximoNumeroOS } from './contador-os'

describe('gerarProximoNumeroOS (contra o emulador do Firestore)', () => {
  beforeEach(async () => {
    await limparEmulador()
  })

  it('começa em OS-0001 quando o contador ainda não existe', async () => {
    const numero = await gerarProximoNumeroOS()
    expect(numero).toBe('OS-0001')
  })

  it('incrementa sequencialmente em chamadas sucessivas', async () => {
    const a = await gerarProximoNumeroOS()
    const b = await gerarProximoNumeroOS()
    const c = await gerarProximoNumeroOS()
    expect([a, b, c]).toEqual(['OS-0001', 'OS-0002', 'OS-0003'])
  })

  it('não gera números duplicados mesmo com chamadas concorrentes (transação atômica)', async () => {
    const resultados = await Promise.all(
      Array.from({ length: 20 }, () => gerarProximoNumeroOS())
    )

    const unicos = new Set(resultados)
    expect(unicos.size).toBe(20)

    const numeros = resultados.map((r) => Number(r.replace('OS-', ''))).sort((a, b) => a - b)
    expect(numeros).toEqual(Array.from({ length: 20 }, (_, i) => i + 1))
  })
})
