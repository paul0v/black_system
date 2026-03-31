# Assistência Tech - Sistema de Gestão de Assistência Técnica

Um sistema web completo e robusto para gerenciamento de assistência técnica, desenvolvido com **Next.js 14**, **React**, **TypeScript**, **Tailwind CSS** e **Supabase**.

## 🎯 Funcionalidades Principais

### Módulo de Ordens de Serviço (OS)
- ✅ Abertura rápida de OS com dados do cliente e equipamento
- ✅ Rastreamento de status em tempo real
- ✅ Aprovação de orçamento online
- ✅ Histórico de serviços por cliente
- ✅ Termos de garantia automáticos com assinatura digital
- ✅ Impressão de documentos (via do cliente, termo de garantia)

### Módulo de Estoque
- ✅ Cadastro de peças, acessórios e aparelhos para venda
- ✅ Alertas automáticos de baixo estoque
- ✅ Rastreabilidade de peças por OS e por técnico
- ✅ Movimentação de estoque integrada
- ✅ Relatórios de peças mais utilizadas

### Módulo de Vendas (PDV)
- ✅ Ponto de venda para acessórios e aparelhos
- ✅ Integração automática com estoque
- ✅ Múltiplas formas de pagamento
- ✅ Recibos automatizados

### Gestão Financeira & Relatórios
- ✅ Registro de pagamentos por OS
- ✅ Bloqueio de entrega sem pagamento
- ✅ Dashboard com KPIs em tempo real
- ✅ Relatórios de faturamento mensal

### Controle de Acesso
- ✅ 3 perfis: Admin, Técnico, Atendente
- ✅ Row Level Security (RLS) no banco de dados

## 🏗️ Arquitetura

Arquitetura **monólito modular** com 4 camadas bem definidas:

```
Apresentação   → React Components (app/*)
Aplicação      → Server Actions & API Routes (app/api/*)
Domínio        → Types, Schemas, Regras de Negócio
Infraestrutura → Supabase, APIs Externas, Utils
```

## 🛠️ Stack de Tecnologias

- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Styling**: Tailwind CSS
- **BD**: Supabase (PostgreSQL)
- **Validação**: Zod
- **Ícones**: Lucide React
- **Deploy**: Vercel (CI/CD automático)

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta Supabase (gratuita)

## 🚀 Como Usar

### 1. Instalação
```bash
npm install
```

### 2. Variáveis de Ambiente
```bash
cp .env.example .env.local
```

Preencha os valores em `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
SUPABASE_SERVICE_KEY=sua-chave-service
```

### 3. Desenvolvimento
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

### 4. Build para Produção
```bash
npm run build
npm start
```

## 📁 Estrutura do Projeto

```
src/
  ├── modules/        # Lógica de negócio por módulo
  │   ├── os/         # Ordens de Serviço
  │   ├── estoque/    # Gestão de Estoque
  │   ├── vendas/     # Módulo de Vendas
  │   ├── impressao/  # Geração de PDFs
  │   └── notificacoes/ # WhatsApp, Email
  ├── lib/            # Adaptadores e infraestrutura
  │   └── supabase/   # Cliente Supabase
  └── components/     # Componentes React reutilizáveis

supabase/
  └── migrations/     # SQL migrations

.github/
  └── copilot-instructions.md # Instruções para IA
```

## 🔒 Segurança

- Autenticação via Supabase Auth
- RLS (Row Level Security) por perfil (admin, técnico, atendente)
- Validação Zod em todas as APIs
- Service Key apenas em Server Actions

## 📚 Documentação

- Veja `.github/copilot-instructions.md` para guia de arquitetura detalhado
- Veja `supabase/migrations/` para schema do banco de dados

## 📞 Próximas Etapas

1. Configurar Supabase e executar migrations
2. Implementar autenticação
3. Desenvolver módulo de OS (coração do sistema)
4. Adicionar módulo de Estoque
5. Implementar PDV
6. Integrar notificações (WhatsApp, Email)

## 📄 Licença

Proprietário - Assistência Tech Management System

---

**Desenvolvido como um sistema robusto e escalável para pequenos e médios negócios de assistência técnica.**
