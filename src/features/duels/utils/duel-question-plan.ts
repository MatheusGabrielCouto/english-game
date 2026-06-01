import { getDuelQuestionsUpToPatent } from '@/data/loaders/duel-questions';
import { isMcqTypeAllowedForPatent } from '@/features/learning/services/mcq-question-builder';
import { shuffleMcqPrompt } from '@/features/learning/utils/mcq-distractors';
import { pickDeterministicSubset } from '@/features/game-design/utils/reward-scaling';
import type { FlashCardRecord } from '@/types/flash-card';
import type { DuelPatent } from '@/types/duel';
import type { McqQuestion } from '@/types/mcq-question';

import { McqQuestionService } from '@/features/learning';

import type { DuelSessionQuestionRecord } from '@/types/duel';

const createId = (prefix: string) =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

const questionKey = (question: McqQuestion): string =>
  `${question.type}:${question.lemma?.trim().toLowerCase() ?? question.id}`;

const pickRandomDuelQuestions = (
  patent: DuelPatent,
  count: number,
  sessionId: string,
): McqQuestion[] => {
  const pool = getDuelQuestionsUpToPatent(patent).filter((question) =>
    isMcqTypeAllowedForPatent(question.type, patent),
  );

  if (pool.length === 0) return [];

  const ordered = pickDeterministicSubset(
    pool,
    Math.min(pool.length, Math.max(count * 4, count)),
    `${sessionId}-duel-pool`,
  );

  const selected: McqQuestion[] = [];
  const seen = new Set<string>();

  for (const question of ordered) {
    const key = questionKey(question);
    if (seen.has(key)) continue;
    seen.add(key);
    selected.push(question);
    if (selected.length >= count) break;
  }

  let fillIndex = 0;
  while (selected.length < count) {
    const question = pool[fillIndex % pool.length]!;
    selected.push(question);
    fillIndex += 1;
  }

  return selected;
};

const toSessionQuestion = (
  built: McqQuestion,
  sessionId: string,
  index: number,
): DuelSessionQuestionRecord => ({
  id: createId('duel_q'),
  sessionId,
  sortOrder: index,
  questionType: built.type,
  lemma: built.lemma ?? '',
  prompt: shuffleMcqPrompt(built.prompt, `${sessionId}-shuffle-${index}`),
  answeredIndex: null,
  isCorrect: null,
  responseMs: null,
  damageDealt: null,
});

export const buildDuelQuestionsForSession = async (
  sessionId: string,
  count: number,
  patent: DuelPatent,
): Promise<DuelSessionQuestionRecord[]> => {
  const picked = pickRandomDuelQuestions(patent, count, sessionId);

  if (picked.length > 0) {
    return picked.map((question, index) => toSessionQuestion(question, sessionId, index));
  }

  const lemmas = await McqQuestionService.pickLemmasForSession(count, sessionId);

  return lemmas.map((lemma, index) => {
    const type = index % 2 === 0 ? 'mcq_meaning' : 'mcq_translation';
    const built = McqQuestionService.buildMcq({
      type,
      lemma,
      patent,
    });

    return toSessionQuestion(built, sessionId, index);
  });
};

export const buildCardDuelQuestions = (
  sessionId: string,
  cards: FlashCardRecord[],
  patent: DuelPatent,
): DuelSessionQuestionRecord[] =>
  cards.map((card, index) => {
    const lemma = card.lemma ?? card.front.trim().toLowerCase();
    const built = McqQuestionService.buildMcq({
      type: index % 2 === 0 ? 'mcq_meaning' : 'mcq_translation',
      lemma,
      patent,
      translation: card.back,
    });

    return toSessionQuestion(built, sessionId, index);
  });

export const cloneRematchQuestions = (
  source: DuelSessionQuestionRecord[],
  newSessionId: string,
): DuelSessionQuestionRecord[] =>
  source.map((question, index) => ({
    ...question,
    id: createId('duel_q'),
    sessionId: newSessionId,
    sortOrder: index,
    prompt: shuffleMcqPrompt(question.prompt, `${newSessionId}-rematch-${index}`),
    answeredIndex: null,
    isCorrect: null,
    responseMs: null,
    damageDealt: null,
  }));
