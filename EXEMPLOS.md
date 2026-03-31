// EXEMPLOS DE CÓDIGO PARA IMPLEMENTAÇÃO
// Use esses exemplos como referência ao implementar as funcionalidades

// ============================================================================
// 1. EXEMPLO: Criar uma Nova OS com Validação Zod
// ============================================================================

import { criarOSSchema } from '@/modules/os/schema'

async function exemploNovaOS() {
  // Validar entrada
  const dados = {
    cliente_id: '550e8400-e29b-41d4-a716-446655440000',
    defeito_relatado: 'Tela não liga e bateria não carrega',
    equipamento_tipo: 'celular' as const,
    equipamento_marca: 'Apple',
    equipamento_modelo: 'iPhone 14 Pro',
    equipamento_imei: '358331234567890',
    acessorios_entregues: 'Carregador original, fone',
    prazo_estimado: new Date('2026-04-05'),
  }

  // Zod valida e lança erro se inválido
  const valido = criarOSSchema.parse(dados)
  
  // Se chegou aqui, dados estão válidos
  console.log('✅ Dados validados:', valido)
  
  // A partir daqui, implementar:
  // 1. Gerar número único: OS0001, OS0002...
  // 2. Inserir em ordem_servico table
  // 3. Inserir em equipamento table
  // 4. Enviar WhatsApp ao cliente: "Seu aparelho foi recebido! OS #0001"
  // 5. Retornar resultado com ID da OS
}

// ============================================================================
// 2. EXEMPLO: Query ao Supabase (quando configurado)
// ============================================================================

// import { supabaseServer } from '@/lib/supabase/server'

async function exemploQueryOS() {
  // Quando Supabase estiver configurado:
  
  // const { data, error } = await supabaseServer
  //   .from('ordem_servico')
  //   .select(`
  //     *,
  //     cliente: cliente(*),
  //     equipamento: equipamento(*),
  //     tecnico: usuario(nome, perfil)
  //   `)
  //   .eq('status', 'aberta')
  //   .order('data_entrada', { ascending: false })
  //
  // if (error) throw error
  // return data
}

// ============================================================================
// 3. EXEMPLO: Estrutura de Component com Server Action
// ============================================================================

// app/os/nova/page.tsx
// 'use client'
//
// import { useState } from 'react'
// import { criarOS } from '@/modules/os/actions'
// import { criarOSSchema } from '@/modules/os/schema'
//
// export default function NovaOSPage() {
//   const [loading, setLoading] = useState(false)
//   const [erro, setErro] = useState('')
//
//   async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
//     e.preventDefault()
//     setLoading(true)
//
//     try {
//       const formData = new FormData(e.currentTarget)
//       const dados = {
//         cliente_id: formData.get('cliente_id') as string,
//         defeito_relatado: formData.get('defeito_relatado') as string,
//         // ... outros campos
//       }
//
//       // Validar e criar
//       const resultado = await criarOS(dados)
//
//       if (resultado.success) {
//         // Redirecionar para detalhe
//         // push(`/os/${resultado.id}`)
//       } else {
//         setErro(resultado.error || 'Erro ao criar OS')
//       }
//     } catch (err) {
//       setErro(err instanceof Error ? err.message : 'Erro desconhecido')
//     } finally {
//       setLoading(false)
//     }
//   }
//
//   return (
//     <form onSubmit={handleSubmit} className="space-y-4">
//       <input type="hidden" name="cliente_id" value="uuid-cliente" />
//       <textarea
//         name="defeito_relatado"
//         placeholder="Descreva o defeito..."
//         required
//         className="w-full p-2 border rounded"
//       />
//       <button
//         type="submit"
//         disabled={loading}
//         className="px-4 py-2 bg-blue-600 text-white rounded"
//       >
//         {loading ? 'Criando...' : 'Criar OS'}
//       </button>
//       {erro && <p className="text-red-600">{erro}</p>}
//     </form>
//   )
// }

// ============================================================================
// 4. EXEMPLO: RLS (Row Level Security) no Supabase
// ============================================================================

// Executar no editor SQL do Supabase após configurar usuários:

/*
-- Permitir atendente ver TODAS as OS
CREATE POLICY "Atendentes podem ver todas OS"
  ON ordem_servico FOR SELECT
  USING (
    (SELECT perfil FROM usuario WHERE id = auth.uid()) = 'atendente'
  );

-- Permitir técnico ver apenas suas próprias OS
CREATE POLICY "Técnicos veem só suas OS"
  ON ordem_servico FOR SELECT
  USING (
    (SELECT perfil FROM usuario WHERE id = auth.uid()) = 'tecnico'
    AND tecnico_id = auth.uid()
  );

-- Permitir admin ver tudo
CREATE POLICY "Admin vê tudo"
  ON ordem_servico FOR SELECT
  USING (
    (SELECT perfil FROM usuario WHERE id = auth.uid()) = 'admin'
  );
*/

// ============================================================================
// 5. EXEMPLO: Email com Resend
// ============================================================================

// import { Resend } from 'resend'
//
// const resend = new Resend(process.env.RESEND_API_KEY)
//
// async function enviarConfirmacaoEmail(
//   clienteEmail: string,
//   numeroOS: string,
//   cliente: string,
// ) {
//   try {
//     const resultado = await resend.emails.send({
//       from: 'noreply@assistenciatech.com',
//       to: clienteEmail,
//       subject: `Seu aparelho foi recebido - OS #${numeroOS}`,
//       html: `
//         <h1>Bem-vindo ${cliente}!</h1>
//         <p>Seu aparelho foi recebido com sucesso.</p>
//         <p><strong>Número da OS: ${numeroOS}</strong></p>
//         <p>Você poderá acompanhar o status pelo link abaixo:</p>
//         <a href="https://seu-app.com/os/${numeroOS}">
//           Ver status da OS
//         </a>
//       `,
//     })
//
//     console.log('Email enviado:', resultado)
//     return resultado
//   } catch (error) {
//     console.error('Erro ao enviar email:', error)
//     throw error
//   }
// }

// ============================================================================
// 6. EXEMPLO: PDF com React PDF Renderer
// ============================================================================

// import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
//
// const styles = StyleSheet.create({
//   page: { padding: 40 },
//   title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
//   text: { fontSize: 12, marginBottom: 10 },
// })
//
// export function RelatorioOS({ numero, cliente, defeito }: any) {
//   return (
//     <Document>
//       <Page style={styles.page}>
//         <Text style={styles.title}>Via do Cliente</Text>
//         <Text style={styles.text}>Número da OS: {numero}</Text>
//         <Text style={styles.text}>Cliente: {cliente}</Text>
//         <Text style={styles.text}>Defeito: {defeito}</Text>
//       </Page>
//     </Document>
//   )
// }

// ============================================================================
// 7. EXEMPLO: Checklist de Implementação
// ============================================================================

/*
CHECKLIST - Implementação Modular

MÓDULO OS:
  ☐ Implementar criarOS() → Supabase
  ☐ Implementar aprovarOrcamento() → Status update
  ☐ Implementar concluirOS() → Baixar estoque + PDF
  ☐ Implementar listarOS() → Query com filtros
  ☐ Implementar obterOS() → Com relacionamentos
  ☐ Form de nova OS (validation + UX)
  ☐ Página de listagem (tabela + filtros)
  ☐ Página de detalhe (completa)
  ☐ Integração WhatsApp (notificações)
  ☐ Geração PDF (via + garantia)

MÓDULO ESTOQUE:
  ☐ CRUD produtos
  ☐ Alertas de baixo estoque
  ☐ Movimento integrado com OS
  ☐ Relatórios de peças

MÓDULO VENDAS:
  ☐ PDV com carrinho
  ☐ Formas de pagamento
  ☐ Integração estoque
  ☐ Recibos PDF

INFRAESTRUTURA:
  ☐ Autenticação Supabase
  ☐ RLS por perfil
  ☐ Middleware proteção rotas
  ☐ WhatsApp (Evolution API)
  ☐ Email (Resend)

TESTES:
  ☐ Fluxo completo OS
  ☐ Permissões por perfil
  ☐ Relatórios
  ☐ Notificações
*/

// ============================================================================
// 8. EXEMPLO: Estrutura de Erro com Zod
// ============================================================================

import { ZodError } from 'zod'

function formatarErrosZod(erro: ZodError) {
  const erros: Record<string, string> = {}
  
  erro.issues.forEach((issue) => {
    const path = issue.path.join('.')
    erros[path] = issue.message
  })
  
  return erros
}

// Uso:
try {
  criarOSSchema.parse(dados)
} catch (error) {
  if (error instanceof ZodError) {
    const formatted = formatarErrosZod(error)
    console.log('Erros de validação:', formatted)
    // Mostrar erros no form
  }
}

// ============================================================================
// 9. EXEMPLO: Status de OS (cor de badge)
// ============================================================================

const statusColors: Record<string, string> = {
  aberta: 'bg-blue-100 text-blue-800',
  em_diagnostico: 'bg-yellow-100 text-yellow-800',
  aguardando_aprovacao: 'bg-orange-100 text-orange-800',
  em_reparo: 'bg-purple-100 text-purple-800',
  concluida: 'bg-green-100 text-green-800',
  entregue: 'bg-gray-100 text-gray-800',
  cancelada: 'bg-red-100 text-red-800',
}

// Uso:
// <span className={statusColors[status]}>{status}</span>

// ============================================================================
// INICIAR DESENVOLVIMENTO:
// ============================================================================

/*
1. Configure .env.local com credenciais Supabase
2. Crie projeto no Supabase
3. Execute migration 001_init.sql
4. Implemente autenticação
5. Use esses exemplos como referência
6. Teste cada funcionalidade isoladamente
7. Integre com frontend
8. Deploy em Vercel
*/
