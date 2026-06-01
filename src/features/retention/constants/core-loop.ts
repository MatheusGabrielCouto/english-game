import type { CoreLoopSnapshot } from '@/types/metagame';

export const getActiveCoreLoopStep = (snapshot: CoreLoopSnapshot): string => {
  if (!snapshot.daily.studiedToday) return 'study';
  if (snapshot.daily.completed < snapshot.daily.total) return 'study';
  if (snapshot.weekly.completed < snapshot.weekly.total) return 'reward';
  if (snapshot.monthly.seasonTier < 5) return 'evolve';
  return 'return';
};

export const getRetentionMessage = (snapshot: CoreLoopSnapshot): string => {
  if (snapshot.daily.studiedToday && snapshot.daily.completed === snapshot.daily.total) {
    return 'Loop diário completo! Volte amanhã para manter sua streak.';
  }
  if (!snapshot.daily.studiedToday) {
    return 'Complete uma missão hoje para proteger sua sequência.';
  }
  if (snapshot.retention.currentStreak >= 7) {
    return `${snapshot.retention.currentStreak} dias seguidos — você está no caminho certo!`;
  }
  return 'Cada sessão te aproxima da carreira internacional.';
};

export const getD1Hook = (studiedToday: boolean, currentStreak: number): string => {
  if (studiedToday) return 'Amanhã: nova missão + bônus de streak te esperam.';
  if (currentStreak > 0) return 'Não perca sua streak — falta só 1 missão hoje.';
  return 'Comece hoje: D1 é o dia mais importante da jornada.';
};
