import type { WeeklyMission } from '@/types/weekly-mission';

export type { WeeklyMissionTemplate } from '@/data/types';

export { WEEKLY_MISSION_CATALOG } from '@/data/loaders/missions';

export const buildWeeklyMissionFromTemplate = (
  template: {
    id: string;
    title: string;
    description: string;
    missionType: WeeklyMission['missionType'];
    targetValue: number;
    xpReward: number;
    coinReward: number;
  },
  bounds: { weekStartDate: string; weekEndDate: string },
): WeeklyMission => ({
  id: template.id,
  weekStartDate: bounds.weekStartDate,
  title: template.title,
  description: template.description,
  missionType: template.missionType,
  targetValue: template.targetValue,
  currentValue: 0,
  xpReward: template.xpReward,
  coinReward: template.coinReward,
  completed: false,
  claimed: false,
  weekEndDate: bounds.weekEndDate,
  createdAt: new Date().toISOString(),
});
