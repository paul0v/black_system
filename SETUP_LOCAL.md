# 🚀 Setup para Desenvolvimento Local

## ✅ Status Atual

- ✅ **Etapa 1:** Migrations (001_init, 002_rls, 003_triggers) - COMPLETAS
- ✅ **Etapa 2:** Autenticação Supabase (Login/Signup) - IMPLEMENTADA
- ✅ **Etapa 3:** Layout principal e páginas básicas - IMPLEMENTADO
- 🔄 **Etapa 4:** Servidor rodando em `http://localhost:3000` - EM ANDAMENTO

## 📋 Próximos Passos

### 1. **Configurar Supabase**

```bash
# Crie um arquivo .env.local na raiz do projeto
cp .env.example .env.local
```

### 2. **Adicione suas credenciais Supabase**

Edite `.env.local` e preencha com seus dados do dashboard Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc...
```

### 3. **Execute as migrations no Supabase**

Entre no Supabase Dashboard → sua seção SQL → execute:

1. `supabase/migrations/001_init.sql` - Criar tabelas
2. `supabase/migrations/002_rls.sql` - Configurar RLS
3. `supabase/migrations/003_triggers.sql` - Configurar triggers

### 4. **Teste o servidor local**

```bash
# O servidor já está rodando em:
# http://localhost:3000

# Para acessar:
# - [http://localhost:3000/login](http://localhost:3000/login) - Página de login
# - [http://localhost:3000/signup](http://localhost:3000/signup) - Página de signup
```

## 🧪 Testes Recomendados

### Teste 1: Sigup + Login
1. Ir para [http://localhost:3000/signup](http://localhost:3000/signup)
2. Criar uma conta com:
   - Nome: "João Silva"
   - Email: "joao@teste.com"
   - Perfil: "tecnico"
   - Senha: "Senha123"
3. Sistema vai redirecionar para `/os`
4. Fazer logout e testar login

### Teste 2: Testes RLS
1. Criar 2 contas:
   - Admin
   - Técnico
2. Logar como técnico:
   - Criar uma OS
   - Verificar que só vê suas próprias OSs
3. Logar como admin:
   - Verificar que vê todas as OSs

### Teste 3: Rotas protegidas
1. Sem autenticação:
   - Acessar [http://localhost:3000/os](http://localhost:3000/os) → Redireciona para `/login` ✅
2. Com autenticação:
   - Logar → Acessar `/os` → Carrega página ✅

## 🐛 Erros Comuns

| Erro | Solução |
|------|---------|
| "NEXT_PUBLIC_SUPABASE_URL não definido" | Crie `.env.local` com credenciais |
| "Auth User not found" | User não foi criado na tabela `usuario` |
| "RLS policy violation" | Verifique se as políticas foram executadas |
| "Porta 3000 em uso" | Kill: `Get-Process node \| Stop-Process -Force` |

## 📚 Stack Tecnológico

- **Frontend:** Next.js 14 + TypeScript + Tailwind CSS
- **Backend:** Supabase (PostgreSQL) + Server Actions
- **Autenticação:** Supabase Auth com RLS
- **Validação:** Zod
- **UI:** Lucide React (ícones)

## 🔗 Arquivo de Configuração

Veja [.github/copilot-instructions.md](.github/copilot-instructions.md) para mais detalhes de arquitetura e padrões de código.

## ✨ Próximo Passo Após Validação Local

Quando todos os testes passarem, será hora de fazer deploy no Vercel:

```bash
npx vercel
```

Configur evercel com suas variáveis de ambiente (.env production) e está pronto! 🎉
