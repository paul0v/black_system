/**
 * Gerador de PDFs para Ordens de Serviço
 * Cria 2 vias: loja e cliente
 */

import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

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
 * Gera PDF com 2 vias (loja e cliente)
 */
export async function gerarPDFOS(data: PDFOSData): Promise<Buffer> {
  // Criar elemento HTML com as 2 vias
  const container = document.createElement('div')
  container.innerHTML = criarHTML2Vias(data)
  container.style.width = '210mm'
  container.style.padding = '0'
  container.style.margin = '0'
  document.body.appendChild(container)

  try {
    // Converter para canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
    })

    // Remover do DOM
    document.body.removeChild(container)

    // Criar PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const imgData = canvas.toDataURL('image/png')
    const imgWidth = 210
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight

    let position = 0

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= 297

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= 297
    }

    return Buffer.from(await pdf.output('arraybuffer'))
  } catch (error) {
    document.body.removeChild(container)
    throw error
  }
}

/**
 * Cria HTML com 2 vias (loja e cliente)
 */
function criarHTML2Vias(data: PDFOSData): string {
  const dataFormatada = new Date(data.dataEntrada).toLocaleDateString('pt-BR')
  const viaHTML = (tipo: 'LOJA' | 'CLIENTE') => `
    <div style="
      page-break-after: always;
      padding: 20px;
      font-family: Arial, sans-serif;
      font-size: 12px;
      border: 1px solid #000;
      margin-bottom: 10px;
    ">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="margin: 0; font-size: 20px;">ORDEM DE SERVIÇO</h1>
        <p style="margin: 5px 0; font-size: 10px; color: #666;">VIA ${tipo}</p>
      </div>

      <div style="border-bottom: 1px solid #000; padding-bottom: 10px; margin-bottom: 10px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="width: 50%; vertical-align: top;">
              <p style="margin: 3px 0;"><strong>OS Nº:</strong> ${data.numero}</p>
              <p style="margin: 3px 0;"><strong>Data:</strong> ${dataFormatada}</p>
            </td>
            <td style="width: 50%; vertical-align: top; text-align: right;">
              <p style="margin: 3px 0;"><strong>Sistema</strong></p>
              <p style="margin: 3px 0; font-size: 10px;">Black System</p>
            </td>
          </tr>
        </table>
      </div>

      <div style="border-bottom: 1px solid #000; padding-bottom: 10px; margin-bottom: 10px;">
        <h3 style="margin: 0 0 5px 0; font-size: 12px;">DADOS DO CLIENTE</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="width: 50%;"><p style="margin: 3px 0;"><strong>Nome:</strong></p></td>
            <td style="width: 50%;"><p style="margin: 3px 0;">${data.cliente.nome}</p></td>
          </tr>
          <tr>
            <td style="width: 50%;"><p style="margin: 3px 0;"><strong>Telefone:</strong></p></td>
            <td style="width: 50%;"><p style="margin: 3px 0;">${data.cliente.telefone}</p></td>
          </tr>
          <tr>
            <td style="width: 50%;"><p style="margin: 3px 0;"><strong>Email:</strong></p></td>
            <td style="width: 50%;"><p style="margin: 3px 0;">${data.cliente.email || '-'}</p></td>
          </tr>
          <tr>
            <td colspan="2"><p style="margin: 3px 0;"><strong>Endereço:</strong> ${data.cliente.endereco || '-'}</p></td>
          </tr>
        </table>
      </div>

      <div style="border-bottom: 1px solid #000; padding-bottom: 10px; margin-bottom: 10px;">
        <h3 style="margin: 0 0 5px 0; font-size: 12px;">DADOS DO EQUIPAMENTO</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="width: 30%;"><p style="margin: 3px 0;"><strong>Tipo:</strong></p></td>
            <td style="width: 70%;"><p style="margin: 3px 0;">${data.equipamento.tipo}</p></td>
          </tr>
          <tr>
            <td style="width: 30%;"><p style="margin: 3px 0;"><strong>Marca:</strong></p></td>
            <td style="width: 70%;"><p style="margin: 3px 0;">${data.equipamento.marca}</p></td>
          </tr>
          <tr>
            <td style="width: 30%;"><p style="margin: 3px 0;"><strong>Modelo:</strong></p></td>
            <td style="width: 70%;"><p style="margin: 3px 0;">${data.equipamento.modelo}</p></td>
          </tr>
          <tr>
            <td style="width: 30%;"><p style="margin: 3px 0;"><strong>IMEI/Serial:</strong></p></td>
            <td style="width: 70%;"><p style="margin: 3px 0;">${data.equipamento.imei}</p></td>
          </tr>
          <tr>
            <td colspan="2"><p style="margin: 3px 0;"><strong>Acessórios:</strong> ${data.equipamento.acessorios || '-'}</p></td>
          </tr>
        </table>
      </div>

      <div style="border-bottom: 1px solid #000; padding-bottom: 10px; margin-bottom: 10px;">
        <h3 style="margin: 0 0 5px 0; font-size: 12px;">DESCRIÇÃO DO DEFEITO</h3>
        <p style="margin: 5px 0; line-height: 1.5; border: 1px solid #ccc; padding: 5px; min-height: 60px;">${data.defeito}</p>
      </div>

      <div style="text-align: center; font-size: 10px; color: #666;">
        <p style="margin: 10px 0;">_______________________________</p>
        <p style="margin: 0;">Assinatura do ${tipo === 'LOJA' ? 'Atendente' : 'Cliente'}</p>
      </div>
    </div>
  `

  return `
    <html>
      <head>
        <style>
          body { margin: 0; padding: 0; }
          @page { margin: 0; }
        </style>
      </head>
      <body>
        ${viaHTML('LOJA')}
        ${viaHTML('CLIENTE')}
      </body>
    </html>
  `
}

/**
 * Faz download do PDF
 */
export async function baixarPDFOS(
  data: PDFOSData,
  nomeArquivo: string = `OS-${data.numero}.pdf`
) {
  try {
    const buffer = await gerarPDFOS(data)
    const blob = new Blob([buffer], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = nomeArquivo
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Erro ao fazer download do PDF:', error)
  }
}
