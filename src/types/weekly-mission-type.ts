export const WeeklyMissionType = {
  STUDY_DAYS: 'STUDY_DAYS',
  DAILY_MISSIONS_COMPLETED: 'DAILY_MISSIONS_COMPLETED',
  XP_GAINED: 'XP_GAINED',
  WORDS_LEARNED: 'WORDS_LEARNED',
  SPEAKING_SESSIONS: 'SPEAKING_SESSIONS',
  DUEL_WINS: 'DUEL_WINS',
  FLASH_REVIEWS: 'FLASH_REVIEWS',
  JOURNAL_ENTRIES: 'JOURNAL_ENTRIES',
  JOURNAL_REVIEWS: 'JOURNAL_REVIEWS',
} as const;

export type WeeklyMissionType =
  (typeof WeeklyMissionType)[keyof typeof WeeklyMissionType];

const WEEKLY_MISSION_TYPES = new Set<string>(Object.values(WeeklyMissionType));

export const isWeeklyMissionType = (value: string): value is WeeklyMissionType =>
  WEEKLY_MISSION_TYPES.has(value);
