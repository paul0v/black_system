import type { Venda, NovaVenda } from './entities'

export interface VendaRepository {
  /**
   * Registra a venda e debita o estoque de cada item numa única operação
   * atômica: ou tudo acontece, ou nada acontece — mesmo com vendas
   * concorrentes do mesmo produto, o estoque nunca fica negativo.
   *
   * Lança `NaoEncontradoError` se algum produto não existir, ou
   * `EstoqueInsuficienteError` se a quantidade disponível for menor que a
   * solicitada. Nenhum dos dois casos deixa resíduo gravado.
   */
  registrar(venda: NovaVenda): Promise<Venda>
}
