import type { OrdemServico, NovaOS, NovoItemOS, ItemOS } from './entities'

export interface EstatisticasOS {
  totalOS: number
  osAberta: number
  osEmReparo: number
  osConcluida: number
  osAprovadas: number
  totalClientes: number
}

/**
 * Contrato do repositório de Ordens de Serviço. A camada de aplicação (use
 * cases) só conhece esta interface — quem souber que por trás tem Firestore é
 * só a implementação em src/infrastructure/firestore/os-repository.ts.
 */
export interface OSRepository {
  criar(numero: string, dados: NovaOS): Promise<OrdemServico>
  buscarPorId(id: string): Promise<OrdemServico | null>
  listarRecentes(limite: number): Promise<OrdemServico[]>
  listarPorCliente(clienteId: string): Promise<OrdemServico[]>
  atualizarStatus(id: string, novoStatus: string, extras?: Record<string, any>): Promise<void>
  atualizarCampos(id: string, dados: Record<string, any>): Promise<void>
  aprovarOrcamento(id: string, valor: number): Promise<void>
  deletar(id: string): Promise<void>
  estatisticas(): Promise<EstatisticasOS>

  adicionarItem(dados: NovoItemOS): Promise<ItemOS>
  removerItem(itemId: string): Promise<void>
  listarItens(osId: string): Promise<ItemOS[]>
  sincronizarValorOrcamento(osId: string): Promise<number>

  gerarProximoNumero(): Promise<string>
}
