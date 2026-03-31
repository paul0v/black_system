# Sistema Centralizado de Tratamento de Erros

## 📋 Overview

Sistema robusto e consistente para tratamento de erros em toda aplicação Black System. Fornece camadas para:
- Validação (Zod)
- Banco de dados (Supabase)
- Integrações externas
- Logging estruturado
- Error Boundaries em React
- Notificações
- Resposta padronizada em todas as camadas

---

## 🏗️ Arquitetura

```
src/lib/errors/
├── app-error.ts          # Classes e tipos de erro
├── error-handler.ts      # Handlers centralizados
├── logger.ts             # Sistema de logging
└── index.ts              # Exportações
```

---

## 🚀 Como Usar

### 1. Server Actions (Forma Recomendada)

```typescript
// ✅ PADRÃO RECOMENDADO - Usar handleServerAction

'use server'
import { handleServerAction, logBusinessEvent } from '@/lib/errors'

export async function minhaAction(input: Input): Promise<ActionResponse> {
  return handleServerAction(async () => {
    // Validação automática de erro Zod
    const dados = meuSchema.parse(input)
    
    // Chamar Supabase
    const { data, error } = await supabase...
    if (error) throw error  // Automático: tratado como DatabaseError
    
    // Log de negócio
    logBusinessEvent('Ação executada', 'module.actions', {
      userId: user.id,
      resultado: data
    })
    
    return { success: true, data }
  }, 'minhaAction')
}
```

### 2. Componentes React com Erro

```typescript
'use client'
import { useToast } from '@/components/error/error-toast'

export function MeuComponente() {
  const { error, success } = useToast()
  
  const handleSubmit = async (formData) => {
    try {
      const result = await criarOS(formData)
      if (!result.success) {
        error(result.error)  // Mostra toast de erro
        return
      }
      success('OS criada com sucesso!')
    } catch (err) {
      error('Erro ao criar OS')
    }
  }
  
  return (...)
}
```

### 3. Componentes com Validação

```typescript
'use client'
import { FormErrors } from '@/components/error/error-toast'

export function FormOS() {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>()
  
  const handleSubmit = async (formData) => {
    const result = await criarOS(formData)
    if (!result.success && result.fieldErrors) {
      setFieldErrors(result.fieldErrors)  // Mostra erros por campo
      return
    }
  }
  
  return (
    <>
      <FormErrors errors={fieldErrors} />
      {/* ... form fields ... */}
    </>
  )
}
```

### 4. Error Boundary

```typescript
// app/layout.tsx
import { ErrorBoundary } from '@/components/error/error-boundary'

export default function RootLayout({ children }) {
  return (
    <ErrorBoundary context="RootLayout">
      {children}
    </ErrorBoundary>
  )
}
```

---

## 📝 Tipos de Erro

```typescript
enum ErrorType {
  // Validação
  VALIDATION_ERROR         // 400
  
  // Autenticação
  AUTH_ERROR              // 401
  UNAUTHORIZED            // 401
  NOT_AUTHENTICATED       // 401
  
  // Recursos
  NOT_FOUND               // 404
  FORBIDDEN               // 403
  CONFLICT                // 409 (duplicado)
  UNIQUE_VIOLATION        // 409 (constraint)
  CONSTRAINT_VIOLATION    // 409
  
  // Banco de dados
  DATABASE_ERROR          // 500
  
  // APIs Externas
  EXTERNAL_API_ERROR      // 502
  WHATSAPP_ERROR          // 502
  EMAIL_ERROR             // 502
  
  // Sistema
  NETWORK_ERROR           // 503
  TIMEOUT_ERROR           // 504
  INTERNAL_ERROR          // 500
  
  // Negócio
  BUSINESS_LOGIC_ERROR    // 400
  INVALID_STATE           // 400
}
```

---

## 🔍 Logging

### Log de Erro
```typescript
import { logError } from '@/lib/errors'

try {
  // operação
} catch (err) {
  logError(err, { userId, operacao: 'criar_os' }, 'criarOS')
}
```

### Log de Evento de Negócio
```typescript
import { logBusinessEvent } from '@/lib/errors'

logBusinessEvent('OS Criada', 'os.actions', {
  osId: os.id,
  clienteId: cliente.id,
  valor: 1500.00
})
```

### Log de Requisição HTTP
```typescript
import { logRequest } from '@/lib/errors'

logRequest('GET', '/api/os/123', 200, 45, { userId: '...' })
```

---

## ✅ Padrões

### ✅ BOM: Server Action com Tratamento Completo
```typescript
export async function criarOS(input: Input): Promise<ActionResponse> {
  return handleServerAction(async () => {
    const validado = schema.parse(input)  // Zod error → ValidationError
    const { data, error } = await supabase...
    if (error) throw error  // Supabase error → DatabaseError
    
    logBusinessEvent(...)
    return { success: true, data }
  }, 'criarOS')
}
```

### ❌ RUIM: Try-catch Manual
```typescript
export async function criarOS(input: Input) {
  try {
    const validado = schema.parse(input)
    // ...
    return { success: true, ... }
  } catch (err) {
    return { success: false, error: error.message }  // Genérico
  }
}
```

### ✅ BOM: Componentee com Toast
```typescript
const result = await criarOS(data)
if (!result.success) {
  error(result.error)  // Usa toast provider
  return
}
success('Criado com sucesso!')
```

### ❌ RUIM: Alert
```typescript
try {
  await criarOS(data)
  alert('Criado!')  // Blocante, sem styling
} catch (err) {
  alert('Erro: ' + err.message)
}
```

---

## 🔄 Pipeline de Tratamento

### Server Action
```
Input → Zod Validation → BusinessLogic → Database/API → Log → Response
  ↓                         ↓                          ↓
  ZodError → ValidationError → DatabaseError → ExternalAPIError
         handleZodError    handleDatabaseError    handleExternalAPIError
```

### Componente
```
Event → Server Action → Toast Notification
         ↓
       Error → ErrorBoundary → Fallback UI
```

---

## 📊 Response Format

### Sucesso
```typescript
{
  success: true,
  data: { /* resultado */ },
  message?: "OS criada com sucesso"
}
```

### Validação
```typescript
{
  success: false,
  error: "Erro ao validar dados",
  type: "VALIDATION_ERROR",
  fieldErrors: {
    "defeito_relatado": ["Mínimo 10 caracteres"],
    "equipamento_tipo": ["Campo obrigatório"]
  }
}
```

### Database
```typescript
{
  success: false,
  error: "Este valor já existe no sistema",
  type: "UNIQUE_VIOLATION",
  statusCode: 409
}
```

---

## 🚀 Checklist: Implementração em Novo Módulo

- [ ] Criar `src/modules/novo-modulo/actions.ts`
- [ ] Importar `handleServerAction`, `logBusinessEvent` do `@/lib/errors`
- [ ] Cada action retorna `Promise<ActionResponse>`
- [ ] Usar `handleServerAction(async () => { ... }, 'nomeAction')`
- [ ] Validação Zod: dejxa throw (capturado automaticamente)
- [ ] Erro Supabase: deixar throw (capturado como DatabaseError)
- [ ] Adicionar `logBusinessEvent` após operações bem-sucedidas
- [ ] Componentes usam `useToast()` para feedback

---

## 🔧 Desenvolvimento

Em desenvolvimento (`NODE_ENV=development`):
- Logs com cores no console
- Stack traces completos
- Detalhes de erro expostos

Em produção (`NODE_ENV=production`):
- Logs limpos sem informações sensíveis
- Integração com serviço externo (pré-configurado para Sentry, DataDog, etc)
- Mensagens amigáveis ao usuário

---

## 📞 Suporte

Cada erro inclui:
- **type**: Identificação exata do tipo
- **message**: Mensagem técnica (developers)
- **userMessage**: Mensagem amigável (usuários)
- **details**: Contexto adicional em desenvolvimento
- **timestamp**: Quando ocorreu
- **context**: Função que lançou o erro

Ideal para debugging, logging e analytics!
