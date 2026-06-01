import { LEMMA_POOL } from '@/data/loaders/lemma-pool';
import {
  getDuelQuestionsByPack,
  getDuelQuestionsByPatent,
  type DuelQuestionPackKey,
} from '@/data/loaders/duel-questions';
import type { DuelPatent } from '@/types/duel';
import type { McqPrompt, McqQuestion, McqQuestionType } from '@/types/mcq-question';

import {
  pickLemmaDistractors,
  shuffleMcqChoices,
  shuffleMcqPrompt,
} from '../utils/mcq-distractors';

export type BuildMcqInput = {
  type: McqQuestionType;
  lemma: string;
  patent: DuelPatent;
  translation?: string;
  themeTags?: string[];
  packKey?: DuelQuestionPackKey;
};

const PATENT_MIN_TYPES: Record<DuelPatent, McqQuestionType[]> = {
  tourist: ['mcq_meaning', 'mcq_translation'],
  resident: ['mcq_meaning', 'mcq_translation', 'mcq_grammar'],
  intern: ['mcq_meaning', 'mcq_translation', 'mcq_grammar', 'mcq_cloze'],
  analyst: ['mcq_meaning', 'mcq_translation', 'mcq_grammar', 'mcq_cloze', 'mcq_register'],
  ambassador: [
    'mcq_meaning',
    'mcq_translation',
    'mcq_grammar',
    'mcq_cloze',
    'mcq_register',
    'mcq_collocation',
  ],
  fluent: [
    'mcq_meaning',
    'mcq_translation',
    'mcq_grammar',
    'mcq_cloze',
    'mcq_register',
    'mcq_collocation',
    'mcq_inference',
  ],
};

const resolvePoolEntry = (lemma: string, translation?: string) => {
  const fromPool = LEMMA_POOL.find((entry) => entry.lemma === lemma);
  if (fromPool) return fromPool;

  if (!translation) return null;

  return {
    lemmaId: `dyn_${lemma}`,
    lemma,
    translation,
    themeTags: ['any'] as string[],
    cefrBand: 'A1' as const,
  };
};

const findStaticQuestion = (
  lemma: string,
  type: McqQuestionType,
  patent: DuelPatent,
  packKey?: DuelQuestionPackKey,
): McqQuestion | null => {
  const pool = packKey ? getDuelQuestionsByPack(packKey) : getDuelQuestionsByPatent(patent);

  return (
    pool.find(
      (question) =>
        question.type === type &&
        question.patent === patent &&
        question.lemma?.toLowerCase() === lemma.toLowerCase(),
    ) ?? null
  );
};

const buildDynamicMcq = (input: BuildMcqInput): McqQuestion => {
  const lemma = input.lemma.trim().toLowerCase();
  const entry = resolvePoolEntry(lemma, input.translation);
  const translation = entry?.translation ?? input.translation?.trim() ?? lemma;

  if (input.type === 'mcq_meaning') {
    const distractorLemmas = pickLemmaDistractors(
      lemma,
      LEMMA_POOL,
      3,
      `mcq-meaning-${lemma}-${input.patent}`,
    );
    const distractorTranslations = distractorLemmas.map(
      (item) => LEMMA_POOL.find((poolEntry) => poolEntry.lemma === item)?.translation ?? item,
    );

    const choices = shuffleMcqChoices(
      [translation, ...distractorTranslations],
      `mcq-meaning-shuffle-${lemma}`,
    );
    const correctIndex = choices.findIndex(
      (choice) => choice.trim().toLowerCase() === translation.trim().toLowerCase(),
    );

    const prompt: McqPrompt = {
      stem: `What does "${lemma}" mean?`,
      choices,
      correctIndex: correctIndex >= 0 ? correctIndex : 0,
      hint: `Think about the word "${lemma}" in English.`,
    };

    return {
      id: `mcq_dyn_${lemma}_meaning`,
      type: 'mcq_meaning',
      lemma,
      patent: input.patent,
      theme: entry?.themeTags[0],
      prompt,
    };
  }

  const distractorLemmas = pickLemmaDistractors(
    lemma,
    LEMMA_POOL,
    3,
    `mcq-translation-${lemma}-${input.patent}`,
  );

  const choices = shuffleMcqChoices(
    [lemma, ...distractorLemmas],
    `mcq-translation-shuffle-${lemma}`,
  );
  const correctIndex = choices.findIndex((choice) => choice === lemma);

  const prompt: McqPrompt = {
    stem: `Choose the English for: "${translation}"`,
    choices,
    correctIndex: correctIndex >= 0 ? correctIndex : 0,
    hint: 'Pick the word that matches the Portuguese phrase.',
  };

  return {
    id: `mcq_dyn_${lemma}_translation`,
    type: 'mcq_translation',
    lemma,
    patent: input.patent,
    theme: entry?.themeTags[0],
    prompt,
  };
};

export const isMcqTypeAllowedForPatent = (type: McqQuestionType, patent: DuelPatent): boolean =>
  PATENT_MIN_TYPES[patent].includes(type);

export const buildMcqQuestion = (input: BuildMcqInput): McqQuestion => {
  const lemma = input.lemma.trim().toLowerCase();

  if (!isMcqTypeAllowedForPatent(input.type, input.patent)) {
    throw new Error(`Question type ${input.type} is not available for patent ${input.patent}`);
  }

  const staticQuestion = findStaticQuestion(lemma, input.type, input.patent, input.packKey);
  if (staticQuestion) {
    return {
      ...staticQuestion,
      prompt: shuffleMcqPrompt(
        staticQuestion.prompt,
        `static-${lemma}-${input.type}-${input.patent}`,
      ),
    };
  }

  if (input.type !== 'mcq_meaning' && input.type !== 'mcq_translation') {
    return buildDynamicMcq({ ...input, type: 'mcq_meaning' });
  }

  return buildDynamicMcq(input);
};

export const validateMcqAnswer = (prompt: McqPrompt, selectedIndex: number): boolean => {
  if (selectedIndex < 0 || selectedIndex > 3) return false;
  return prompt.correctIndex === selectedIndex;
};
