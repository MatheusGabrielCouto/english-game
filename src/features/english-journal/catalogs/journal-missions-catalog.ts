import type { DailyMissionTemplate, WeeklyMissionTemplate } from '@/data/types';
import { MissionCategory, MissionDifficultyTier } from '@/features/game-design/constants/mission-types';
import { WeeklyMissionType } from '@/types/weekly-mission-type';

export const JOURNAL_DAILY_TEMPLATE_KEYS = {
  voiceNote: 'journal_daily_voice_note',
  create3: 'journal_daily_create_3',
  reviewOld: 'journal_daily_review_old',
  replayVoice: 'journal_daily_replay_voice',
} as const;

export const JOURNAL_DAILY_MISSION_CATALOG: DailyMissionTemplate[] = [
  {
    id: JOURNAL_DAILY_TEMPLATE_KEYS.voiceNote,
    category: MissionCategory.SPEAKING,
    title: 'Nota de voz',
    description: 'Crie uma Voice Note no English Journal.',
    difficulty: MissionDifficultyTier.EASY,
    baseXp: 45,
    baseCoins: 18,
  },
  {
    id: JOURNAL_DAILY_TEMPLATE_KEYS.create3,
    category: MissionCategory.VOCABULARY,
    title: '3 registros',
    description: 'Crie 3 notas no journal hoje.',
    difficulty: MissionDifficultyTier.MEDIUM,
    baseXp: 55,
    baseCoins: 22,
  },
  {
    id: JOURNAL_DAILY_TEMPLATE_KEYS.reviewOld,
    category: MissionCategory.REVISION,
    title: 'Revisar nota',
    description: 'Revise uma nota antiga do journal.',
    difficulty: MissionDifficultyTier.EASY,
    baseXp: 40,
    baseCoins: 16,
  },
  {
    id: JOURNAL_DAILY_TEMPLATE_KEYS.replayVoice,
    category: MissionCategory.LISTENING,
    title: 'Ouvir gravação',
    description: 'Ouça novamente uma gravação salva.',
    difficulty: MissionDifficultyTier.EASY,
    baseXp: 35,
    baseCoins: 14,
  },
];

export const JOURNAL_WEEKLY_MISSION_CATALOG: WeeklyMissionTemplate[] = [
  {
    id: 'journal_weekly_entries_5',
    category: MissionCategory.VOCABULARY,
    title: 'Cofre de conhecimento',
    description: 'Crie 5 notas no journal esta semana.',
    missionType: WeeklyMissionType.JOURNAL_ENTRIES,
    targetValue: 5,
    difficulty: MissionDifficultyTier.MEDIUM,
    baseXp: 110,
    baseCoins: 40,
  },
];
