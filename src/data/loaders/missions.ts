import {
    JOURNAL_DAILY_MISSION_CATALOG,
    JOURNAL_WEEKLY_MISSION_CATALOG,
} from '@/features/english-journal/catalogs/journal-missions-catalog';
import {
    LEARNING_DAILY_MISSION_CATALOG,
    LEARNING_WEEKLY_MISSION_CATALOG,
} from '@/features/learning/catalogs/learning-missions-catalog';

import missionsJson from '../missions.json';
import type { MissionsDataFile } from '../types';

const missionsData = missionsJson as MissionsDataFile;

export const getMissionsData = (): MissionsDataFile => missionsData;

export const DAILY_MISSION_CATALOG = [
  ...missionsData.daily,
  ...LEARNING_DAILY_MISSION_CATALOG,
  ...JOURNAL_DAILY_MISSION_CATALOG,
];

export const WEEKLY_MISSION_CATALOG = [
  ...missionsData.weekly,
  ...LEARNING_WEEKLY_MISSION_CATALOG,
  ...JOURNAL_WEEKLY_MISSION_CATALOG,
];

export const EPIC_MISSION_CATALOG = missionsData.epic;
