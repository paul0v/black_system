// Helpers só para testes de integração (rodam contra o emulador do Firestore,
// nunca contra o banco real — ver vitest.integration.config.mts).
const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'demo-test'
const EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || 'localhost:8080'

export async function limparEmulador() {
  const url = `http://${EMULATOR_HOST}/emulator/v1/projects/${PROJECT_ID}/databases/(default)/documents`
  const res = await fetch(url, { method: 'DELETE' })
  if (!res.ok) {
    throw new Error(`Falha ao limpar o emulador do Firestore: ${res.status}`)
  }
}
