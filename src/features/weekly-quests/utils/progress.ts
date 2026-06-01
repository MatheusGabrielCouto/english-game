import type { WeeklyMission } from '@/types/weekly-mission';

export const capProgress = (currentValue: number, targetValue: number): number =>
  Math.min(Math.max(currentValue, 0), targetValue);

export const isMissionComplete = (mission: Pick<WeeklyMission, 'currentValue' | 'targetValue'>): boolean =>
  mission.currentValue >= mission.targetValue;

export const applyProgressDelta = (
  mission: WeeklyMission,
  delta: number,
): WeeklyMission => {
  if (delta <= 0 || mission.completed) {
    return mission;
  }

  const currentValue = capProgress(mission.currentValue + delta, mission.targetValue);
  const completed = currentValue >= mission.targetValue;

  return {
    ...mission,
    currentValue,
    completed,
  };
};
