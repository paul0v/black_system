'use server'

import { checarPerfil } from '@/lib/auth/session'
import { FirestoreConfiguracoesRepository } from '@/infrastructure/firestore/configuracoes-repository'
import {
  salvarConfiguracaoEmpresaUseCase,
  salvarConfiguracaoWhatsAppUseCase,
  salvarPreferenciasUseCase,
} from '@/application/configuracoes/gerenciar-configuracoes'
import type { ConfiguracaoEmpresa, ConfiguracaoWhatsApp, ConfiguracaoPreferencias } from '@/domain/configuracoes/entities'

const configRepo = new FirestoreConfiguracoesRepository()

export async function salvarConfiguracaoEmpresa(input: ConfiguracaoEmpresa) {
  const bloqueio = await checarPerfil(['admin'])
  if (bloqueio) return bloqueio

  try {
    await salvarConfiguracaoEmpresaUseCase(configRepo, input)
    return { success: true, message: 'Configurações salvas com sucesso' }
  } catch (err) {
    console.error('Erro ao salvar configuração da empresa:', err)
    return { success: false, error: 'Erro ao salvar configurações' }
  }
}

export async function salvarConfiguracaoWhatsApp(input: ConfiguracaoWhatsApp) {
  const bloqueio = await checarPerfil(['admin'])
  if (bloqueio) return bloqueio

  try {
    await salvarConfiguracaoWhatsAppUseCase(configRepo, input)
    return { success: true, message: 'Configurações de WhatsApp salvas com sucesso' }
  } catch (err) {
    console.error('Erro ao salvar configuração do WhatsApp:', err)
    return { success: false, error: 'Erro ao salvar configurações' }
  }
}

export async function salvarPreferencias(input: ConfiguracaoPreferencias) {
  const bloqueio = await checarPerfil(['admin'])
  if (bloqueio) return bloqueio

  try {
    await salvarPreferenciasUseCase(configRepo, input)
    return { success: true, message: 'Preferências salvas com sucesso' }
  } catch (err) {
    console.error('Erro ao salvar preferências:', err)
    return { success: false, error: 'Erro ao salvar preferências' }
  }
}
