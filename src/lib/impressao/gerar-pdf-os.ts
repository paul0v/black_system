/**
 * Gerador de PDFs para Ordens de Serviço
 * Cria 2 vias: loja e cliente usando jsPDF
 */

import { jsPDF } from 'jspdf'

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
 * Gera PDF com 2 vias (loja e cliente) usando jsPDF puro
 */
export async function gerarPDFOS(data: PDFOSData): Promise<Blob> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const dataFormatada = new Date(data.dataEntrada).toLocaleDateString('pt-BR')
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 10

  // VIA 1 - LOJA
  criarViaOS(pdf, data, dataFormatada, 'LOJA', margin, pageWidth, pageHeight)

  // Nova página para VIA 2 - CLIENTE
  pdf.addPage()
  criarViaOS(pdf, data, dataFormatada, 'CLIENTE', margin, pageWidth, pageHeight)

  return pdf.output('blob')
}

function criarViaOS(
  pdf: jsPDF,
  data: PDFOSData,
  dataFormatada: string,
  tipo: 'LOJA' | 'CLIENTE',
  margin: number,
  pageWidth: number,
  pageHeight: number
) {
  let yPos = margin

  // Título
  pdf.setFontSize(16)
  pdf.text('ORDEM DE SERVIÇO', pageWidth / 2, yPos, { align: 'center' })

  pdf.setFontSize(9)
  pdf.text(`VIA ${tipo}`, pageWidth / 2, yPos + 5, { align: 'center' })
  yPos += 12

  // Linha separadora
  pdf.line(margin, yPos, pageWidth - margin, yPos)
  yPos += 3

  // Número e Data
  pdf.setFontSize(11)
  pdf.text(`OS Nº: ${data.numero}`, margin, yPos)
  pdf.text(`Data: ${dataFormatada}`, pageWidth / 2, yPos)
  yPos += 7

  // Linha separadora
  pdf.line(margin, yPos, pageWidth - margin, yPos)
  yPos += 4

  // SEÇÃO: DADOS DO CLIENTE
  pdf.setFontSize(10)
  pdf.setFont(undefined, 'bold')
  pdf.text('DADOS DO CLIENTE', margin, yPos)
  yPos += 5

  pdf.setFont(undefined, 'normal')
  pdf.setFontSize(9)
  pdf.text(`Nome: ${data.cliente.nome}`, margin, yPos)
  yPos += 4
  pdf.text(`Telefone: ${data.cliente.telefone}`, margin, yPos)
  yPos += 4
  pdf.text(`Email: ${data.cliente.email || '-'}`, margin, yPos)
  yPos += 4
  pdf.text(`Endereço: ${data.cliente.endereco || '-'}`, margin, yPos)
  yPos += 6

  // Linha separadora
  pdf.line(margin, yPos, pageWidth - margin, yPos)
  yPos += 4

  // SEÇÃO: DADOS DO EQUIPAMENTO
  pdf.setFont(undefined, 'bold')
  pdf.setFontSize(10)
  pdf.text('DADOS DO EQUIPAMENTO', margin, yPos)
  yPos += 5

  pdf.setFont(undefined, 'normal')
  pdf.setFontSize(9)
  pdf.text(`Tipo: ${data.equipamento.tipo}`, margin, yPos)
  yPos += 4
  pdf.text(`Marca: ${data.equipamento.marca}`, margin, yPos)
  yPos += 4
  pdf.text(`Modelo: ${data.equipamento.modelo}`, margin, yPos)
  yPos += 4
  pdf.text(`IMEI/Serial: ${data.equipamento.imei}`, margin, yPos)
  yPos += 4
  pdf.text(`Acessórios: ${data.equipamento.acessorios || '-'}`, margin, yPos)
  yPos += 6

  // Linha separadora
  pdf.line(margin, yPos, pageWidth - margin, yPos)
  yPos += 4

  // SEÇÃO: DESCRIÇÃO DO DEFEITO
  pdf.setFont(undefined, 'bold')
  pdf.setFontSize(10)
  pdf.text('DESCRIÇÃO DO DEFEITO', margin, yPos)
  yPos += 5

  pdf.setFont(undefined, 'normal')
  pdf.setFontSize(9)
  const defetoText = pdf.splitTextToSize(data.defeito, pageWidth - margin * 2)
  pdf.text(defetoText, margin, yPos)
  yPos += defetoText.length * 4 + 4

  // Linha separadora
  pdf.line(margin, yPos, pageWidth - margin, yPos)
  yPos += 4

  // ASSINATURA (deixar espaço no final)
  const assinadorNome = tipo === 'LOJA' ? 'Atendente' : 'Cliente'
  yPos = pageHeight - 25

  pdf.setFontSize(9)
  pdf.text('Assinatura do ' + assinadorNome, margin, yPos)
  pdf.line(margin, yPos + 3, pageWidth - margin, yPos + 3)
}

/**
 * Faz download do PDF
 */
export async function baixarPDFOS(
  data: PDFOSData,
  nomeArquivo: string = `OS-${data.numero}.pdf`
) {
  try {
    const blob = await gerarPDFOS(data)
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
