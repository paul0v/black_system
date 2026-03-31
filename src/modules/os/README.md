# Módulo de Ordens de Serviço (OS)

O coração do sistema de Assistência Tech. Aqui concentra toda a gestão de reparos do início ao fim.

## 📋 Arquivos

- **types.ts** - Tipos e interfaces (OrdemServico, Equipamento, Cliente, etc)
- **schema.ts** - Validações Zod (criarOSSchema, aproveOrcamentoSchema, etc)
- **actions.ts** - Server Actions para CRUD (criarOS, aprovarOrcamento, concluirOS, etc)
- **queries.ts** - Consultas ao Supabase (buscarTodasOS, buscarOSVencidas, etc)

## 🔄 Fluxo de Vida de uma OS

```
ABERTA
  ↓
EM_DIAGNOSTICO (técnico registra defeito)
  ↓
AGUARDANDO_APROVACAO (cliente aprova orçamento)
  ↓
EM_REPARO (técnico executa serviço, baixa peças)
  ↓
CONCLUIDA (técnico marca como concluída)
  ↓
ENTREGUE (cliente retira aparelho com termo de garantia)
```

Ou pode ser CANCELADA em qualquer estágio.

## 🚀 Como Implementar

### Passo 1: Criar uma OS

```typescript
// Usar a validação Zod
import { criarOSSchema, CriarOSInput } from '@/modules/os/schema'

const input: CriarOSInput = {
  cliente_id: 'uuid-cliente',
  defeito_relatado: 'Tela não liga',
  equipamento_tipo: 'celular',
  equipamento_marca: 'Apple',
  equipamento_modelo: 'iPhone 14 Pro',
  equipamento_imei: '358331234567890',
}

// Chamar Server Action
const resultado = await criarOS(input)
```

### Passo 2: Registrar Diagnóstico

Técnico acessa a OS e registra o que encontrou.

```typescript
await registrarDiagnostico({
  os_id: 'uuid-os',
  diagnostico: 'Bateria desgastada, necessário substituição',
  valor_orcamento: 150.00,
})
```

### Passo 3: Aprovação do Orçamento

Cliente aprova (online ou presencialmente).

```typescript
await aprovarOrcamento('uuid-os', 150.00)
```

### Passo 4: Execução do Reparo

Técnico executa e registra peças usadas.

```typescript
// Peças são baixadas automaticamente
await darBaixaPeca({
  os_id: 'uuid-os',
  produto_id: 'uuid-bateria',
  quantidade: 1,
})
```

### Passo 5: Conclusão e Entrega

```typescript
await concluirOS('uuid-os')
  // Gera termo de garantia (PDF)
  // Envia notificação WhatsApp
  // Marca como entregue
```

## 📊 Dados Importantes Por OS

- **Número único**: Gerado sequencialmente (OS0001, OS0002, ...)
- **Dados do cliente**: Nome, telefone, CPF, email
- **Dados do equipamento**: Marca, modelo, IMEI/serial, fotos da entrada
- **Defeito relatado**: O que o cliente relata
- **Diagnóstico**: O que o técnico encontrou
- **Valor orçamento**: Aprovado pelo cliente
- **Peças usadas**: Rastreuamente com custo
- **Garantia**: Prazo padrão 90 dias

## 🔐 Controle de Acesso

- **Admin**: Visualiza tudo, pode editar qualquer OS
- **Técnico**: Vê apenas suas próprias OS, registra diagnóstico
- **Atendente**: Vê dados do cliente e status, aprova orçamento com cliente

## 📱 Integrações

### WhatsApp (Evolution API)
- ✅ Aparelho recebido
- ✅ Orçamento pronto para aprovação
- ✅ Reparo concluído, pronto para retirada

### Documentos (PDF)
- ✅ Via do cliente (entrada) - assinada na entrada
- ✅ Termo de garantia (saída) - entregue na retirada

### Estoque
- ✅ Baixa automática de peças ao concluir OS
- ✅ Rastreamento: qual peça, qual técnico, qual OS

## 🧪 Testes

```bash
# Será adicionado após implementar
npm test -- modules/os
```

## 📝 Notas para Desenvolvimento

1. **Número de OS**: Gerado automaticamente, incremental (função trigger no BD)
2. **Data de Entrada**: Sempre `now()` no servidor
3. **Prazo Estimado**: Pode ser customizado por tipo de serviço
4. **Dias de Garantia**: Padrão 90, pode variar
5. **Fotos do Equipamento**: Armazenadas no Supabase Storage
6. **Assinaturas**: No termo de garantia (ou via cliente na entrada)

## 🚀 Próximas Funcionalidades

- [ ] Rechamada automática se volta dentro da garantia
- [ ] Aprovação de orçamento via WhatsApp link
- [ ] Histórico de atualizações (quem fez? quando?)
- [ ] Análise de NPS (satisfação do cliente)
- [ ] Integração com nota fiscal eletrônica
