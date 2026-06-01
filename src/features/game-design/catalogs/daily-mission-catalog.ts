import {
  CATEGORY_LABELS,
  type MissionCategoryValue,
} from '../constants/mission-types';

export type { DailyMissionTemplate } from '@/data/types';

export {
  DAILY_MISSION_CATALOG,
  getMissionsData
} from '@/data/loaders/missions';

import { DAILY_MISSION_CATALOG } from '@/data/loaders/missions';

export const getDailyMissionCount = (): number => DAILY_MISSION_CATALOG.length;

export const getCategoryLabel = (category: MissionCategoryValue): string =>
  CATEGORY_LABELS[category] ?? category;
