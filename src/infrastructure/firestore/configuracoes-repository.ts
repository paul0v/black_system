import { createClient } from '@/lib/firebase/server'
import type { ConfiguracoesRepository } from '@/domain/configuracoes/repository'
import type { ConfiguracaoEmpresa, ConfiguracaoWhatsApp, ConfiguracaoPreferencias } from '@/domain/configuracoes/entities'

async function upsert(id: string, dados: Record<string, any>) {
  // `set` com `merge: true` é atômico por documento — cria se não existir, mescla
  // se já existir, sem a corrida de "ler para decidir entre insert/update".
  const db = (await createClient()).raw()
  await db.collection('configuracoes').doc(id).set({ id, ...dados, atualizado_em: new Date().toISOString() }, { merge: true })
}

async function buscar(id: string): Promise<any | null> {
  const db = await createClient()
  const { data } = await db.from('configuracoes').eq('id', id).single()
  return data || null
}

export class FirestoreConfiguracoesRepository implements ConfiguracoesRepository {
  buscarEmpresa(): Promise<ConfiguracaoEmpresa | null> {
    return buscar('empresa')
  }

  salvarEmpresa(dados: ConfiguracaoEmpresa): Promise<void> {
    return upsert('empresa', dados)
  }

  buscarWhatsApp(): Promise<ConfiguracaoWhatsApp | null> {
    return buscar('whatsapp')
  }

  salvarWhatsApp(dados: ConfiguracaoWhatsApp): Promise<void> {
    return upsert('whatsapp', dados)
  }

  buscarPreferencias(): Promise<ConfiguracaoPreferencias | null> {
    return buscar('preferencias')
  }

  salvarPreferencias(dados: ConfiguracaoPreferencias): Promise<void> {
    return upsert('preferencias', dados)
  }
}
