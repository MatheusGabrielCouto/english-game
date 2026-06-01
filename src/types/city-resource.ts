export const CityResourceType = {
  LEXICON_BRICK: 'lexicon_brick',
  FLUENCY_CEMENT: 'fluency_cement',
  CONSISTENCY_WOOD: 'consistency_wood',
} as const;

export type CityResourceTypeValue =
  (typeof CityResourceType)[keyof typeof CityResourceType];

export type CityResourceBalances = Record<CityResourceTypeValue, number>;

import type { ProjectBlueprint } from '@/types/lexicon-brick';

export type PoiProjectDefinition = {
  projectKey: string;
  poiKey: string;
  title: string;
  description: string;
  resourceType: CityResourceTypeValue;
  targetTotal: number;
  deliveryChunk: number;
  minLocalLevel: number;
  localXpOnComplete: number;
  vitalityOnComplete: number;
  blueprint?: ProjectBlueprint;
};

export type CityPoiProjectRecord = {
  id: string;
  poiKey: string;
  projectKey: string;
  weekStartDate: string;
  title: string;
  description: string;
  resourceType: CityResourceTypeValue;
  targetTotal: number;
  deliveryChunk: number;
  progress: number;
  localXpOnComplete: number;
  vitalityOnComplete: number;
  completedAt: string | null;
  createdAt: string;
};

export type CityPoiProjectViewModel = CityPoiProjectRecord & {
  progressPercent: number;
  isComplete: boolean;
  resourceLabel: string;
  resourceEmoji: string;
};

export type DeliverToProjectResult =
  | {
      ok: true;
      delivered: number;
      progress: number;
      completed: boolean;
      localXpGranted?: number;
    }
  | {
      ok: false;
      reason:
        | 'no_project'
        | 'project_complete'
        | 'memory_wall_project'
        | 'insufficient_resources'
        | 'daily_cap'
        | 'poi_locked';
    };
