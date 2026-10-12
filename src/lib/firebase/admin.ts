// Inicialização do Firebase Admin SDK (uso exclusivo em servidor: Server Actions/API Routes)
import { cert, getApps, initializeApp, type App } from 'firebase-admin/app'
import { getFirestore, type Firestore } from 'firebase-admin/firestore'
import { getAuth, type Auth } from 'firebase-admin/auth'

let app: App | null = null

function getAdminApp(): App {
  if (app) return app

  if (getApps().length) {
    app = getApps()[0]
    return app
  }

  // Contra o emulador (FIRESTORE_EMULATOR_HOST setado, ex: nos testes de
  // integração), não é preciso credencial real — só o projectId.
  if (process.env.FIRESTORE_EMULATOR_HOST) {
    app = initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID || 'demo-test' })
    return app
  }

  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Credenciais do Firebase Admin ausentes. Defina FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL e FIREBASE_PRIVATE_KEY no .env.local'
    )
  }

  app = initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  })

  return app
}

export function adminDb(): Firestore {
  return getFirestore(getAdminApp())
}

export function adminAuth(): Auth {
  return getAuth(getAdminApp())
}
