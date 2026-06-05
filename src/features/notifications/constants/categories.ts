import { NotificationCategory } from '@/types/notification';

export const NOTIFICATION_TITLE = 'English Quest';

export const MAX_DAILY_NOTIFICATIONS = 3;

export const STREAK_RISK_HOURS = 20;

export const NOTIFICATION_PRIORITY: Record<string, number> = {
  [NotificationCategory.STREAK_RISK]: 0,
  [NotificationCategory.STREAK_REMINDER]: 1,
  [NotificationCategory.SHIELD_WARNING]: 2,
  [NotificationCategory.CONTRACT_REMINDER]: 3,
  [NotificationCategory.PET_REMINDER]: 4,
  [NotificationCategory.DAILY_REMINDER]: 5,
  [NotificationCategory.CITY_PROGRESS]: 6,
  [NotificationCategory.ACHIEVEMENT_PROGRESS]: 7,
};

export const STUDY_TIME_PRESETS = [
  { label: '08:00', hour: 8, minute: 0 },
  { label: '12:00', hour: 12, minute: 0 },
  { label: '18:00', hour: 18, minute: 0 },
  { label: '21:00', hour: 21, minute: 0 },
] as const;

export const CATEGORY_LABELS: Record<string, string> = {
  [NotificationCategory.DAILY_REMINDER]: 'Lembrete diário',
  [NotificationCategory.STREAK_REMINDER]: 'Sequência',
  [NotificationCategory.STREAK_RISK]: 'Sequência em risco',
  [NotificationCategory.SHIELD_WARNING]: 'Escudos',
  [NotificationCategory.PET_REMINDER]: 'Pet',
  [NotificationCategory.CONTRACT_REMINDER]: 'Contratos',
  [NotificationCategory.ACHIEVEMENT_PROGRESS]: 'Conquistas',
  [NotificationCategory.CITY_PROGRESS]: 'Cidade',
  [NotificationCategory.FLASH_DUE]: 'Baralho Vivo',
  [NotificationCategory.ROUTINE_REMINDER]: 'Rotinas',
  [NotificationCategory.JOURNAL_REVIEW]: 'Cofre / diário',
  [NotificationCategory.WEEKLY_MISSION]: 'Missões semanais',
  [NotificationCategory.LOOT_REMINDER]: 'Caixas surpresa',
  [NotificationCategory.BREEDING_READY]: 'Cruzamento (fazenda)',
  [NotificationCategory.DAILY_QUESTS]: 'Missões diárias',
  [NotificationCategory.DUEL_BOSS]: 'Boss semanal (duelos)',
  [NotificationCategory.LEXICON_REMINDER]: 'Mural Lexicon',
  [NotificationCategory.SEASON_REMINDER]: 'Temporada',
  [NotificationCategory.PRESTIGE_REMINDER]: 'Prestígio',
  [NotificationCategory.SHOP_OFFER]: 'Ofertas da loja',
};

export const NOTIFICATION_IDENTIFIER_PREFIX = 'eq';

/** Lembretes de estudo: eq-2026-06-04-daily_reminder (não cancelar notificações de pet/fazenda). */
export const STUDY_REMINDER_IDENTIFIER_PATTERN = /^eq-\d{4}-\d{2}-\d{2}-/;

export const isStudyReminderIdentifier = (identifier: string): boolean =>
  STUDY_REMINDER_IDENTIFIER_PATTERN.test(identifier);
