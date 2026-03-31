<!-- Assistência Tech - Sistema de Gestão de Assistência Técnica -->

# Stack e Arquitetura

- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Styling**: Tailwind CSS
- **Banco de Dados**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth com RLS
- **Validação**: Zod
- **Componentes**: shadcn/ui quando necessário
- **Notificações**: Evolution API (WhatsApp) + Resend (Email)

# Estrutura de Módulos

O sistema segue arquitetura em monólito modular com 4 camadas:

1. **Apresentação** (`app/`, `src/components/`) - React components
2. **Aplicação** (`src/modules/*/actions.ts`, `app/api/`)  - Server Actions & API Routes
3. **Domínio** (`src/modules/*/types.ts`, `schema.ts`) - Regras de negócio puras, sem dependências externas
4. **Infraestrutura** (`src/lib/`) - Adaptadores (Supabase, Evolution, Resend)

# Módulos do Sistema

## 1. Módulo de Ordens de Serviço (`src/modules/os/`)
- **Tipos**: `types.ts` (OrdemServico, Equipamento, Cliente, Usuario)
- **Schemas**: `schema.ts` (Zod - validação de entrada)
- **Queries**: `queries.ts` (consultas ao Supabase)
- **Actions**: `actions.ts` (Server Actions para CRUD)

Casos de uso:
- Abrir OS com dados do cliente e equipamento
- Registrar diagnóstico
- Criar orçamento
- Aprovar orçamento
- Concluir serviço
- Gerar documentos (via cliente, termo garantia)

## 2. Módulo de Estoque (`src/modules/estoque/`)
- Cadastro de produtos (peças, acessórios, aparelhos venda)
- Alertas automáticos de estoque baixo
- Movimentação de estoque integrada a OS
- Relatório de peças mais usadas

## 3. Módulo de Vendas (`src/modules/vendas/`)
- PDV (Point of Sale) para acessórios e aparelhos
- Integração com estoque (baixa automática)
- Múltiplas formas de pagamento
- Recibos automatizados

## 4. Módulo de Impressão (`src/modules/impressao/`)
- Geração de PDFs: via cliente, termo garantia, recibo venda
- Integração com `@react-pdf/renderer`
- Automação de impressão em Vercel/Edge

## 5. Módulo de Notificações (`src/modules/notificacoes/`)
- WhatsApp via Evolution API (recebimento OS, orçamento pronto, entrega)
- E-mail via Resend
- Templates por evento

# Padrões de Código

## Server Actions (Next.js 14)
```typescript
// src/modules/os/actions.ts
'use server'

export async function criarOS(input: CriarOSInput) {
  const result = criarOSSchema.parse(input)
  // lógica de negócio
  // chamadas ao Supabase
  return { success: true, id: ... }
}
```

## Validação com Zod
```typescript
// src/modules/os/schema.ts
export const criarOSSchema = z.object({
  cliente_id: z.string().uuid(),
  defeito_relatado: z.string().min(10),
  ...
})
```

## Componentes React
```typescript
// src/components/os/card-os.tsx
'use client'

export function CardOS({ os }: { os: OrdemServico }) {
  return <div>...</div>
}
```

## API Routes (para integrações externas)
```typescript
// app/api/os/route.ts
export async function POST(req: Request) {
  const data = await req.json()
  // processar dados
  return Response.json({...})
}
```

# Desenvolvimento

## Ordem recomendada de implementação

1. **Setup Supabase** (migrations, RLS, seed)
2. **Módulo OS** (coração do sistema)
3. **Impressão** (PDFs: via cliente, garantia)
4. **Estoque** (peças e alertas)
5. **Vendas** (PDV)
6. **Dashboard** (KPIs em tempo real)
7. **Notificações** (WhatsApp, Email)
8. **Relatórios** (financeiro, desempenho)

## Como adicionar funcionalidade

1. Criar schema Zod em `src/modules/MODULO/schema.ts`
2. Criar types em `src/modules/MODULO/types.ts`
3. Implementar Server Actions em `src/modules/MODULO/actions.ts`
4. Implementar queries em `src/modules/MODULO/queries.ts`
5. Criar componentes em `src/components/MODULO/`
6. Criar páginas em `app/MODULO/`

## Variáveis de Ambiente

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
EVOLUTION_API_URL=
EVOLUTION_API_KEY=
RESEND_API_KEY=
NEXT_PUBLIC_APP_URL=
```

# Security & RLS

- Supabase RLS habilitado por perfil (admin, técnico, atendente)
- Middleware de autenticação em rotas protegidas
- Validação Zod em todas APIs
- Service Role Key apenas em Server Actions/API Routes

# Notas Importantes

- Não instalar UI libraries extras (shadcn/ui apenas com `npx shadcn-ui@latest add COMPONENT`)
- Manter types isolados da infraestrutura (sem Supabase em types.ts)
- Usar `'use server'` em Server Actions
- Usar `'use client'` apenas quando necessário (setState, event listeners)
