/**
 * Gerador de Termo de Garantia (2 vias: Loja e Cliente)
 * Emitido automaticamente quando uma OS é marcada como concluída.
 */
import { LOGO_BLACKCELL_BASE64 } from './logo-blackcell'
import { escapeHtml as esc } from './escape-html'

const EMPRESA_PADRAO = {
  nome: 'BlackCell Assistência Técnica',
  cnpj: '41.173.321/0001-75',
  whatsapp: '(22) 99224-4390',
  endereco: 'R. Vasco Teixeira - Cehab, Miracema - RJ, 28460-000',
  logoBase64: LOGO_BLACKCELL_BASE64,
}

export interface PDFGarantiaData {
  numero: string | number
  cliente: {
    nome: string
    telefone: string
    email?: string
    endereco?: string
  }
  equipamento: {
    tipo: string
    marca: string
    modelo: string
    imei: string
  }
  servicoRealizado: string
  dataConclusao: Date
  empresa?: {
    nome: string
    cnpj: string
    whatsapp: string
    endereco: string
    logoBase64: string
  }
}

export async function gerarPDFGarantia(data: PDFGarantiaData): Promise<Blob> {
  const dataFormatada = new Date(data.dataConclusao).toLocaleDateString('pt-BR')
  const EMPRESA = data.empresa || EMPRESA_PADRAO

  const clausulas = `
        <div class="section clausulas">
          <div class="section-title">1. DANOS FÍSICOS E MAU USO (CAUSAS EXTERNAS)</div>
          <p class="field"><strong>Quedas e Impactos:</strong> Aparelho com tela trincada, quebrada, arranhada, display interno vazado (manchas pretas/murchas) ou carcaça amassada após a entrega.</p>
          <p class="field"><strong>Contato com Líquidos / Oxidação:</strong> Danos causados por água, suor, umidade excessiva, maresia ou qualquer outro fluido (mesmo para aparelhos com certificação IP68, pois o processo de abertura/reparo altera a vedação original de fábrica).</p>
          <p class="field"><strong>Pressão Excessiva:</strong> Danos ao touch/display decorrentes de guardar o celular no bolso traseiro ou colocar objetos pesados sobre ele.</p>

          <div class="section-title">2. SOBRECARGA ELÉTRICA E ACESSÓRIOS INADEQUADOS</div>
          <p class="field"><strong>Danos na Bateria ou Conector de Carga:</strong> Queima ou estufamento causados por carregadores paralelos/veiculares de baixa qualidade, variações bruscas na rede elétrica ou picos de energia (descargas atmosféricas/raios).</p>

          <div class="section-title">3. INTERVENÇÃO DE TERCEIROS E VIOLAÇÃO DO SELO</div>
          <p class="field"><strong>Ruptura do Selo de Garantia:</strong> Qualquer tentativa de abertura do aparelho pelo próprio cliente ou por outra assistência técnica invalida a garantia imediatamente.</p>

          <div class="section-title">4. LIMITAÇÕES DE ESCOPO (OUTROS COMPONENTES)</div>
          <p class="field"><strong>Defeitos em Peças Não Manuseadas:</strong> A garantia cobre exclusivamente o componente substituído ou o circuito reparado.</p>
          <p class="field">Exemplo: Se a loja trocou a tela, a garantia cobre falhas no touch ou imagem. Caso o aparelho apresente defeito no microfone ou na bateria dias depois, isso não faz parte da garantia do serviço anterior.</p>
          <p class="field"><strong>Perda de Dados:</strong> A garantia não se responsabiliza por perda de fotos, contatos ou arquivos em decorrência de falhas posteriores do sistema ou novos defeitos de hardware.</p>
        </div>
  `

  const via = (rotulo: string, assinatura: string) => `
      <div class="page">
        <img class="watermark" src="${EMPRESA.logoBase64}" alt="" />
        <div class="header-empresa">
          <img src="${EMPRESA.logoBase64}" alt="Logo ${esc(EMPRESA.nome)}" />
          <div class="dados-empresa">
            <div class="nome-empresa">${esc(EMPRESA.nome)}</div>
            <div>CNPJ: ${esc(EMPRESA.cnpj)}</div>
            <div>WhatsApp: ${esc(EMPRESA.whatsapp)}</div>
            <div>${esc(EMPRESA.endereco)}</div>
          </div>
        </div>

        <div class="title">TERMO DE GARANTIA</div>
        <div class="via">${esc(rotulo)}</div>

        <div class="section">
          <div>OS Nº: ${esc(data.numero)} | Data de Conclusão: ${dataFormatada}</div>
        </div>

        <div class="section">
          <div class="section-title">DADOS DO CLIENTE</div>
          <div class="field">Nome: ${esc(data.cliente.nome)}</div>
          <div class="field">Telefone: ${esc(data.cliente.telefone)}</div>
          <div class="field">Email: ${esc(data.cliente.email) || '-'}</div>
          <div class="field">Endereço: ${esc(data.cliente.endereco) || '-'}</div>
        </div>

        <div class="section">
          <div class="section-title">DADOS DO EQUIPAMENTO</div>
          <div class="field">Tipo: ${esc(data.equipamento.tipo)}</div>
          <div class="field">Marca: ${esc(data.equipamento.marca)}</div>
          <div class="field">Modelo: ${esc(data.equipamento.modelo)}</div>
          <div class="field">IMEI/Serial: ${esc(data.equipamento.imei)}</div>
        </div>

        <div class="section">
          <div class="section-title">SERVIÇO REALIZADO</div>
          <div class="field">${esc(data.servicoRealizado) || '-'}</div>
        </div>
${clausulas}

        <div class="signature">
          <div class="line"></div>
          <div>Assinatura do ${assinatura}</div>
        </div>
      </div>
  `

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Garantia OS #${esc(data.numero)}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .page { position: relative; page-break-after: always; margin-bottom: 40px; padding: 20px; border: 1px solid #ccc; overflow: hidden; }
        .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 260px; opacity: 0.08; z-index: 0; pointer-events: none; }
        .page > *:not(.watermark) { position: relative; z-index: 1; }
        .header-empresa { display: flex; align-items: center; gap: 14px; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 16px; }
        .header-empresa img { width: 64px; height: 64px; object-fit: contain; border-radius: 8px; }
        .header-empresa .dados-empresa { font-size: 11px; line-height: 1.5; }
        .header-empresa .nome-empresa { font-size: 16px; font-weight: bold; margin-bottom: 2px; }
        .title { text-align: center; font-size: 16px; font-weight: bold; margin-bottom: 20px; }
        .via { text-align: center; font-size: 12px; margin-bottom: 20px; }
        .section { margin: 20px 0; }
        .section-title { font-weight: bold; font-size: 12px; margin-top: 15px; margin-bottom: 5px; border-bottom: 1px solid #000; }
        .field { margin: 3px 0; font-size: 11px; }
        .clausulas .field { font-size: 9px; line-height: 1.4; text-align: justify; margin: 4px 0; color: #222; }
        .signature { margin-top: 40px; text-align: center; }
        .line { border-top: 1px solid #000; width: 200px; margin: 5px auto; }
        @media print { .page { page-break-after: always; } }
      </style>
      <script>
        window.onload = function () { window.print(); };
      </script>
    </head>
    <body>
      ${via('VIA LOJA', 'Atendente')}
      ${via('VIA CLIENTE', 'Cliente')}
    </body>
    </html>
  `

  return new Blob([html], { type: 'text/html' })
}

/**
 * Faz o print do Termo de Garantia via window.print()
 */
export async function baixarPDFGarantia(
  data: PDFGarantiaData,
  nomeArquivo: string = `Garantia-${data.numero}.pdf`,
  janelaPreAberta?: Window | null
) {
  try {
    const blob = await gerarPDFGarantia(data)
    const url = window.URL.createObjectURL(blob)
    // Reaproveita a janela aberta sincronamente no clique (evita bloqueio de
    // pop-up, já que window.open após um await perde o gesto do usuário).
    const janela = janelaPreAberta || window.open(url, '_blank')
    if (janela) {
      janela.location.href = url
    } else {
      console.error('Pop-up bloqueado: não foi possível abrir a via para impressão')
    }
    setTimeout(() => window.URL.revokeObjectURL(url), 60000)
  } catch (error) {
    console.error('Erro ao fazer download da garantia:', error)
  }
}
