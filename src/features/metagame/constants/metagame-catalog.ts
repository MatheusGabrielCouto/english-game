import type { CoreLoopStep, SeasonTier, AnnualGoal } from '@/types/metagame';

export { PRESTIGE_TIERS } from './prestige-tiers';

export const CORE_LOOP_STEPS: CoreLoopStep[] = [
  { key: 'enter', label: 'Entrar', emoji: '📱', description: 'Abra o app e veja sua jornada.' },
  { key: 'study', label: 'Estudar', emoji: '📚', description: 'Complete missões diárias.' },
  { key: 'xp', label: 'Ganhar XP', emoji: '⚡', description: 'Cada missão te aproxima do próximo nível.' },
  { key: 'reward', label: 'Recompensas', emoji: '🎁', description: 'Moedas, loot boxes e marcos.' },
  { key: 'evolve', label: 'Evoluir', emoji: '🚀', description: 'Carreira, pet, cidade e títulos.' },
  { key: 'return', label: 'Voltar', emoji: '🔥', description: 'Mantenha a streak e volte amanhã.' },
];

import { SEASON_PASS_TIERS } from './season-pass-catalog';

export { SEASON_PASS_TIERS as SEASON_TIERS } from './season-pass-catalog';

export const ANNUAL_GOALS: AnnualGoal[] = [
  { key: 'study_365', name: '365 dias estudando', description: 'Um ano de consistência.', icon: '📅', target: 365, metric: 'study_days' },
  { key: 'missions_1000', name: '1.000 missões', description: 'Dedicação total às quests.', icon: '⚔️', target: 1000, metric: 'missions' },
  { key: 'xp_50000', name: '50.000 XP', description: 'Maestria acumulada.', icon: '⚡', target: 50000, metric: 'xp' },
  { key: 'streak_100', name: 'Streak de 100', description: 'Disciplina de elite.', icon: '🔥', target: 100, metric: 'streak_best' },
];

export const SEASON_POINTS = {
  DAILY_MISSION: 10,
  WEEKLY_CLAIM: 50,
  STUDY_DAY: 15,
  FOCUS_SESSION: 12,
  CONTRACT_COMPLETE: 25,
  ACHIEVEMENT: 30,
} as const;

export const getSeasonKey = (date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

export const getDaysLeftInSeason = (date = new Date()): number => {
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  return lastDay - date.getDate();
};

export const getCurrentSeasonTier = (points: number): number => {
  let tier = 0;
  for (const entry of SEASON_PASS_TIERS) {
    if (points >= entry.pointsRequired) tier = entry.tier;
  }
  return tier;
};

export const getNextSeasonTier = (points: number): SeasonTier | null =>
  SEASON_PASS_TIERS.find((entry) => points < entry.pointsRequired) ?? null;
