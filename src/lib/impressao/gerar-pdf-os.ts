/**
 * Gerador de PDFs para Ordens de Serviço
 * Versão simplificada usando HTML to PDF
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

export interface PDFOSData {
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
    acessorios: string
  }
  defeito: string
  dataEntrada: Date
  tecnico?: string
  empresa?: {
    nome: string
    cnpj: string
    whatsapp: string
    endereco: string
    logoBase64: string
  }
  prazoRetiradaDias?: number
  prazoAbandonoDias?: number
}

/**
 * Função simplificada de download de PDF
 * Por enquanto, export as HTML para impressão
 */
export async function gerarPDFOS(data: PDFOSData): Promise<Blob> {
  const dataFormatada = new Date(data.dataEntrada).toLocaleDateString('pt-BR')
  const EMPRESA = data.empresa || EMPRESA_PADRAO
  const prazoRetirada = data.prazoRetiradaDias ?? 30
  const prazoAbandono = data.prazoAbandonoDias ?? 90

  const clausulas = `
        <div class="section clausulas">
          <div class="section-title">CLÁUSULA DE RETIRADA, ARMAZENAMENTO E ABANDONO</div>
          <p class="field"><strong>Prazo de Retirada:</strong> O cliente compromete-se a retirar o equipamento no prazo máximo de ${prazoRetirada} dias a contar da data de notificação de conclusão do serviço ou orçamento.</p>
          <p class="field"><strong>Presunção de Abandono (Prazo de ${prazoAbandono} dias):</strong> Decorrido o prazo de ${prazoAbandono} dias contados da notificação do cliente sem a devida retirada do aparelho e sem o pagamento mínimo de 50% do valor do serviço, o equipamento será considerado legalmente abandonado pelo proprietário, nos termos do Art. 1.275, III, do Código Civil Brasileiro.</p>
          <p class="field"><strong>Destinação do Bem:</strong> Diante da caracterização do abandono e do inadimplemento do cliente, a assistência técnica fica expressamente autorizada a vender, desfazer-se ou utilizar o equipamento para cobrir as despesas de peças, mão de obra empregada, testes e custos de armazenamento acumulados.</p>

          <div class="section-title">TERMO DE CIÊNCIA E AUTORIZAÇÃO PARA REPARO AVANÇADO EM PLACA</div>
          <p class="field">Aparelhos que dão entrada com falhas graves (curto-circuito, danos por líquido, quedas ou aquecimento) possuem componentes integrados em estado crítico.</p>
          <p class="field">O processo de diagnóstico e reparo exige aplicação de calor excessivo (micro-soldagem), remoção de blindagens e testes energizados que podem sobrecarregar componentes já fragilizados.</p>
          <p class="field">O cliente autoriza o procedimento estando plenamente ciente de que o aparelho pode parar de ligar ou sofrer perda irreversível de dados durante a intervenção, sem que isso configure imperícia técnica, mas sim consequência do dano pré-existente no hardware.</p>
        </div>
  `

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>OS #${esc(data.numero)}</title>
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

        <div class="title">ORDEM DE SERVIÇO</div>
        <div class="via">VIA LOJA</div>

        <div class="section">
          <div>OS Nº: ${esc(data.numero)} | Data: ${dataFormatada}</div>
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
          <div class="field">Acessórios: ${esc(data.equipamento.acessorios) || '-'}</div>
        </div>

        <div class="section">
          <div class="section-title">DESCRIÇÃO DO DEFEITO</div>
          <div class="field">${esc(data.defeito)}</div>
        </div>
${clausulas}

        <div class="signature">
          <div class="line"></div>
          <div>Assinatura do Atendente</div>
        </div>
      </div>

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

        <div class="title">ORDEM DE SERVIÇO</div>
        <div class="via">VIA CLIENTE</div>

        <div class="section">
          <div>OS Nº: ${esc(data.numero)} | Data: ${dataFormatada}</div>
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
          <div class="field">Acessórios: ${esc(data.equipamento.acessorios) || '-'}</div>
        </div>

        <div class="section">
          <div class="section-title">DESCRIÇÃO DO DEFEITO</div>
          <div class="field">${esc(data.defeito)}</div>
        </div>
${clausulas}

        <div class="signature">
          <div class="line"></div>
          <div>Assinatura do Cliente</div>
        </div>
      </div>
    </body>
    </html>
  `

  return new Blob([html], { type: 'text/html' })
}

/**
 * Faz o print do PDF via window.print()
 */
export async function baixarPDFOS(
  data: PDFOSData,
  nomeArquivo: string = `OS-${data.numero}.pdf`,
  janelaPreAberta?: Window | null
) {
  try {
    const blob = await gerarPDFOS(data)
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
    console.error('Erro ao fazer download do PDF:', error)
  }
}
