// Itens do checklist de entrada do equipamento (vistoria na recepção da OS)

export interface ChecklistItem {
  chave: string
  label: string
}

export const CHECKLIST_ENTRADA_ITENS: ChecklistItem[] = [
  { chave: 'liga_normalmente', label: 'Aparelho liga normalmente' },
  { chave: 'tela_sem_trincos', label: 'Tela sem trincos/rachaduras' },
  { chave: 'touch_funcionando', label: 'Touch/tela sensível ao toque funcionando' },
  { chave: 'carcaca_sem_avarias', label: 'Carcaça sem avarias/amassados' },
  { chave: 'botoes_funcionando', label: 'Botões físicos funcionando' },
  { chave: 'camera_funcionando', label: 'Câmera(s) funcionando' },
  { chave: 'audio_funcionando', label: 'Alto-falante/microfone funcionando' },
  { chave: 'conector_carga_ok', label: 'Conector de carga sem danos' },
  { chave: 'bateria_original', label: 'Bateria original/sem inchaço aparente' },
  { chave: 'sinais_liquido_oxidacao', label: 'Sinais de líquido/oxidação' },
  { chave: 'chip_retirado', label: 'Chip/SIM retirado antes da entrega' },
  { chave: 'cartao_memoria_retirado', label: 'Cartão de memória retirado antes da entrega' },
]
