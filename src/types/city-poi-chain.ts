import type { LocalMissionTypeValue } from './city-poi-mission';

export type PoiChainStepDefinition = {
  stepIndex: number;
  templateKey: string;
  title: string;
  description: string;
  missionType: LocalMissionTypeValue;
  targetValue: number;
  baseXp: number;
  baseCoins: number;
  baseLocalXp: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
};

export type PoiChainDefinition = {
  chainKey: string;
  poiKey: string;
  title: string;
  synopsis: string;
  minLocalLevel: number;
  steps: PoiChainStepDefinition[];
};

export type PoiChainProgressRecord = {
  poiKey: string;
  chainKey: string;
  currentStep: number;
  completed: boolean;
  updatedAt: string;
};

export type PoiChainViewModel = PoiChainDefinition & {
  progress: PoiChainProgressRecord | null;
  totalSteps: number;
  activeStepIndex: number | null;
  isComplete: boolean;
};
