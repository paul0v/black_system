/**
 * Gerador de PDFs para Ordens de Serviço
 * Cria 2 vias: loja e cliente usando pdfmake
 */

import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'

// Registrar fonts
pdfMake.vfs = pdfFonts.pdfMake.vfs

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
export async function gerarPDFOS(data: PDFOSData): Promise<Blob> {
  const dataFormatada = new Date(data.dataEntrada).toLocaleDateString('pt-BR')

  const conteudoVia = (tipo: 'LOJA' | 'CLIENTE') => [
    // Título
    {
      text: 'ORDEM DE SERVIÇO',
      fontSize: 16,
      bold: true,
      alignment: 'center' as const,
      margin: [0, 0, 0, 2],
    },
    {
      text: `VIA ${tipo}`,
      fontSize: 9,
      alignment: 'center' as const,
      margin: [0, 0, 0, 10],
    },

    // Número e Data
    {
      columns: [
        { text: `OS Nº: ${data.numero}`, fontSize: 10 },
        { text: `Data: ${dataFormatada}`, fontSize: 10, alignment: 'right' as const },
      ],
      margin: [0, 0, 0, 8],
    },

    // Seção Cliente
    {
      text: 'DADOS DO CLIENTE',
      fontSize: 11,
      bold: true,
      margin: [0, 5, 0, 5],
    },
    {
      text: [
        `Nome: ${data.cliente.nome}\n`,
        `Telefone: ${data.cliente.telefone}\n`,
        `Email: ${data.cliente.email || '-'}\n`,
        `Endereço: ${data.cliente.endereco || '-'}`,
      ],
      fontSize: 9,
      margin: [0, 0, 0, 8],
    },

    // Seção Equipamento
    {
      text: 'DADOS DO EQUIPAMENTO',
      fontSize: 11,
      bold: true,
      margin: [0, 5, 0, 5],
    },
    {
      text: [
        `Tipo: ${data.equipamento.tipo}\n`,
        `Marca: ${data.equipamento.marca}\n`,
        `Modelo: ${data.equipamento.modelo}\n`,
        `IMEI/Serial: ${data.equipamento.imei}\n`,
        `Acessórios: ${data.equipamento.acessorios || '-'}`,
      ],
      fontSize: 9,
      margin: [0, 0, 0, 8],
    },

    // Seção Defeito
    {
      text: 'DESCRIÇÃO DO DEFEITO',
      fontSize: 11,
      bold: true,
      margin: [0, 5, 0, 5],
    },
    {
      text: data.defeito,
      fontSize: 9,
      border: [true, true, true, true],
      margin: [0, 0, 0, 20],
      padding: 5,
    },

    // Assinatura
    {
      text: '_____________________________',
      alignment: 'center' as const,
      fontSize: 9,
      margin: [0, 40, 0, 2],
    },
    {
      text: `Assinatura do ${tipo === 'LOJA' ? 'Atendente' : 'Cliente'}`,
      alignment: 'center' as const,
      fontSize: 9,
    },
  ]

  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [20, 20, 20, 20],
    content: [
      ...conteudoVia('LOJA'),
      { text: '', pageBreak: 'after' as const },
      ...conteudoVia('CLIENTE'),
    ],
  }

  return new Promise((resolve, reject) => {
    try {
      pdfMake.createPdf(docDefinition as any).getBlob((blob: Blob) => {
        resolve(blob)
      }, (err: any) => {
        reject(err)
      })
    } catch (error) {
      reject(error)
    }
  })
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
