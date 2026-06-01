import { PunishmentTrigger, type PunishmentTriggerValue } from '@/types/punishment';

export const PUNISHMENT_MESSAGES = {
  warningTitle: 'Atenção, aventureiro',
  impactTitle: 'Consequência aplicada',
  recoveryTitle: 'Você voltou!',
  warningConfirm: 'Entendi',
  impactContinue: 'Continuar jornada',
  recoveryContinue: 'Vamos juntos!',
  petEncourage: 'We can fix this together!',
} as const;

const WARNING_COPY: Record<
  PunishmentTriggerValue,
  { title: string; message: string; petMessage: string; impactPreview: string }
> = {
  [PunishmentTrigger.STREAK_BROKEN]: {
    title: 'Streak interrompida',
    message:
      'Você perdeu um dia de estudo. Por 24h, ganhos de XP e moedas ficam levemente reduzidos — mas tudo se recupera com foco.',
    petMessage: 'I missed you today… Let\'s get back on track!',
    impactPreview: '-5% XP · -5% moedas · pet triste · cidade menos vibrante',
  },
  [PunishmentTrigger.CONTRACT_FAILED]: {
    title: 'Contrato não cumprido',
    message:
      'O contrato falhou. Novos contratos terão recompensas ajustadas temporariamente. Estude 3 dias seguidos para recuperar.',
    petMessage: 'We can fix this together!',
    impactPreview: '-8% ganhos · contratos mais difíceis · pet muito triste',
  },
  [PunishmentTrigger.FOCUS_DISTRACTION]: {
    title: 'Muitas distrações',
    message:
      'Sua sessão de Focus Mode teve muitas distrações. Uma penalidade leve foi aplicada para reforçar o hábito.',
    petMessage: 'Focus with me — we\'re stronger together!',
    impactPreview: '-5% XP por 24h · pet desanimado',
  },
  [PunishmentTrigger.FOCUS_ABANDONED]: {
    title: 'Sessão abandonada',
    message: 'Você encerrou a sessão de foco antes da hora. Consequência leve aplicada — recupere estudando hoje.',
    petMessage: 'Let\'s try again tomorrow!',
    impactPreview: '-5% ganhos futuros · pet triste',
  },
  [PunishmentTrigger.INACTIVITY]: {
    title: 'Sentimos sua falta',
    message:
      'Faz dias que você não abre o English Quest. Uma penalidade leve foi aplicada — volte hoje e recupere tudo.',
    petMessage: 'I missed you today…',
    impactPreview: '-5% ganhos · cidade menos ativa',
  },
};

export const buildPunishmentWarning = (trigger: PunishmentTriggerValue) => ({
  trigger,
  ...WARNING_COPY[trigger],
});

export const buildImpactMessage = (trigger: PunishmentTriggerValue): string =>
  WARNING_COPY[trigger].impactPreview;

export const buildRecoveryMessage = (recoveryDays: number, allCleared: boolean): string => {
  if (allCleared) {
    return 'Todas as penalidades foram removidas! Seu pet está feliz e a cidade brilha de novo.';
  }
  if (recoveryDays >= 3) {
    return 'Penalidades médias removidas. Continue estudando para limpar o restante.';
  }
  return 'Penalidade leve removida. Mais um dia de foco acelera sua recuperação.';
};
