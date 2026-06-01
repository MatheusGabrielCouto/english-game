import { create } from 'zustand';

import type { CoreLoopSnapshot, LegacyMilestoneRecord, MetagameStateRecord } from '@/types/metagame';
import type {
  AnnualGoalProgress,
  CollectionSummary,
  PrestigeTier,
  SeasonTier,
  SeasonTierView,
} from '@/types/metagame';

type MetagameState = {
  state: MetagameStateRecord | null;
  legacy: LegacyMilestoneRecord[];
  annualGoals: AnnualGoalProgress[];
  collections: CollectionSummary | null;
  coreLoop: CoreLoopSnapshot | null;
  seasonTiers: SeasonTier[];
  seasonTierViews: SeasonTierView[];
  claimableSeasonTiers: number;
  currentSeasonTier: number;
  nextSeasonTier: SeasonTier | null;
  prestigeTier: PrestigeTier | null;
  canPrestige: boolean;
  isLoading: boolean;
};

export const useMetagameStore = create<MetagameState>()(() => ({
  state: null,
  legacy: [],
  annualGoals: [],
  collections: null,
  coreLoop: null,
  seasonTiers: [],
  seasonTierViews: [],
  claimableSeasonTiers: 0,
  currentSeasonTier: 0,
  nextSeasonTier: null,
  prestigeTier: null,
  canPrestige: false,
  isLoading: true,
}));
