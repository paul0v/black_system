'use server'

import { createFirebaseClient } from './firestore-client'

/**
 * Cliente Firestore para uso em Server Actions e Route Handlers.
 * Mantém a mesma assinatura assíncrona usada anteriormente com o Supabase.
 */
export async function createClient() {
  return createFirebaseClient()
}
