export type EpicMissionStatus = 'active' | 'completed';

export type EpicMissionProgress = {
  id: string;
  title: string;
  description: string;
  missionType: string;
  targetValue: number;
  currentValue: number;
  xpReward: number;
  coinReward: number;
  difficulty: string;
  status: EpicMissionStatus;
  startedAt: string;
  completedAt: string | null;
};

export type EpicMissionViewModel = EpicMissionProgress & {
  percentage: number;
  isComplete: boolean;
};
