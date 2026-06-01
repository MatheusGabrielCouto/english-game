import { PrestigeSacrificeType, type PrestigeSacrificeValue } from '@/types/prestige';

export const PRESTIGE_ASCENSION_COPY = {
  cta: 'Iniciar ascensão',
  modalTitle: 'Ascensão de prestígio',
  chooseSacrificeTitle: 'Escolha seu sacrifício',
  chooseSacrificeHint:
    'Nível e XP sempre voltam ao início. Sua streak atual está protegida. Escolha um custo extra:',
  reviewTitle: 'Confirmar ascensão',
  reviewWarning: 'Esta ação não pode ser desfeita.',
  holdToConfirm: 'Segure para ascendar',
  holding: 'Ascendendo...',
  streakProtected: 'Streak protegida — não será zerada',
  alwaysResetTitle: 'Sempre reinicia',
  alwaysResetItems: ['Nível do jogador → 1', 'Barra de XP → 0'],
  keepsTitle: 'Você mantém',
  keepsItems: [
    'Streak atual e melhor streak',
    'Conquistas, coleção e inventário',
    'Prestígios já conquistados',
    'Total de dias de estudo',
  ],
  gainsTitle: 'Você ganha para sempre',
  activeContractBlock: 'Encerre ou complete seu contrato ativo antes de ascender.',
  celebrationTitle: 'Ascensão concluída',
  celebrationSubtitle: 'Nova run iniciada. Seus bônus permanentes continuam ativos.',
} as const;

export const PRESTIGE_SACRIFICE_OPTIONS: {
  key: PrestigeSacrificeValue;
  title: string;
  emoji: string;
  description: string;
  impact: string;
}[] = [
  {
    key: PrestigeSacrificeType.COINS,
    title: 'Sacrificar economia',
    emoji: '🪙',
    description: 'Zera todas as moedas da run atual.',
    impact: 'Moedas → 0',
  },
  {
    key: PrestigeSacrificeType.PET,
    title: 'Sacrificar evolução do pet',
    emoji: '🐾',
    description: 'Pet volta ao bebê (nível 1, XP 0). Nome e espécie permanecem.',
    impact: 'Pet reinicia · afinidade −50%',
  },
];
