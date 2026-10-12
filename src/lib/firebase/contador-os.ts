// Gera números sequenciais de OS (ex: OS-0001, OS-0002...) usando uma transação
// do Firestore para garantir atomicidade mesmo com criações concorrentes.
import { adminDb } from './admin'

export async function gerarProximoNumeroOS(): Promise<string> {
  const db = adminDb()
  const contadorRef = db.collection('contadores').doc('ordem_servico')

  const proximoNumero = await db.runTransaction(async (transaction) => {
    const doc = await transaction.get(contadorRef)
    const atual = doc.exists ? Number(doc.data()?.valor) || 0 : 0
    const proximo = atual + 1
    transaction.set(contadorRef, { valor: proximo }, { merge: true })
    return proximo
  })

  return `OS-${String(proximoNumero).padStart(4, '0')}`
}
