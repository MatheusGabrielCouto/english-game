export const NotificationCategory = {
  DAILY_REMINDER: 'daily_reminder',
  STREAK_REMINDER: 'streak_reminder',
  SHIELD_WARNING: 'shield_warning',
  PET_REMINDER: 'pet_reminder',
  CONTRACT_REMINDER: 'contract_reminder',
  ACHIEVEMENT_PROGRESS: 'achievement_progress',
  CITY_PROGRESS: 'city_progress',
  FLASH_DUE: 'flash_due',
} as const;

export type NotificationCategoryValue =
  (typeof NotificationCategory)[keyof typeof NotificationCategory];

export const NotificationStatus = {
  SCHEDULED: 'scheduled',
  DELIVERED: 'delivered',
  OPENED: 'opened',
  CANCELLED: 'cancelled',
} as const;

export type NotificationStatusValue =
  (typeof NotificationStatus)[keyof typeof NotificationStatus];

export const NotificationPermissionStatus = {
  GRANTED: 'granted',
  DENIED: 'denied',
  UNDETERMINED: 'undetermined',
  UNAVAILABLE: 'unavailable',
} as const;

export type NotificationPermissionStatusValue =
  (typeof NotificationPermissionStatus)[keyof typeof NotificationPermissionStatus];

export type NotificationSettings = {
  enabled: boolean;
  preferredHour: number;
  preferredMinute: number;
  dailyReminder: boolean;
  streakReminder: boolean;
  shieldWarning: boolean;
  petReminder: boolean;
  contractReminder: boolean;
  achievementProgress: boolean;
  cityProgress: boolean;
  updatedAt: string;
};

export type NotificationHistoryRecord = {
  id: number;
  category: NotificationCategoryValue;
  title: string;
  body: string;
  status: NotificationStatusValue;
  identifier: string;
  scheduledFor: string | null;
  deliveredAt: string | null;
  openedAt: string | null;
  createdAt: string;
};

export type NotificationCandidate = {
  category: NotificationCategoryValue;
  title: string;
  body: string;
  priority: number;
};

export type NotificationContext = {
  studiedToday: boolean;
  currentStreak: number;
  shields: number;
  hasActiveContract: boolean;
  contractName: string | null;
  petMood: string | null;
  hasNearAchievement: boolean;
  nearAchievementName: string | null;
  cityLevelsUntilNext: number | null;
  nextBuildingName: string | null;
};
