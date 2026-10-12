# BlackCell - Sistema de Gestão de Assistência Técnica

Sistema web para gerenciamento de assistência técnica (ordens de serviço, clientes, estoque, vendas e financeiro), desenvolvido com **Next.js 16**, **React 19**, **TypeScript**, **Tailwind CSS** e **Firebase (Firestore + Firebase Admin)**.

## 🎯 Funcionalidades Principais

### Módulo de Ordens de Serviço (OS)
- ✅ Abertura de OS com dados do cliente e equipamento, checklist de entrada e fotos
- ✅ Numeração sequencial automática (OS-0001, OS-0002...)
- ✅ Rastreamento de status (aberta → diagnóstico → aprovação → reparo → concluída → entregue)
- ✅ Orçamento por itens, com aprovação do cliente
- ✅ Impressão automática em 2 vias (loja e cliente), com logo e dados da empresa
- ✅ Termo de garantia impresso automaticamente ao concluir a OS
- ✅ Notificação automática por WhatsApp (orçamento pronto / equipamento pronto)

### Módulo de Estoque
- ✅ Cadastro de peças, acessórios e aparelhos para venda
- ✅ Alertas de estoque baixo/zerado
- ✅ Estoque mínimo padrão configurável

### Módulo de Vendas (PDV)
- ✅ Ponto de venda para acessórios e aparelhos
- ✅ Baixa de estoque atômica (transação do Firestore) com validação de disponibilidade — não permite vender mais do que há em estoque, mesmo com vendas simultâneas

### Configurações
- ✅ Dados da empresa (nome, CNPJ, WhatsApp, endereço, logo) usados nos documentos impressos
- ✅ Gestão de usuários (criar, trocar perfil, ativar/desativar) — somente admin
- ✅ Integração WhatsApp (Evolution API)
- ✅ Preferências: checklist de entrada, estoque mínimo padrão, prazos de retirada/abandono

### Controle de Acesso
- ✅ 3 perfis: Admin, Técnico, Atendente
- ✅ Sessão de servidor assinada (cookie httpOnly + HMAC), verificada em toda Server Action sensível
- ✅ Ações administrativas (criar/desativar usuário, deletar OS, configurações) restritas a admin

## 🏗️ Arquitetura

Arquitetura modular por domínio, usando Next.js App Router com Server Actions:

```
Apresentação   → React Components (app/*, src/components/*)
Aplicação      → Server Actions (src/modules/*/actions.ts, queries.ts)
Domínio        → Schemas Zod, tipos (src/modules/*/schema.ts, types.ts)
Infraestrutura → Firebase Admin SDK, sessão, impressão, WhatsApp (src/lib/*)
```

O acesso ao Firestore é feito por um adaptador (`src/lib/firebase/firestore-client.ts`) que expõe uma API no estilo `.from(tabela).select().eq().single()`, rodando sobre o Firebase Admin SDK.

## 🛠️ Stack de Tecnologias

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Linguagem**: TypeScript
- **Styling**: Tailwind CSS 4
- **Banco de dados**: Firebase Firestore (via Firebase Admin SDK)
- **Autenticação**: Firebase Auth (login) + sessão própria assinada (cookie httpOnly)
- **Validação**: Zod
- **Ícones**: Lucide React
- **WhatsApp**: Evolution API (self-hosted)

## 📋 Pré-requisitos

- Node.js 18+
- npm
- Um projeto Firebase com Firestore e Authentication habilitados

## 🚀 Como Usar

### 1. Instalação
```bash
npm install
```

### 2. Variáveis de Ambiente

Crie um `.env.local` na raiz com:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=sua-web-api-key
FIREBASE_PROJECT_ID=seu-projeto
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@seu-projeto.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Sessão (gere um valor aleatório forte, ex: openssl rand -hex 32)
SESSION_SECRET=
```

A `NEXT_PUBLIC_FIREBASE_API_KEY` vem do Console do Firebase → Configurações do projeto → Geral → app Web. As demais (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`) vêm de uma chave de conta de serviço (Configurações → Contas de serviço → Gerar nova chave privada).

### 3. Popular dados de exemplo (opcional)
```bash
npm run seed
```

### 4. Desenvolvimento
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000). Crie sua primeira conta em `/signup` (nasce como perfil "atendente"; promova para admin depois em Configurações → Usuários, usando uma conta admin já existente ou editando o Firestore diretamente na primeira vez).

### 5. Build para Produção
```bash
npm run build
npm start
```

### 6. Testes
```bash
npm test                 # testes unitários (lógica pura: schemas, sessão, filtros)
npm run test:integration # testes de integração contra o emulador do Firestore (requer Java 21+)
```

Os testes de integração sobem o emulador automaticamente (`firebase emulators:exec`), rodam a suíte e derrubam tudo ao final — não tocam no Firestore real.

## 📁 Estrutura do Projeto

```
app/                     # Rotas (App Router)
  ├── os/                 # Ordens de Serviço (lista, detalhe, nova)
  ├── clientes/, estoque/, vendas/, financeiro/, dashboard/
  ├── configuracoes/      # Empresa, Usuários, WhatsApp, Preferências
  └── login/, signup/

src/
  ├── modules/            # Lógica de negócio por domínio (actions.ts, queries.ts, schema.ts)
  │   ├── auth/, os/, cliente/, estoque/, vendas/, usuarios/, configuracoes/
  │   └── notificacoes/, impressao/
  ├── lib/
  │   ├── firebase/        # Admin SDK, adaptador de query, contador de OS
  │   ├── auth/             # Sessão assinada (cookie httpOnly)
  │   ├── impressao/        # Geração de PDF (OS e garantia)
  │   └── notificacoes/      # Integração WhatsApp (Evolution API)
  └── components/          # Componentes React reutilizáveis

scripts/
  └── seed-firestore.ts    # Popula dados de exemplo no Firestore
```

## 🔒 Segurança

- Login via Firebase Auth (REST), com verificação de usuário ativo no Firestore
- Sessão de servidor própria: cookie **httpOnly**, assinado com **HMAC-SHA256** (`SESSION_SECRET`) — não é o localStorage/cookie que o navegador pode forjar
- Toda Server Action sensível valida a sessão (`checarAutenticado`/`checarPerfil`) antes de tocar no banco
- Ações administrativas (gestão de usuários, configurações, exclusão de OS/produto/cliente) restritas ao perfil admin
- Autocadastro público (`/signup`) sempre cria conta com perfil "atendente" — promoção de perfil só por um admin
- Validação de entrada com Zod nas Server Actions principais

## 📞 Roadmap / Próximos Passos

- [ ] Conectar uma instância real da Evolution API em produção
- [ ] Relatórios financeiros e de faturamento
- [ ] Busca server-side de clientes (hoje a listagem de clientes não é paginada)

## 📄 Licença

Proprietário - BlackCell Assistência Técnica

---

**Sistema de gestão para assistência técnica, feito sob medida para pequenos negócios.**
