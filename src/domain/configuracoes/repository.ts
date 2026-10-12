import type { ConfiguracaoEmpresa, ConfiguracaoWhatsApp, ConfiguracaoPreferencias } from './entities'

export interface ConfiguracoesRepository {
  buscarEmpresa(): Promise<ConfiguracaoEmpresa | null>
  salvarEmpresa(dados: ConfiguracaoEmpresa): Promise<void>

  buscarWhatsApp(): Promise<ConfiguracaoWhatsApp | null>
  salvarWhatsApp(dados: ConfiguracaoWhatsApp): Promise<void>

  buscarPreferencias(): Promise<ConfiguracaoPreferencias | null>
  salvarPreferencias(dados: ConfiguracaoPreferencias): Promise<void>
}
