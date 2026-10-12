'use server'

import { FirestoreConfiguracoesRepository } from '@/infrastructure/firestore/configuracoes-repository'
import {
  buscarConfiguracaoEmpresaUseCase,
  buscarConfiguracaoWhatsAppUseCase,
  buscarPreferenciasUseCase,
} from '@/application/configuracoes/gerenciar-configuracoes'
import type { ConfiguracaoEmpresa, ConfiguracaoWhatsApp, ConfiguracaoPreferencias } from '@/domain/configuracoes/entities'
import { checarAutenticado } from '@/lib/auth/session'

const configRepo = new FirestoreConfiguracoesRepository()

export async function buscarConfiguracaoEmpresa(): Promise<ConfiguracaoEmpresa> {
  const bloqueio = await checarAutenticado()
  if (bloqueio) throw new Error('Não autenticado')
  return buscarConfiguracaoEmpresaUseCase(configRepo)
}

export async function buscarConfiguracaoWhatsApp(): Promise<ConfiguracaoWhatsApp> {
  const bloqueio = await checarAutenticado()
  if (bloqueio) throw new Error('Não autenticado')
  return buscarConfiguracaoWhatsAppUseCase(configRepo)
}

export async function buscarPreferencias(): Promise<ConfiguracaoPreferencias> {
  const bloqueio = await checarAutenticado()
  if (bloqueio) throw new Error('Não autenticado')
  return buscarPreferenciasUseCase(configRepo)
}
