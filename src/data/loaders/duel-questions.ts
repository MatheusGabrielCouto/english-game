import { DUEL_PATENT_ORDER, type DuelPatent } from '@/types/duel';
import type { McqQuestion, McqQuestionPack } from '@/types/mcq-question';

import { McqQuestionPackSchema } from '@/features/learning/schemas/mcq-question-schema';
import a1CoreJson from '../duel-questions/a1-core.json';
import a1TravelJson from '../duel-questions/a1-travel.json';
import a2RoutineJson from '../duel-questions/a2-routine.json';
import b1WorkJson from '../duel-questions/b1-work.json';
import b2AbstractJson from '../duel-questions/b2-abstract.json';

const packs = {
  'a1-core': a1CoreJson,
  'a1-travel': a1TravelJson,
  'a2-routine': a2RoutineJson,
  'b1-work': b1WorkJson,
  'b2-abstract': b2AbstractJson,
} as const;

export type DuelQuestionPackKey = keyof typeof packs;

const parsePack = (raw: unknown): McqQuestionPack => McqQuestionPackSchema.parse(raw);

const PACKS: Record<DuelQuestionPackKey, McqQuestionPack> = Object.fromEntries(
  Object.entries(packs).map(([key, raw]) => [key, parsePack(raw)]),
) as Record<DuelQuestionPackKey, McqQuestionPack>;

export const DUEL_QUESTION_PACK_KEYS = Object.keys(PACKS) as DuelQuestionPackKey[];

/** All validated questions from a content pack */
export const getDuelQuestionsByPack = (packKey: DuelQuestionPackKey): McqQuestion[] =>
  PACKS[packKey]?.questions ?? [];

/** Questions filtered by patent (CEFR ladder) */
export const getDuelQuestionsByPatent = (patent: DuelPatent): McqQuestion[] =>
  Object.values(PACKS).flatMap((pack) =>
    pack.patent === patent ? pack.questions : [],
  );

/** All pack questions at or below the player's patent tier */
export const getDuelQuestionsUpToPatent = (patent: DuelPatent): McqQuestion[] => {
  const patentIndex = DUEL_PATENT_ORDER.indexOf(patent);
  if (patentIndex < 0) return [];

  return Object.values(PACKS).flatMap((pack) => {
    const packPatentIndex = DUEL_PATENT_ORDER.indexOf(pack.patent as DuelPatent);
    if (packPatentIndex < 0 || packPatentIndex > patentIndex) return [];
    return pack.questions;
  });
};

export const getDuelQuestionPack = (packKey: DuelQuestionPackKey): McqQuestionPack | null =>
  PACKS[packKey] ?? null;

/** Pack + patent pool for duels and MCQ generator fallbacks */
export const loadDuelQuestionPool = (options?: {
  packKey?: DuelQuestionPackKey;
  patent?: DuelPatent;
}): McqQuestion[] => {
  if (options?.packKey) {
    return getDuelQuestionsByPack(options.packKey);
  }
  if (options?.patent) {
    return getDuelQuestionsByPatent(options.patent);
  }
  return Object.values(PACKS).flatMap((pack) => pack.questions);
};
