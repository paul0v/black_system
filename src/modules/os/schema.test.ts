import { describe, it, expect } from 'vitest'
import { criarOSSchema, criarItemOSSchema, criarClienteSchema, criarProdutoSchema } from './schema'

describe('criarOSSchema', () => {
  const base = {
    cliente_id: '123e4567-e89b-12d3-a456-426614174000',
    defeito_relatado: 'Tela quebrada, não liga de jeito nenhum',
    equipamento_tipo: 'celular' as const,
    equipamento_marca: 'Samsung',
    equipamento_modelo: 'Galaxy A13',
    equipamento_imei: '123456789012345',
  }

  it('aceita uma OS válida', () => {
    const resultado = criarOSSchema.safeParse(base)
    expect(resultado.success).toBe(true)
  })

  it('rejeita cliente_id que não é um UUID (ex: id vazio ou malformado)', () => {
    const resultado = criarOSSchema.safeParse({ ...base, cliente_id: 'nao-e-um-uuid' })
    expect(resultado.success).toBe(false)
  })

  it('rejeita defeito_relatado muito curto', () => {
    const resultado = criarOSSchema.safeParse({ ...base, defeito_relatado: 'quebrou' })
    expect(resultado.success).toBe(false)
  })

  it('rejeita equipamento_tipo fora do enum permitido', () => {
    const resultado = criarOSSchema.safeParse({ ...base, equipamento_tipo: 'geladeira' })
    expect(resultado.success).toBe(false)
  })

  it('rejeita marca/modelo vazios', () => {
    expect(criarOSSchema.safeParse({ ...base, equipamento_marca: '' }).success).toBe(false)
    expect(criarOSSchema.safeParse({ ...base, equipamento_modelo: '' }).success).toBe(false)
  })

  it('preenche data_entrada com a data atual quando omitida', () => {
    const resultado = criarOSSchema.parse(base)
    expect(resultado.data_entrada).toBeInstanceOf(Date)
  })

  it('limita fotos a no máximo 10', () => {
    const fotos = Array.from({ length: 11 }, (_, i) => `foto-${i}`)
    const resultado = criarOSSchema.safeParse({ ...base, equipamento_fotos: fotos })
    expect(resultado.success).toBe(false)
  })
})

describe('criarItemOSSchema', () => {
  const base = {
    os_id: '123e4567-e89b-12d3-a456-426614174000',
    descricao: 'Troca de tela',
    quantidade: 1,
    preco_custo: 50,
    preco_unitario: 150,
  }

  it('aceita um item válido', () => {
    expect(criarItemOSSchema.safeParse(base).success).toBe(true)
  })

  it('rejeita quantidade zero ou negativa', () => {
    expect(criarItemOSSchema.safeParse({ ...base, quantidade: 0 }).success).toBe(false)
    expect(criarItemOSSchema.safeParse({ ...base, quantidade: -1 }).success).toBe(false)
  })

  it('rejeita preco_unitario zero ou negativo (mas aceita preco_custo zero)', () => {
    expect(criarItemOSSchema.safeParse({ ...base, preco_unitario: 0 }).success).toBe(false)
    expect(criarItemOSSchema.safeParse({ ...base, preco_custo: 0 }).success).toBe(true)
  })

  it('rejeita descrição vazia', () => {
    expect(criarItemOSSchema.safeParse({ ...base, descricao: '' }).success).toBe(false)
  })
})

describe('criarClienteSchema', () => {
  it('aceita um cliente só com nome (demais campos opcionais)', () => {
    expect(criarClienteSchema.safeParse({ nome: 'João da Silva' }).success).toBe(true)
  })

  it('rejeita nome muito curto', () => {
    expect(criarClienteSchema.safeParse({ nome: 'Jo' }).success).toBe(false)
  })

  it('rejeita email em formato inválido quando informado', () => {
    expect(criarClienteSchema.safeParse({ nome: 'João da Silva', email: 'nao-e-email' }).success).toBe(false)
  })
})

describe('criarProdutoSchema', () => {
  const base = {
    nome: 'Tela Galaxy A13',
    tipo: 'peca' as const,
    categoria: 'Display',
    preco_custo: 80,
    preco_venda: 150,
    estoque_minimo: 2,
  }

  it('aceita um produto válido', () => {
    expect(criarProdutoSchema.safeParse(base).success).toBe(true)
  })

  it('rejeita preco_venda zero ou negativo', () => {
    expect(criarProdutoSchema.safeParse({ ...base, preco_venda: 0 }).success).toBe(false)
  })

  it('rejeita estoque_minimo negativo', () => {
    expect(criarProdutoSchema.safeParse({ ...base, estoque_minimo: -1 }).success).toBe(false)
  })

  it('rejeita tipo fora do enum permitido', () => {
    expect(criarProdutoSchema.safeParse({ ...base, tipo: 'invalido' }).success).toBe(false)
  })
})
