import { NotificationCategory } from '@/types/notification';

export const NOTIFICATION_TITLE = 'English Quest';

export const MAX_DAILY_NOTIFICATIONS = 3;

export const NOTIFICATION_PRIORITY: Record<string, number> = {
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
  [NotificationCategory.SHIELD_WARNING]: 'Escudos',
  [NotificationCategory.PET_REMINDER]: 'Pet',
  [NotificationCategory.CONTRACT_REMINDER]: 'Contratos',
  [NotificationCategory.ACHIEVEMENT_PROGRESS]: 'Conquistas',
  [NotificationCategory.CITY_PROGRESS]: 'Cidade',
};

export const NOTIFICATION_IDENTIFIER_PREFIX = 'eq';
