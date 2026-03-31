# 🚀 Guia para Executar Migrations

Você tem 2 opções para executar as migrations:

## ✅ Opção 1: Via Terminal (Recomendado - Mais rápido)

```bash
# 1. Instale o Supabase CLI se não tiver
npm install -g supabase

# 2. Faça login
supabase login

# 3. Copie sua URL do projeto do Supabase:
# https://cleyfwmssoesislqkbmn.supabase.co
# O "cleyfwmssoesislqkbmn" é seu PROJECT-REF

# 4. Execute:
supabase link --project-ref cleyfwmssoesislqkbmn

# 5. Execute as migrations:
npx ts-node scripts/migrate.ts

# Pronto! 🎉
```

---

## ✅ Opção 2: Via Supabase Dashboard (Sem CLI)

Se preferir sem instalar nada:

1. Abra: https://app.supabase.com
2. Entre no seu projeto
3. Vá para **SQL Editor** (menu lateral)
4. **Cole cada arquivo SQL abaixo em ordem:**

### 📄 Arquivo 1: `001_init.sql` (Criar Tabelas)

Clique em "New Query" e cole O ARQUIVO INTEIRO de:
`supabase/migrations/001_init.sql`

Depois clique **RUN** (triângulo verde) ▶️

### 📄 Arquivo 2: `002_rls.sql` (Segurança)

Clique em "New Query" e cole O ARQUIVO INTEIRO de:
`supabase/migrations/002_rls.sql`

Depois clique **RUN** ▶️

### 📄 Arquivo 3: `003_triggers.sql` (Automação)

Clique em "New Query" e cole O ARQUIVO INTEIRO de:
`supabase/migrations/003_triggers.sql`

Depois clique **RUN** ▶️

---

## ✅ Opção 3: Via psql (Direto no PostgreSQL)

```bash
# Use a string de conexão do Supabase
psql "postgresql://postgres:YOUR-PASSWORD@db.cleyfwmssoesislqkbmn.supabase.co:5432/postgres"

# Depois cole cada SQL file
\i supabase/migrations/001_init.sql
\i supabase/migrations/002_rls.sql
\i supabase/migrations/003_triggers.sql
```

---

## ✨ Depois que Executar

```bash
# Volte à pasta do projeto
cd c:\Users\PauloVictor\Desktop\black_system

# Reinicie o servidor
npm run dev

# Acesse
http://localhost:3001/signup
```

Qual opção você prefere? 🤔
