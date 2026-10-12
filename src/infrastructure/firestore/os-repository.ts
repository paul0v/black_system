import crypto from 'crypto'
import { createClient } from '@/lib/firebase/server'
import { gerarProximoNumeroOS } from '@/lib/firebase/contador-os'
import type { OSRepository, EstatisticasOS } from '@/domain/os/repository'
import type { OrdemServico, NovaOS, NovoItemOS, ItemOS } from '@/domain/os/entities'

function generateId(): string {
  return crypto.randomUUID?.() || `id-${Date.now()}-${Math.random()}`
}

const LIMITE_PADRAO_LISTAGEM = 300

export class FirestoreOSRepository implements OSRepository {
  async criar(numero: string, dados: NovaOS): Promise<OrdemServico> {
    const db = await createClient()
    const osId = generateId()

    const novaOS = {
      id: osId,
      cliente_id: dados.cliente_id,
      numero,
      defeito_relatado: dados.defeito_relatado,
      status: 'aberta',
      data_entrada: dados.data_entrada.toISOString(),
      criado_em: new Date().toISOString(),
      orcamento_aprovado: false,
    }

    const { error: osError } = await db.from('ordem_servico').insert([novaOS])
    if (osError) throw osError

    const novoEquipamento = {
      id: generateId(),
      os_id: osId,
      ...dados.equipamento,
    }

    const { error: equipamentoError } = await db.from('equipamento').insert([novoEquipamento])
    if (equipamentoError) throw equipamentoError

    return { ...novaOS, equipamento: novoEquipamento }
  }

  async buscarPorId(id: string): Promise<OrdemServico | null> {
    const db = await createClient()
    const { data: resultado, error } = await db.from('ordem_servico').select().eq('id', id).single()
    if (error) throw error
    if (!resultado) return null

    const [{ data: equipamento }, { data: itens }, { data: cliente }] = await Promise.all([
      db.from('equipamento').select().eq('os_id', id).single(),
      db.from('item_os').select().eq('os_id', id),
      resultado.cliente_id
        ? db.from('cliente').select().byId(resultado.cliente_id).single()
        : Promise.resolve({ data: null }),
    ])

    return { ...resultado, equipamento: equipamento || null, itens: itens || [], cliente: cliente || null }
  }

  async listarRecentes(limite: number = LIMITE_PADRAO_LISTAGEM): Promise<OrdemServico[]> {
    const db = await createClient()
    const { data: ordens, error } = await db
      .from('ordem_servico')
      .select()
      .order('criado_em', { ascending: false })
      .limit(limite)
    if (error) throw error

    const { data: equipamentos } = await db.from('equipamento').select()
    const equipamentosPorOS = new Map((equipamentos || []).map((eq: any) => [eq.os_id, eq]))

    return (ordens || []).map((os: any) => ({ ...os, equipamento: equipamentosPorOS.get(os.id) || null }))
  }

  async listarPorCliente(clienteId: string): Promise<OrdemServico[]> {
    const db = await createClient()
    const { data, error } = await db.from('ordem_servico').select().eq('cliente_id', clienteId)
    if (error) throw error
    return (data || []).sort(
      (a: any, b: any) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime()
    )
  }

  async atualizarStatus(id: string, novoStatus: string, extras: Record<string, any> = {}): Promise<void> {
    const db = await createClient()
    const { error } = await db.from('ordem_servico').update({ status: novoStatus, ...extras }).eq('id', id)
    if (error) throw error
  }

  async atualizarCampos(id: string, dados: Record<string, any>): Promise<void> {
    const db = await createClient()
    const { error } = await db.from('ordem_servico').update(dados).eq('id', id)
    if (error) throw error
  }

  async aprovarOrcamento(id: string, valor: number): Promise<void> {
    const db = await createClient()
    const { error } = await db
      .from('ordem_servico')
      .update({ orcamento_aprovado: true, valor_orcamento: valor })
      .eq('id', id)
    if (error) throw error
  }

  async deletar(id: string): Promise<void> {
    const db = await createClient()
    const { error } = await db.from('ordem_servico').delete().eq('id', id)
    if (error) throw error
  }

  async estatisticas(): Promise<EstatisticasOS> {
    const db = await createClient()
    const [totalOS, osAberta, osEmReparo, osConcluida, osAprovadas, totalClientes] = await Promise.all([
      db.from('ordem_servico').count(),
      db.from('ordem_servico').eq('status', 'aberta').count(),
      db.from('ordem_servico').in('status', ['em_reparo', 'em_diagnostico']).count(),
      db.from('ordem_servico').in('status', ['concluida', 'entregue']).count(),
      db.from('ordem_servico').eq('orcamento_aprovado', true).count(),
      db.from('cliente').count(),
    ])

    return {
      totalOS: totalOS.data || 0,
      osAberta: osAberta.data || 0,
      osEmReparo: osEmReparo.data || 0,
      osConcluida: osConcluida.data || 0,
      osAprovadas: osAprovadas.data || 0,
      totalClientes: totalClientes.data || 0,
    }
  }

  async adicionarItem(dados: NovoItemOS): Promise<ItemOS> {
    const db = await createClient()
    const novoItem = {
      id: generateId(),
      os_id: dados.os_id,
      descricao: dados.descricao,
      quantidade: dados.quantidade,
      preco_custo: dados.preco_custo,
      preco_unitario: dados.preco_unitario,
      criado_em: new Date().toISOString(),
    }

    const { error } = await db.from('item_os').insert([novoItem])
    if (error) throw error

    return novoItem
  }

  async removerItem(itemId: string): Promise<void> {
    const db = await createClient()
    const { error } = await db.from('item_os').delete().eq('id', itemId)
    if (error) throw error
  }

  async listarItens(osId: string): Promise<ItemOS[]> {
    const db = await createClient()
    const { data, error } = await db.from('item_os').select().eq('os_id', osId)
    if (error) throw error
    return data || []
  }

  async sincronizarValorOrcamento(osId: string): Promise<number> {
    const db = await createClient()
    const { data: itens } = await db.from('item_os').select().eq('os_id', osId)
    const total = (itens || []).reduce((acc: number, item: any) => {
      const quantidade = Number(item.quantidade)
      const precoUnitario = Number(item.preco_unitario)

      if (!Number.isFinite(quantidade) || !Number.isFinite(precoUnitario)) {
        // Item com dado corrompido/ausente: não deixa um NaN silencioso contaminar
        // o orçamento inteiro — ignora esse item no total e avisa no log.
        console.warn(`Item ${item.id} da OS ${osId} tem quantidade/preco_unitario inválido, ignorado no cálculo do orçamento`)
        return acc
      }

      return acc + quantidade * precoUnitario
    }, 0)

    await db.from('ordem_servico').update({ valor_orcamento: total }).eq('id', osId)
    return total
  }

  gerarProximoNumero(): Promise<string> {
    return gerarProximoNumeroOS()
  }
}
