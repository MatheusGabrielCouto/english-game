import type { ShieldMilestoneKey } from '@/types/shield';

export const SHIELD_MESSAGES = {
  used: 'Sua sequência foi protegida por um escudo.',
  noneLeft: 'Você não possui escudos disponíveis.',
  earned: 'Você conquistou um novo escudo!',
  saved: 'Um escudo salvou seu progresso.',
} as const;

export const STREAK_SHIELD_MILESTONES: Array<{
  key: ShieldMilestoneKey;
  streakDays: number;
  shieldsAwarded: number;
  label: string;
}> = [
  { key: 'streak_7', streakDays: 7, shieldsAwarded: 1, label: '7 dias de sequência' },
  { key: 'streak_30', streakDays: 30, shieldsAwarded: 2, label: '30 dias de sequência' },
  { key: 'streak_100', streakDays: 100, shieldsAwarded: 5, label: '100 dias de sequência' },
];

export const getMilestoneForStreak = (currentStreak: number) =>
  STREAK_SHIELD_MILESTONES.find((milestone) => milestone.streakDays === currentStreak);
