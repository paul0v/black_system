import crypto from 'crypto'
import { createClient } from '@/lib/firebase/server'
import type { VendaRepository } from '@/domain/vendas/repository'
import type { Venda, NovaVenda } from '@/domain/vendas/entities'
import { NaoEncontradoError, EstoqueInsuficienteError } from '@/domain/errors'

function generateId(): string {
  return crypto.randomUUID?.() || `id-${Date.now()}-${Math.random()}`
}

export class FirestoreVendaRepository implements VendaRepository {
  async registrar(venda: NovaVenda): Promise<Venda> {
    const db = (await createClient()).raw()
    const vendaId = generateId()
    const numero = `VENDA-${Date.now()}`

    // Transação: lê o estoque de todos os produtos, valida disponibilidade e só então
    // grava a venda + a baixa de estoque — tudo ou nada, mesmo com vendas concorrentes
    // do mesmo produto (evita a venda "estourar" o estoque pra negativo/zero silenciosamente).
    await db.runTransaction(async (transaction) => {
      const produtoRefs = venda.itens.map((item) => db.collection('produto').doc(item.produto_id))
      const produtoSnaps = await Promise.all(produtoRefs.map((ref) => transaction.get(ref)))

      for (let i = 0; i < venda.itens.length; i++) {
        const item = venda.itens[i]
        const snap = produtoSnaps[i]

        if (!snap.exists) {
          throw new NaoEncontradoError(`Produto (id: ${item.produto_id})`)
        }

        const quantidadeDisponivel = Number(snap.data()?.quantidade) || 0
        if (quantidadeDisponivel < item.quantidade) {
          const nome = snap.data()?.nome || item.produto_id
          throw new EstoqueInsuficienteError(
            `Estoque insuficiente para "${nome}": disponível ${quantidadeDisponivel}, solicitado ${item.quantidade}`
          )
        }
      }

      venda.itens.forEach((item, i) => {
        const quantidadeAtual = Number(produtoSnaps[i].data()?.quantidade) || 0
        transaction.update(produtoRefs[i], { quantidade: quantidadeAtual - item.quantidade })
      })

      const vendaRef = db.collection('venda').doc(vendaId)
      transaction.set(vendaRef, {
        id: vendaId,
        numero,
        forma_pagamento: venda.forma_pagamento,
        total: venda.total,
        data: new Date().toISOString(),
      })

      venda.itens.forEach((item) => {
        const itemRef = db.collection('item_venda').doc()
        transaction.set(itemRef, {
          id: itemRef.id,
          venda_id: vendaId,
          produto_id: item.produto_id,
          quantidade: item.quantidade,
          preco_unitario: item.preco_unitario,
        })
      })
    })

    return { id: vendaId, numero, forma_pagamento: venda.forma_pagamento, total: venda.total, data: new Date().toISOString() }
  }
}
