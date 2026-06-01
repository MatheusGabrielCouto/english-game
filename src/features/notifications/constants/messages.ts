import { NotificationCategory } from '@/types/notification';

export const NOTIFICATION_MESSAGES: Record<string, string[]> = {
  [NotificationCategory.DAILY_REMINDER]: [
    "Time to continue your English journey.",
    "Your future international career starts today.",
    "Let's complete today's quests.",
    "Today is another opportunity to improve.",
  ],
  [NotificationCategory.STREAK_REMINDER]: [
    'Your streak is waiting for you.',
    "Don't lose your progress today.",
    'Keep your streak alive.',
    "Let's continue where you left off.",
  ],
  [NotificationCategory.SHIELD_WARNING]: [
    'You have no shields left.',
    'Your streak is unprotected.',
    'Study today to protect your progress.',
  ],
  [NotificationCategory.PET_REMINDER]: [
    'Your pet misses you.',
    "Your pet is waiting for today's lesson.",
    'Your pet wants to grow.',
    'Your companion is ready to study with you.',
  ],
  [NotificationCategory.CONTRACT_REMINDER]: [
    'Your challenge is still active.',
    "Keep going. You're making progress.",
    "Don't fail your contract.",
    'Your contract needs you today.',
  ],
  [NotificationCategory.ACHIEVEMENT_PROGRESS]: [
    "You're close to unlocking a new achievement.",
    'Only one more step to your reward.',
    'A new achievement is within reach.',
  ],
  [NotificationCategory.CITY_PROGRESS]: [
    'Your city can grow today.',
    'Study to unlock the next building.',
    'Your international city is waiting.',
  ],
};

export const pickNotificationMessage = (category: string, seed: number): string => {
  const messages = NOTIFICATION_MESSAGES[category] ?? NOTIFICATION_MESSAGES[NotificationCategory.DAILY_REMINDER];
  return messages[seed % messages.length];
};
