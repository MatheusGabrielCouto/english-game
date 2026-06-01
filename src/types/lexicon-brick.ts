export type LexiconBrickSource =
  | 'farm'
  | 'speaking'
  | 'event_pack'
  | 'chain_reward'
  | 'aggregate_convert';

export type LemmaPoolEntry = {
  lemmaId: string;
  lemma: string;
  translation: string;
  themeTags: string[];
  cefrBand?: 'A1' | 'A2' | 'B1' | 'B2';
};

export type LemmaMasteryRecord = {
  lemmaId: string;
  lemma: string;
  translation: string;
  recognitionScore: number;
  productionScore: number;
  lastReviewAt: string;
  nextReviewAt: string;
  decayStage: number;
  themeTags: string[];
  contextsSeen: string[];
};

export type LexiconBrickRecord = {
  brickId: string;
  lemmaId: string;
  lemma: string;
  translation: string;
  themeTags: string[];
  source: LexiconBrickSource;
  mintedAt: string;
  lastReviewAt: string;
  nextReviewAt: string;
  decayStage: number;
  placedPoiKey: string | null;
  placedProjectKey: string | null;
  placedAt: string | null;
};

export type ProjectBlueprintSlot = {
  themeTag: string;
  count: number;
  label: string;
};

export type ProjectBlueprint = {
  slots: ProjectBlueprintSlot[];
  allowCrackedWeight?: number;
  lemmaSetKey?: string;
};

export type ProjectSlotProgress = {
  projectId: string;
  slotIndex: number;
  themeTag: string;
  label: string;
  targetCount: number;
  filledCount: number;
};

export type MemoryWallInventorySummary = {
  unplacedTotal: number;
  crackedTotal: number;
  byTheme: Record<string, number>;
};

export type MemoryWallState = {
  projectId: string;
  poiKey: string;
  projectKey: string;
  title: string;
  isComplete: boolean;
  slots: (ProjectSlotProgress & { remaining: number })[];
  progress: number;
  targetTotal: number;
  progressPercent: number;
  inventory: MemoryWallInventorySummary;
  crackedBricks: LexiconBrickRecord[];
};

export type PlaceBricksResult =
  | {
      ok: true;
      placed: number;
      progress: number;
      completed: boolean;
      localXpGranted?: number;
    }
  | {
      ok: false;
      reason:
        | 'no_project'
        | 'project_complete'
        | 'no_matching_bricks'
        | 'daily_cap'
        | 'poi_locked'
        | 'not_memory_wall';
    };

export type RepairBrickResult =
  | { ok: true; brickId: string; lemma: string }
  | { ok: false; reason: 'not_found' | 'not_cracked' | 'wrong_answer' };
