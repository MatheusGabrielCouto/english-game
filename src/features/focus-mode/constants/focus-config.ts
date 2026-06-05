import { FocusStudyType, type FocusStudyTypeValue } from '@/types/focus-mode';

export const FOCUS_DURATION_OPTIONS = [15, 30, 60, 90] as const;

export type FocusDurationMinutes = (typeof FOCUS_DURATION_OPTIONS)[number];

export const FOCUS_DURATION_MIN_MINUTES = 5;
export const FOCUS_DURATION_MAX_MINUTES = 180;

export const FOCUS_STUDY_TYPE_META: Record<
  FocusStudyTypeValue,
  { label: string; emoji: string; spPerMinute: number }
> = {
  [FocusStudyType.VOCABULARY]: { label: 'Vocabulary', emoji: '📝', spPerMinute: 1 },
  [FocusStudyType.READING]: { label: 'Reading', emoji: '📖', spPerMinute: 2 },
  [FocusStudyType.LISTENING]: { label: 'Listening', emoji: '🎧', spPerMinute: 2 },
  [FocusStudyType.SPEAKING]: { label: 'Speaking', emoji: '🗣️', spPerMinute: 3 },
  [FocusStudyType.PROGRAMMING]: { label: 'Programming English', emoji: '💻', spPerMinute: 2 },
};

export const FOCUS_SP_PER_FOCUSED_MINUTE = 2;

export const FOCUS_WORD_SP_BONUS = 1;

export const FOCUS_DISTRACTION_PENALTY_PER_MIN = 0.05;

export const FOCUS_HARDCORE_PENALTY_PER_MIN = 0.08;

export const FOCUS_MAX_PENALTY = 0.5;

export const FOCUS_LOOT_BOX_CHANCES: Record<number, number> = {
  15: 0.02,
  30: 0.05,
  60: 0.1,
  90: 0.18,
};

export const FOCUS_MESSAGES = {
  androidOnly: 'Focus Mode está disponível apenas no Android.',
  accessibilityRequired:
    'Ative o serviço de acessibilidade do English Quest para bloquear apps distrativos durante a sessão.',
  restrictedSettingsTitle: 'APK fora da Play Store? Libere o acesso',
  restrictedSettingsBody:
    'No Android 13+, apps instalados manualmente não podem usar acessibilidade até você autorizar nas configurações do sistema. Não há como pular isso no código — é segurança do Android.',
  restrictedSettingsSteps: [
    '1. Toque em "Abrir configurações do app" abaixo',
    '2. Menu ⋮ (três pontos) → "Permitir configurações restritas" (ou "Allow restricted settings")',
    '3. Confirme com PIN / digital',
    '4. Depois: "Abrir acessibilidade" → ative "English Quest Focus Mode"',
  ] as const,
  disclosureTitle: 'Privacidade do Focus Mode',
  disclosureBody:
    'O Focus Mode usa um Accessibility Service local para bloquear apps distrativos — ao abrir Instagram, TikTok ou similares, você é levado de volta ao English Quest. Nenhum dado sai do dispositivo.',
  blockingActive:
    'Apps distrativos serão fechados automaticamente. Permaneça no English Quest ou na tela inicial.',
  durationLabel: 'Duração do foco',
  durationHint: (min: number, max: number) =>
    `Escolha um atalho ou digite de ${min} a ${max} minutos.`,
  durationCustomLabel: 'Minutos personalizados',
  durationCustomPlaceholder: 'Ex.: 45',
  durationCustomSuffix: 'min',
  durationInvalid: (min: number, max: number) => `Informe entre ${min} e ${max} minutos.`,
  durationQuickLabel: 'Atalhos',
  sessionStarted: 'Modo foco ativado. Boa sessão!',
  sessionEndNotificationTitle: 'Modo foco concluído',
  sessionEndNotificationBody: (studyLabel: string) =>
    `Seu timer de ${studyLabel} terminou. Abra o app para ver suas recompensas.`,
  sessionCompleted: 'Sessão concluída! Recompensas aplicadas.',
  sessionAbandoned: 'Sessão encerrada antes do tempo.',
  distracted: 'Você se distraiu por {minutes} min. Tente manter o foco!',
  petHappy: 'Seu pet está orgulhoso do seu foco!',
  petSad: 'Seu pet sentiu sua distração — volte aos estudos!',
} as const;
