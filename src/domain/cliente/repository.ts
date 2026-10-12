import type { Cliente, NovoCliente } from './entities'

/**
 * Contrato do repositório de clientes — a camada de aplicação depende só
 * desta interface, nunca de Firestore/Supabase/etc diretamente.
 */
export interface ClienteRepository {
  criar(dados: NovoCliente): Promise<Cliente>
  atualizar(id: string, dados: Partial<NovoCliente>): Promise<void>
  deletar(id: string): Promise<void>
  buscarPorId(id: string): Promise<Cliente | null>

  /** Lista limitada e ordenada por nome — nunca baixa a coleção inteira. */
  listarPagina(limite: number): Promise<Cliente[]>

  /** Busca por prefixo do nome (case-insensitive), para encontrar qualquer
   * cliente sem precisar carregar todos — essencial pra listas limitadas
   * não "esconderem" clientes antigos. */
  buscarPorNome(termo: string, limite: number): Promise<Cliente[]>
}
