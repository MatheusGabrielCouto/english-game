import type { MissionDifficultyTierValue } from '@/features/game-design/constants/mission-types';
import type { LocalMissionTypeValue } from '@/types/city-poi-mission';
import poiEventMissionsJson from '../poi-event-missions.json';

export type PoiEventMissionTemplate = {
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
};

type PoiEventMissionsFile = {
  version: number;
  eventKey: string;
  templates: PoiEventMissionTemplate[];
};

const data = poiEventMissionsJson as PoiEventMissionsFile;

export const POI_EVENT_MISSION_EVENT_KEY = data.eventKey;

export const POI_EVENT_MISSION_TEMPLATES = data.templates;

export const POI_EVENT_MISSION_TEMPLATES_BY_POI = POI_EVENT_MISSION_TEMPLATES.reduce<
  Record<string, PoiEventMissionTemplate[]>
>((acc, template) => {
  const list = acc[template.poiKey] ?? [];
  list.push(template);
  acc[template.poiKey] = list;
  return acc;
}, {});
