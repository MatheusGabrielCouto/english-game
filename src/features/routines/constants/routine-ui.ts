import type { RoutineCategoryValue, RoutineConsistencyLabel, RoutineFrequencyValue } from '@/types/routine';

import { ROUTINE_WEEKDAY_LABELS } from '../catalogs/routine-templates';

export const ROUTINE_UI = {
  screenTitle: 'Habits & Routines',
  screenSubtitle: 'Seus compromissos reais de inglês — separados das missões do jogo',
  todayTitle: 'Rotina de hoje',
  todayHint: 'O que você decidiu fazer',
  questsDivider: 'Missões do jogo geram recompensas automáticas · rotinas são suas',
  emptyToday: 'Nenhuma rotina prevista para hoje. Crie uma ou use um modelo.',
  addRoutine: 'Nova rotina',
  fromTemplate: 'Usar modelo',
  editRoutine: 'Editar rotina',
  archiveRoutine: 'Arquivar',
  complete: 'Concluir',
  uncomplete: 'Desmarcar',
  completed: 'Concluída',
  pending: 'Pendente',
  upcoming: 'Próximas',
  statsTitle: 'Estatísticas',
  streak: (count: number, unit: string) => `Sequência: ${count} ${unit}`,
  totalCompleted: 'Total concluído',
  totalMissed: 'Total perdido',
  bestStreak: 'Maior sequência',
  completionRate: 'Taxa de conclusão',
  consistency: 'Consistência',
  dueToday: (count: number) =>
    count === 0
      ? 'Nada na rotina de hoje'
      : count === 1
        ? '1 rotina hoje'
        : `${count} rotinas hoje`,
  petCelebrate: 'Seu pet está orgulhoso da sua consistência!',
  petMissed: 'Amanhã é um novo dia — seu pet acredita em você.',
  reminderTimeLabel: 'Horário do lembrete (opcional)',
  reminderTimeHint: 'Toque para abrir o modal de seleção de hora',
  reminderTimePlaceholder: '19:00',
  reminderTimeEmpty: 'Toque para escolher',
  reminderTimeAccessibility: 'Abrir seletor de hora do lembrete',
  reminderTimeClear: 'Limpar horário',
  reminderTimeConfirmed: (time: string) => `Lembrete às ${time}`,
  reminderTimeInvalid: 'Corrija o horário do lembrete antes de salvar.',
  reminderPresetsTitle: 'Atalhos rápidos',
  reminderPickerTitle: 'Horário',
  reminderPickerModalTitle: 'Escolher horário',
  reminderPickerModalHint: 'Defina a hora do lembrete (formato 24h)',
  reminderPickerDone: 'Confirmar',
  reminderPickerCancel: 'Cancelar',
  reminderManualTitle: 'Digite o horário (HH:MM)',
  reminderPresetA11y: 'Definir lembrete às',
  rewardsDefaultTitle: 'Recompensa padrão',
  rewardsDefaultHint: 'Com base na categoria e na frequência — atualiza ao mudar esses campos',
  rewardsCustomTitle: 'Valores personalizados',
  rewardsCustomHint: 'Opcional. Preencha XP e moedas juntos para substituir o padrão.',
  rewardsClearCustom: 'Usar padrão',
  rewardsFillDefaults: 'Preencher padrão',
  weekdaysLabel: 'Dias da semana',
  weekdaysHint: 'Toque para marcar os dias em que esta rotina vale',
  weekdaysRequired: 'Escolha pelo menos um dia',
  weekdaysSelected: (count: number) =>
    count === 1 ? '1 dia selecionado' : `${count} dias selecionados`,
  weekdaysAllDays: 'Todos os dias',
  fieldClear: 'Limpar campo',
  nameLabel: 'Nome da rotina',
  nameHint: 'Como você chama este compromisso no dia a dia',
  namePlaceholder: 'Ex.: English Class',
  descriptionLabel: 'Descrição (opcional)',
  descriptionHint: 'Detalhes que ajudam a lembrar o que fazer',
  descriptionPlaceholder: 'Ex.: Aula do curso às 19h',
  durationLabel: 'Duração esperada (opcional)',
  durationShortLabel: 'Min',
  durationHint: 'Quanto tempo você reserva — em minutos',
  durationPlaceholder: '60',
  durationSuffix: 'min',
  durationDefaultHint: 'Deixe vazio se não quiser estimar',
  customXpLabel: 'XP personalizado (opcional)',
  customXpHint: 'Sobrescreve o XP padrão da categoria',
  customXpPlaceholder: 'Ex.: 25',
  customXpSuffix: 'XP',
  customCoinsLabel: 'Moedas personalizadas (opcional)',
  customCoinsHint: 'Sobrescreve as moedas padrão da categoria',
  customCoinsPlaceholder: '12',
  customCoinsSuffix: 'moedas',
  categoryLabel: 'Categoria',
  frequencyLabel: 'Frequência',
} as const;

export const ROUTINE_CATEGORY_LABELS: Record<RoutineCategoryValue, string> = {
  english_course: 'Curso de inglês',
  speaking: 'Speaking',
  reading: 'Leitura',
  vocabulary: 'Vocabulário',
  listening: 'Listening',
  writing: 'Escrita',
  grammar: 'Gramática',
  career: 'Carreira',
  programming_english: 'Programação em inglês',
  personal: 'Pessoal',
};

export const ROUTINE_FREQUENCY_LABELS: Record<RoutineFrequencyValue, string> = {
  daily: 'Diária',
  weekly: 'Semanal',
  monthly: 'Mensal',
  custom: 'Personalizada',
};

export const ROUTINE_FREQUENCY_DESCRIPTIONS: Record<RoutineFrequencyValue, string> = {
  daily: 'Aparece todos os dias no seu plano',
  weekly: 'Repete nos dias da semana que você marcar',
  monthly: 'Vale nos dias escolhidos, uma vez por mês',
  custom: 'Só nos dias específicos que você definir',
};

export const ROUTINE_CONSISTENCY_LABELS: Record<RoutineConsistencyLabel, string> = {
  excellent: 'Excelente',
  good: 'Boa',
  fair: 'Regular',
  poor: 'Ruim',
};

export const formatWeekdays = (weekdays: number[]): string => {
  if (weekdays.length === 0) return 'Todos os dias';
  return weekdays.map((d) => ROUTINE_WEEKDAY_LABELS[d] ?? '?').join(', ');
};
