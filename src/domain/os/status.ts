// Fluxo de status da OS — regra de negócio pura, sem nenhuma dependência de
// Next.js ou Firestore. Fonte única de verdade usada tanto pela UI (quais
// transições oferecer) quanto pelos use cases (validar antes de gravar).
export const TRANSICOES_STATUS: Record<string, string[]> = {
  aberta: ['em_diagnostico', 'cancelada'],
  em_diagnostico: ['aguardando_aprovacao', 'aberta', 'cancelada'],
  aguardando_aprovacao: ['em_reparo', 'aberta', 'cancelada'],
  em_reparo: ['concluida', 'aberta', 'cancelada'],
  concluida: ['entregue', 'aberta'],
  entregue: [],
  cancelada: ['aberta'],
}

export function statusSeguintesValidos(statusAtual: string): string[] {
  return TRANSICOES_STATUS[statusAtual] || []
}

export function transicaoValida(statusAtual: string, novoStatus: string): boolean {
  return statusSeguintesValidos(statusAtual).includes(novoStatus)
}
