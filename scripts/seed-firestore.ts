/**
 * Script de seed do Firestore.
 *
 * Popula as coleções iniciais do sistema (clientes, ordens de serviço,
 * equipamentos, produtos) com os mesmos dados de exemplo que existiam
 * no antigo banco mock (data.json), útil para desenvolvimento/testes.
 *
 * Uso:
 *   npm run seed
 *
 * Requer as variáveis FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL e
 * FIREBASE_PRIVATE_KEY configuradas em .env.local.
 */
import { cert, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const projectId = process.env.FIREBASE_PROJECT_ID
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

if (!projectId || !clientEmail || !privateKey) {
  console.error('❌ Faltam credenciais do Firebase Admin em .env.local (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY)')
  process.exit(1)
}

const app = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) })
const db = getFirestore(app)

async function seedCollection(collectionName: string, rows: Record<string, any>[]) {
  const batch = db.batch()
  for (const row of rows) {
    const { id, ...rest } = row
    batch.set(db.collection(collectionName).doc(id), rest)
  }
  await batch.commit()
  console.log(`✅ ${collectionName}: ${rows.length} documento(s) gravado(s)`)
}

async function main() {
  await seedCollection('cliente', [
    {
      id: 'cliid-001',
      nome: 'João da Silva',
      telefone: '11987654321',
      email: 'joao@exemplo.com',
      cpf: '12345678901',
      criado_em: '2026-05-01T10:00:00.000Z',
    },
    {
      id: 'cliid-002',
      nome: 'Maria Santos',
      telefone: '11998765432',
      email: 'maria@exemplo.com',
      cpf: '98765432101',
      criado_em: '2026-05-01T10:05:00.000Z',
    },
    {
      id: 'cliid-003',
      nome: 'Pedro Costa',
      telefone: '11989876543',
      email: 'pedro@exemplo.com',
      cpf: '55555555555',
      criado_em: '2026-05-01T10:10:00.000Z',
    },
  ])

  await seedCollection('ordem_servico', [
    {
      id: 'osid-001',
      numero: 'OS-2026-001',
      cliente_id: 'cliid-001',
      defeito_relatado: 'Celular com tela quebrada e não liga',
      status: 'em_reparo',
      data_entrada: '2026-05-01T10:30:00.000Z',
      criado_em: '2026-05-01T10:30:00.000Z',
      orcamento_aprovado: true,
      diagnostico: 'Tela LCD quebrada, bateria descarregada',
    },
    {
      id: 'osid-002',
      numero: 'OS-2026-002',
      cliente_id: 'cliid-002',
      defeito_relatado: 'Notebook não liga e faz barulho estranho',
      status: 'em_diagnostico',
      data_entrada: '2026-05-02T09:00:00.000Z',
      criado_em: '2026-05-02T09:00:00.000Z',
      orcamento_aprovado: false,
      diagnostico: 'Possível falha na fonte de alimentação',
    },
    {
      id: 'osid-003',
      numero: 'OS-2026-003',
      cliente_id: 'cliid-003',
      defeito_relatado: 'Tablet com bateria não carrega',
      status: 'concluida',
      data_entrada: '2026-04-30T14:00:00.000Z',
      criado_em: '2026-04-30T14:00:00.000Z',
      orcamento_aprovado: true,
      diagnostico: 'Bateria com falha, substituída com sucesso',
    },
  ])

  await seedCollection('equipamento', [
    {
      id: 'eqid-001',
      os_id: 'osid-001',
      tipo: 'celular',
      marca: 'Samsung',
      modelo: 'Galaxy A12',
      imei_serial: '350123456789012',
      acessorios_entregues: 'Carregador, Fone de Ouvido',
    },
    {
      id: 'eqid-002',
      os_id: 'osid-002',
      tipo: 'notebook',
      marca: 'Dell',
      modelo: 'Inspiron 15',
      imei_serial: 'SVCD-001234-ABC',
      acessorios_entregues: 'Carregador',
    },
    {
      id: 'eqid-003',
      os_id: 'osid-003',
      tipo: 'tablet',
      marca: 'Apple',
      modelo: 'iPad Air 2',
      imei_serial: 'A1567-123456789',
      acessorios_entregues: 'Carregador',
    },
  ])

  await seedCollection('produto', [
    {
      id: 'prd-001',
      nome: 'Bateria Samsung A12',
      sku: 'BAT-SAM-A12',
      tipo: 'peca',
      categoria: 'bateria',
      preco_custo: 4500,
      preco_venda: 8900,
      quantidade: 10,
      estoque_minimo: 3,
      alerta_ativo: false,
      ativo: true,
      criado_em: '2026-05-01T00:00:00.000Z',
    },
    {
      id: 'prd-002',
      nome: 'Tela LCD Samsung A12',
      sku: 'TELA-SAM-A12',
      tipo: 'peca',
      categoria: 'tela',
      preco_custo: 12000,
      preco_venda: 22000,
      quantidade: 5,
      estoque_minimo: 2,
      alerta_ativo: false,
      ativo: true,
      criado_em: '2026-05-01T00:00:00.000Z',
    },
    {
      id: 'prd-003',
      nome: 'Carregador USB-C',
      sku: 'CARR-USBC',
      tipo: 'acessorio',
      categoria: 'acessorio',
      preco_custo: 1500,
      preco_venda: 3500,
      quantidade: 20,
      estoque_minimo: 5,
      alerta_ativo: false,
      ativo: true,
      criado_em: '2026-05-01T00:00:00.000Z',
    },
  ])

  console.log('\n🎉 Seed concluído com sucesso!')
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Erro ao rodar seed:', err)
    process.exit(1)
  })
