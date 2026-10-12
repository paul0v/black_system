import { describe, it, expect } from 'vitest'
import { transicaoValida, statusSeguintesValidos } from './status'

describe('transicaoValida', () => {
  it('permite transições válidas do fluxo normal', () => {
    expect(transicaoValida('aberta', 'em_diagnostico')).toBe(true)
    expect(transicaoValida('em_diagnostico', 'aguardando_aprovacao')).toBe(true)
    expect(transicaoValida('aguardando_aprovacao', 'em_reparo')).toBe(true)
    expect(transicaoValida('em_reparo', 'concluida')).toBe(true)
    expect(transicaoValida('concluida', 'entregue')).toBe(true)
  })

  it('rejeita pular etapas do fluxo', () => {
    expect(transicaoValida('aberta', 'concluida')).toBe(false)
    expect(transicaoValida('aberta', 'entregue')).toBe(false)
  })

  it('rejeita qualquer transição a partir de "entregue" (estado final)', () => {
    expect(statusSeguintesValidos('entregue')).toEqual([])
    expect(transicaoValida('entregue', 'aberta')).toBe(false)
  })

  it('rejeita status desconhecido/inventado', () => {
    expect(transicaoValida('aberta', 'status_que_nao_existe')).toBe(false)
    expect(transicaoValida('status_que_nao_existe', 'aberta')).toBe(false)
  })

  it('permite cancelar a partir dos estágios em andamento', () => {
    expect(transicaoValida('aberta', 'cancelada')).toBe(true)
    expect(transicaoValida('em_reparo', 'cancelada')).toBe(true)
  })

  it('permite reabrir uma OS cancelada ou entregue indevidamente', () => {
    expect(transicaoValida('cancelada', 'aberta')).toBe(true)
    expect(transicaoValida('concluida', 'aberta')).toBe(true)
  })
})
