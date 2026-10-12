import { describe, it, expect, beforeEach, vi } from 'vitest'
import { limparEmulador } from '@/test/emulator-helpers'
import { adminDb } from '@/lib/firebase/admin'

// A autenticação em si já tem cobertura própria (session-token.test.ts).
// Aqui queremos testar só a lógica de negócio/transação da venda, então
// simulamos uma sessão sempre válida.
vi.mock('@/lib/auth/session', () => ({
  checarAutenticado: vi.fn().mockResolvedValue(null),
}))

const { registrarVenda } = await import('./actions')

async function criarProdutoDeTeste(id: string, quantidade: number) {
  await adminDb().collection('produto').doc(id).set({
    id,
    nome: `Produto ${id}`,
    quantidade,
    preco_venda: 50,
  })
}

describe('registrarVenda (contra o emulador do Firestore)', () => {
  beforeEach(async () => {
    await limparEmulador()
  })

  it('registra a venda e debita o estoque corretamente', async () => {
    await criarProdutoDeTeste('prod-1', 10)

    const result = await registrarVenda({
      itens: [{ produto_id: 'prod-1', quantidade: 3, preco_unitario: 50 }],
      forma_pagamento: 'dinheiro',
      total: 150,
    })

    expect(result.success).toBe(true)

    const doc = await adminDb().collection('produto').doc('prod-1').get()
    expect(doc.data()?.quantidade).toBe(7)
  })

  it('rejeita a venda quando o estoque é insuficiente, sem alterar o estoque', async () => {
    await criarProdutoDeTeste('prod-2', 2)

    const result = await registrarVenda({
      itens: [{ produto_id: 'prod-2', quantidade: 5, preco_unitario: 50 }],
      forma_pagamento: 'dinheiro',
      total: 250,
    })

    expect(result.success).toBe(false)
    expect(result.error).toMatch(/estoque insuficiente/i)

    const doc = await adminDb().collection('produto').doc('prod-2').get()
    expect(doc.data()?.quantidade).toBe(2) // inalterado
  })

  it('rejeita a venda de um produto inexistente', async () => {
    const result = await registrarVenda({
      itens: [{ produto_id: 'nao-existe', quantidade: 1, preco_unitario: 50 }],
      forma_pagamento: 'dinheiro',
      total: 50,
    })

    expect(result.success).toBe(false)
    expect(result.error).toMatch(/não encontrado/i)
  })

  it('não deixa vender além do estoque mesmo com vendas simultâneas do mesmo produto', async () => {
    // Estoque de 10, duas vendas concorrentes de 7 cada — juntas passariam de 10,
    // então uma tem que ser aceita e a outra rejeitada (nunca as duas aceitas).
    await criarProdutoDeTeste('prod-3', 10)

    const [resultadoA, resultadoB] = await Promise.all([
      registrarVenda({
        itens: [{ produto_id: 'prod-3', quantidade: 7, preco_unitario: 50 }],
        forma_pagamento: 'dinheiro',
        total: 350,
      }),
      registrarVenda({
        itens: [{ produto_id: 'prod-3', quantidade: 7, preco_unitario: 50 }],
        forma_pagamento: 'dinheiro',
        total: 350,
      }),
    ])

    const sucessos = [resultadoA, resultadoB].filter((r) => r.success)
    expect(sucessos.length).toBe(1)

    const doc = await adminDb().collection('produto').doc('prod-3').get()
    expect(doc.data()?.quantidade).toBe(3) // 10 - 7, nunca foi pra negativo
  })
})
