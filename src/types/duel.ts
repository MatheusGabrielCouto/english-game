import type { McqPrompt } from './mcq-question';

export type DuelPatent =
  | 'tourist'
  | 'resident'
  | 'intern'
  | 'analyst'
  | 'ambassador'
  | 'fluent';

export type DuelSessionStatus = 'active' | 'won' | 'lost' | 'abandoned';

export type DuelPlayerProfileRecord = {
  id: number;
  currentPatent: DuelPatent;
  patentXp: number;
  highestPatent: DuelPatent;
  stamina: number;
  staminaUpdatedAt: string;
  focusCharges: number;
  dailyDuelCount: number;
  dailyResetDate: string;
};

export type DuelSessionRecord = {
  id: string;
  enemyKey: string;
  arenaKey: string;
  patentAtStart: DuelPatent;
  playerHp: number;
  enemyHp: number;
  comboStreak: number;
  status: DuelSessionStatus;
  startedAt: string;
  endedAt: string | null;
};

export type DuelSessionQuestionRecord = {
  id: string;
  sessionId: string;
  sortOrder: number;
  questionType: string;
  lemma: string | null;
  prompt: McqPrompt;
  answeredIndex: number | null;
  isCorrect: boolean | null;
  responseMs: number | null;
  damageDealt: number | null;
};

export type { McqPrompt };

export const DUEL_PROFILE_ROW_ID = 1;

export const DUEL_PATENT_ORDER: DuelPatent[] = [
  'tourist',
  'resident',
  'intern',
  'analyst',
  'ambassador',
  'fluent',
];

export const DUEL_PATENT_LABELS: Record<DuelPatent, string> = {
  tourist: 'Turista',
  resident: 'Morador',
  intern: 'Estagiário',
  analyst: 'Analista',
  ambassador: 'Embaixador',
  fluent: 'Fluente',
};
