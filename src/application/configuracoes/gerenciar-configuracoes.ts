import type { ConfiguracoesRepository } from '@/domain/configuracoes/repository'
import type { ConfiguracaoEmpresa, ConfiguracaoWhatsApp, ConfiguracaoPreferencias } from '@/domain/configuracoes/entities'
import { LOGO_BLACKCELL_BASE64 } from '@/lib/impressao/logo-blackcell'
import { CHECKLIST_ENTRADA_ITENS } from '@/modules/os/checklist'

const EMPRESA_PADRAO: ConfiguracaoEmpresa = {
  nome: 'BlackCell Assistência Técnica',
  cnpj: '41.173.321/0001-75',
  whatsapp: '(22) 99224-4390',
  endereco: 'R. Vasco Teixeira - Cehab, Miracema - RJ, 28460-000',
  logoBase64: LOGO_BLACKCELL_BASE64,
}

const WHATSAPP_PADRAO: ConfiguracaoWhatsApp = {
  ativo: false,
  apiUrl: '',
  apiKey: '',
  instanceName: 'black_system',
}

const PREFERENCIAS_PADRAO: ConfiguracaoPreferencias = {
  checklistEntrada: CHECKLIST_ENTRADA_ITENS,
  estoqueMinimoPadrao: 1,
  prazoRetiradaDias: 30,
  prazoAbandonoDias: 90,
}

export async function buscarConfiguracaoEmpresaUseCase(repo: ConfiguracoesRepository): Promise<ConfiguracaoEmpresa> {
  try {
    const salvo = await repo.buscarEmpresa()
    if (!salvo) return EMPRESA_PADRAO
    return {
      nome: salvo.nome || EMPRESA_PADRAO.nome,
      cnpj: salvo.cnpj || EMPRESA_PADRAO.cnpj,
      whatsapp: salvo.whatsapp || EMPRESA_PADRAO.whatsapp,
      endereco: salvo.endereco || EMPRESA_PADRAO.endereco,
      logoBase64: salvo.logoBase64 || EMPRESA_PADRAO.logoBase64,
    }
  } catch (err) {
    console.error('Erro ao buscar configuração da empresa:', err)
    return EMPRESA_PADRAO
  }
}

export function salvarConfiguracaoEmpresaUseCase(repo: ConfiguracoesRepository, dados: ConfiguracaoEmpresa): Promise<void> {
  return repo.salvarEmpresa(dados)
}

export async function buscarConfiguracaoWhatsAppUseCase(repo: ConfiguracoesRepository): Promise<ConfiguracaoWhatsApp> {
  try {
    const salvo = await repo.buscarWhatsApp()
    if (!salvo) return WHATSAPP_PADRAO
    return {
      ativo: salvo.ativo ?? WHATSAPP_PADRAO.ativo,
      apiUrl: salvo.apiUrl || WHATSAPP_PADRAO.apiUrl,
      apiKey: salvo.apiKey || WHATSAPP_PADRAO.apiKey,
      instanceName: salvo.instanceName || WHATSAPP_PADRAO.instanceName,
    }
  } catch (err) {
    console.error('Erro ao buscar configuração do WhatsApp:', err)
    return WHATSAPP_PADRAO
  }
}

export function salvarConfiguracaoWhatsAppUseCase(repo: ConfiguracoesRepository, dados: ConfiguracaoWhatsApp): Promise<void> {
  return repo.salvarWhatsApp(dados)
}

export async function buscarPreferenciasUseCase(repo: ConfiguracoesRepository): Promise<ConfiguracaoPreferencias> {
  try {
    const salvo = await repo.buscarPreferencias()
    if (!salvo) return PREFERENCIAS_PADRAO
    return {
      checklistEntrada: Array.isArray(salvo.checklistEntrada) && salvo.checklistEntrada.length
        ? salvo.checklistEntrada
        : PREFERENCIAS_PADRAO.checklistEntrada,
      estoqueMinimoPadrao: salvo.estoqueMinimoPadrao ?? PREFERENCIAS_PADRAO.estoqueMinimoPadrao,
      prazoRetiradaDias: salvo.prazoRetiradaDias ?? PREFERENCIAS_PADRAO.prazoRetiradaDias,
      prazoAbandonoDias: salvo.prazoAbandonoDias ?? PREFERENCIAS_PADRAO.prazoAbandonoDias,
    }
  } catch (err) {
    console.error('Erro ao buscar preferências:', err)
    return PREFERENCIAS_PADRAO
  }
}

export function salvarPreferenciasUseCase(repo: ConfiguracoesRepository, dados: ConfiguracaoPreferencias): Promise<void> {
  return repo.salvarPreferencias(dados)
}
