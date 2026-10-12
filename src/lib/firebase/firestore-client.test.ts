import { describe, it, expect } from 'vitest'
import { avaliarFiltro } from './firestore-client'

describe('avaliarFiltro (filtros em memória do adaptador Firestore)', () => {
  it('==', () => {
    expect(avaliarFiltro('a', '==', 'a')).toBe(true)
    expect(avaliarFiltro('a', '==', 'b')).toBe(false)
  })

  it('!=', () => {
    expect(avaliarFiltro('a', '!=', 'b')).toBe(true)
    expect(avaliarFiltro('a', '!=', 'a')).toBe(false)
  })

  it('< <= > >=', () => {
    expect(avaliarFiltro(5, '<', 10)).toBe(true)
    expect(avaliarFiltro(10, '<', 10)).toBe(false)
    expect(avaliarFiltro(10, '<=', 10)).toBe(true)
    expect(avaliarFiltro(11, '>', 10)).toBe(true)
    expect(avaliarFiltro(10, '>=', 10)).toBe(true)
  })

  it('in', () => {
    expect(avaliarFiltro('b', 'in', ['a', 'b', 'c'])).toBe(true)
    expect(avaliarFiltro('z', 'in', ['a', 'b', 'c'])).toBe(false)
    expect(avaliarFiltro('a', 'in', 'não é array')).toBe(false)
  })

  it('not-in', () => {
    expect(avaliarFiltro('z', 'not-in', ['a', 'b', 'c'])).toBe(true)
    expect(avaliarFiltro('b', 'not-in', ['a', 'b', 'c'])).toBe(false)
  })

  it('array-contains', () => {
    expect(avaliarFiltro(['x', 'y'], 'array-contains', 'x')).toBe(true)
    expect(avaliarFiltro(['x', 'y'], 'array-contains', 'z')).toBe(false)
    expect(avaliarFiltro('não é array', 'array-contains', 'x')).toBe(false)
  })

  it('operador desconhecido não filtra nada fora (fail-open controlado)', () => {
    expect(avaliarFiltro('qualquer coisa', 'array-contains-any' as any, ['x'])).toBe(true)
  })
})
