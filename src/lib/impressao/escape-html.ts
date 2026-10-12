/**
 * Escapa texto antes de inserir em template HTML interpolado (`${...}`).
 * Sem isso, um nome de cliente ou descrição de defeito como
 * `<img src=x onerror=...>` executaria ao abrir a via impressa.
 */
export function escapeHtml(valor: unknown): string {
  if (valor === null || valor === undefined) return ''
  return String(valor)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
