import type { MissionDifficultyTierValue } from '@/features/game-design/constants/mission-types';
import type { LocalMissionTypeValue } from '@/types/city-poi-mission';
import poiMissionsJson from '../poi-missions.json';

export type PoiMissionTemplate = {
  templateKey: string;
  poiKey: string;
  missionType: LocalMissionTypeValue;
  title: string;
  description: string;
  targetValue: number;
  baseXp: number;
  baseCoins: number;
  baseLocalXp: number;
  difficulty: MissionDifficultyTierValue;
  minLocalLevel: number;
  requiresLemmaSet?: string;
};

type PoiMissionsDataFile = {
  version: number;
  templates: PoiMissionTemplate[];
};

const data = poiMissionsJson as PoiMissionsDataFile;

export const POI_MISSION_TEMPLATES = data.templates;

export const POI_MISSION_TEMPLATES_BY_POI = POI_MISSION_TEMPLATES.reduce<
  Record<string, PoiMissionTemplate[]>
>((acc, template) => {
  const list = acc[template.poiKey] ?? [];
  list.push(template);
  acc[template.poiKey] = list;
  return acc;
}, {});
