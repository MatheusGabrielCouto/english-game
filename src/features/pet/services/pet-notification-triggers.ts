import { PetMood } from '@/types/pet';
import { PET_NOTIFICATION_MESSAGES } from '../constants';
import { resolveMoodFromStreak } from '../utils/mood';

export const PetNotificationTriggers = {
  onUserAbsent(): string {
    return PET_NOTIFICATION_MESSAGES.userAbsent;
  },

  onStreakAtRisk(currentStreak: number): string | null {
    if (currentStreak <= 0) return PET_NOTIFICATION_MESSAGES.streakAtRisk;
    return null;
  },

  onLowMood(currentStreak: number): string | null {
    const mood = resolveMoodFromStreak(currentStreak);
    if (mood === PetMood.VERY_SAD || mood === PetMood.SAD) {
      return PET_NOTIFICATION_MESSAGES.lowMood;
    }
    return null;
  },
};
