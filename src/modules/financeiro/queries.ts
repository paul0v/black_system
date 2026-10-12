'use server'

import { createClient } from '@/lib/firebase/server'
import { checarAutenticado } from '@/lib/auth/session'

export type MovimentacaoCaixa = {
  id: string
  tipo: 'entrada' | 'saida'
  descricao: string
  valor: number
  data: string
  origem: 'os' | 'venda' | 'manual'
  lancamentoId?: string
}

export type ResumoFinanceiro = {
  custoManutencao: number
  receitaManutencao: number
  custoVendas: number
  receitaVendas: number
  entradasManuais: number
  saidasManuais: number
  custoTotal: number
  receitaTotal: number
  lucroTotal: number
}

const RESUMO_VAZIO: ResumoFinanceiro = {
  custoManutencao: 0,
  receitaManutencao: 0,
  custoVendas: 0,
  receitaVendas: 0,
  entradasManuais: 0,
  saidasManuais: 0,
  custoTotal: 0,
  receitaTotal: 0,
  lucroTotal: 0,
}

export async function buscarResumoFinanceiro(): Promise<ResumoFinanceiro> {
  try {
    const bloqueio = await checarAutenticado()
    if (bloqueio) return RESUMO_VAZIO

    const db = await createClient()
    const [{ data: itensOS }, { data: vendas }, { data: itensVenda }, { data: produtos }, { data: lancamentos }] =
      await Promise.all([
        db.from('item_os').select(),
        db.from('venda').select(),
        db.from('item_venda').select(),
        db.from('produto').select(),
        db.from('lancamento_financeiro').select(),
      ])

    const produtosPorId = new Map((produtos || []).map((p: any) => [p.id, p]))

    const custoManutencao = (itensOS || []).reduce(
      (acc: number, item: any) => acc + Number(item.preco_custo) * Number(item.quantidade),
      0
    )
    const receitaManutencao = (itensOS || []).reduce(
      (acc: number, item: any) => acc + Number(item.preco_unitario) * Number(item.quantidade),
      0
    )

    const receitaVendas = (vendas || []).reduce((acc: number, v: any) => acc + Number(v.total), 0)
    const custoVendas = (itensVenda || []).reduce((acc: number, item: any) => {
      const produto = produtosPorId.get(item.produto_id)
      const custoUnitario = produto ? Number(produto.preco_custo) : 0
      return acc + custoUnitario * Number(item.quantidade)
    }, 0)

    const entradasManuais = (lancamentos || [])
      .filter((l: any) => l.tipo === 'entrada')
      .reduce((acc: number, l: any) => acc + Number(l.valor), 0)
    const saidasManuais = (lancamentos || [])
      .filter((l: any) => l.tipo === 'saida')
      .reduce((acc: number, l: any) => acc + Number(l.valor), 0)

    const custoTotal = custoManutencao + custoVendas + saidasManuais
    const receitaTotal = receitaManutencao + receitaVendas + entradasManuais

    return {
      custoManutencao,
      receitaManutencao,
      custoVendas,
      receitaVendas,
      entradasManuais,
      saidasManuais,
      custoTotal,
      receitaTotal,
      lucroTotal: receitaTotal - custoTotal,
    }
  } catch (err) {
    console.error('Erro ao calcular resumo financeiro:', err)
    return RESUMO_VAZIO
  }
}

export async function buscarMovimentacoesCaixa(): Promise<MovimentacaoCaixa[]> {
  try {
    const bloqueio = await checarAutenticado()
    if (bloqueio) return []

    const db = await createClient()
    const [
      { data: itensOS },
      { data: vendas },
      { data: itensVenda },
      { data: produtos },
      { data: ordens },
      { data: lancamentos },
    ] = await Promise.all([
      db.from('item_os').select(),
      db.from('venda').select(),
      db.from('item_venda').select(),
      db.from('produto').select(),
      db.from('ordem_servico').select(),
      db.from('lancamento_financeiro').select(),
    ])

    const produtosPorId = new Map((produtos || []).map((p: any) => [p.id, p]))
    const ordensPorId = new Map((ordens || []).map((o: any) => [o.id, o]))
    const vendasPorId = new Map((vendas || []).map((v: any) => [v.id, v]))

    const movimentacoes: MovimentacaoCaixa[] = []

    for (const item of itensOS || []) {
      const os = ordensPorId.get(item.os_id)
      const numeroOS = os?.numero || item.os_id

      movimentacoes.push({
        id: `entrada-os-${item.id}`,
        tipo: 'entrada',
        descricao: `${item.descricao} (${numeroOS})`,
        valor: Number(item.preco_unitario) * Number(item.quantidade),
        data: item.criado_em,
        origem: 'os',
      })

      if (Number(item.preco_custo) > 0) {
        movimentacoes.push({
          id: `saida-os-${item.id}`,
          tipo: 'saida',
          descricao: `Custo de peça: ${item.descricao} (${numeroOS})`,
          valor: Number(item.preco_custo) * Number(item.quantidade),
          data: item.criado_em,
          origem: 'os',
        })
      }
    }

    for (const venda of vendas || []) {
      movimentacoes.push({
        id: `entrada-venda-${venda.id}`,
        tipo: 'entrada',
        descricao: `Venda ${venda.numero}`,
        valor: Number(venda.total),
        data: venda.data,
        origem: 'venda',
      })
    }

    for (const item of itensVenda || []) {
      const produto = produtosPorId.get(item.produto_id)
      const venda = vendasPorId.get(item.venda_id)
      if (produto && Number(produto.preco_custo) > 0) {
        movimentacoes.push({
          id: `saida-venda-${item.id}`,
          tipo: 'saida',
          descricao: `Custo de produto: ${produto.nome}`,
          valor: Number(produto.preco_custo) * Number(item.quantidade),
          data: venda?.data || new Date().toISOString(),
          origem: 'venda',
        })
      }
    }

    for (const lancamento of lancamentos || []) {
      movimentacoes.push({
        id: `manual-${lancamento.id}`,
        tipo: lancamento.tipo,
        descricao: lancamento.descricao,
        valor: Number(lancamento.valor),
        data: lancamento.data,
        origem: 'manual',
        lancamentoId: lancamento.id,
      })
    }

    return movimentacoes.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
  } catch (err) {
    console.error('Erro ao buscar movimentações de caixa:', err)
    return []
  }
}
