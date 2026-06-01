import type { WeeklyMissionType } from './weekly-mission-type';

export type WeeklyMissionStatus = 'in_progress' | 'completed' | 'claimed';

export type WeeklyMission = {
  id: string;
  title: string;
  description: string;
  missionType: WeeklyMissionType;
  targetValue: number;
  currentValue: number;
  xpReward: number;
  coinReward: number;
  completed: boolean;
  claimed: boolean;
  weekStartDate: string;
  weekEndDate: string;
  createdAt: string;
};

export const getWeeklyMissionStatus = (mission: WeeklyMission): WeeklyMissionStatus => {
  if (mission.claimed) return 'claimed';
  if (mission.completed) return 'completed';
  return 'in_progress';
};
