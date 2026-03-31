/**
 * Gerador de PDFs para Ordens de Serviço
 * Versão simplificada usando HTML to PDF
 */

export interface PDFOSData {
  numero: number
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
}

/**
 * Função simplificada de download de PDF
 * Por enquanto, export as HTML para impressão
 */
export async function gerarPDFOS(data: PDFOSData): Promise<Blob> {
  const dataFormatada = new Date(data.dataEntrada).toLocaleDateString('pt-BR')

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>OS #${data.numero}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .page { page-break-after: always; margin-bottom: 40px; padding: 20px; border: 1px solid #ccc; }
        .title { text-align: center; font-size: 16px; font-weight: bold; margin-bottom: 20px; }
        .via { text-align: center; font-size: 12px; margin-bottom: 20px; }
        .section { margin: 20px 0; }
        .section-title { font-weight: bold; font-size: 12px; margin-top: 15px; margin-bottom: 5px; border-bottom: 1px solid #000; }
        .field { margin: 3px 0; font-size: 11px; }
        .signature { margin-top: 40px; text-align: center; }
        .line { border-top: 1px solid #000; width: 200px; margin: 5px auto; }
        @media print { .page { page-break-after: always; } }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="title">ORDEM DE SERVIÇO</div>
        <div class="via">VIA LOJA</div>
        
        <div class="section">
          <div>OS Nº: ${data.numero} | Data: ${dataFormatada}</div>
        </div>

        <div class="section">
          <div class="section-title">DADOS DO CLIENTE</div>
          <div class="field">Nome: ${data.cliente.nome}</div>
          <div class="field">Telefone: ${data.cliente.telefone}</div>
          <div class="field">Email: ${data.cliente.email || '-'}</div>
          <div class="field">Endereço: ${data.cliente.endereco || '-'}</div>
        </div>

        <div class="section">
          <div class="section-title">DADOS DO EQUIPAMENTO</div>
          <div class="field">Tipo: ${data.equipamento.tipo}</div>
          <div class="field">Marca: ${data.equipamento.marca}</div>
          <div class="field">Modelo: ${data.equipamento.modelo}</div>
          <div class="field">IMEI/Serial: ${data.equipamento.imei}</div>
          <div class="field">Acessórios: ${data.equipamento.acessorios || '-'}</div>
        </div>

        <div class="section">
          <div class="section-title">DESCRIÇÃO DO DEFEITO</div>
          <div class="field">${data.defeito}</div>
        </div>

        <div class="signature">
          <div class="line"></div>
          <div>Assinatura do Atendente</div>
        </div>
      </div>

      <div class="page">
        <div class="title">ORDEM DE SERVIÇO</div>
        <div class="via">VIA CLIENTE</div>
        
        <div class="section">
          <div>OS Nº: ${data.numero} | Data: ${dataFormatada}</div>
        </div>

        <div class="section">
          <div class="section-title">DADOS DO CLIENTE</div>
          <div class="field">Nome: ${data.cliente.nome}</div>
          <div class="field">Telefone: ${data.cliente.telefone}</div>
          <div class="field">Email: ${data.cliente.email || '-'}</div>
          <div class="field">Endereço: ${data.cliente.endereco || '-'}</div>
        </div>

        <div class="section">
          <div class="section-title">DADOS DO EQUIPAMENTO</div>
          <div class="field">Tipo: ${data.equipamento.tipo}</div>
          <div class="field">Marca: ${data.equipamento.marca}</div>
          <div class="field">Modelo: ${data.equipamento.modelo}</div>
          <div class="field">IMEI/Serial: ${data.equipamento.imei}</div>
          <div class="field">Acessórios: ${data.equipamento.acessorios || '-'}</div>
        </div>

        <div class="section">
          <div class="section-title">DESCRIÇÃO DO DEFEITO</div>
          <div class="field">${data.defeito}</div>
        </div>

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
  nomeArquivo: string = `OS-${data.numero}.pdf`
) {
  try {
    const blob = await gerarPDFOS(data)
    const url = window.URL.createObjectURL(blob)
    const iframe = document.createElement('iframe')
    iframe.style.display = 'none'
    iframe.src = url
    document.body.appendChild(iframe)
    
    iframe.onload = () => {
      iframe.contentWindow?.print()
      setTimeout(() => {
        document.body.removeChild(iframe)
        window.URL.revokeObjectURL(url)
      }, 1000)
    }
  } catch (error) {
    console.error('Erro ao fazer download do PDF:', error)
  }
}
