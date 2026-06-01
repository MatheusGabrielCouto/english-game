import type { LemmaPoolEntry } from '@/types/lexicon-brick';
import type { McqPrompt } from '@/types/mcq-question';

import { pickDeterministicSubset } from '@/features/game-design/utils/reward-scaling';

const sharesTheme = (left: string[], right: string[]): boolean =>
  left.some((tag) => right.includes(tag) || tag === 'any');

export const pickLemmaDistractors = (
  correctLemma: string,
  pool: LemmaPoolEntry[],
  count: number,
  seed: string,
): string[] => {
  if (count <= 0) return [];

  const correct = pool.find((entry) => entry.lemma === correctLemma);
  const themeTags = correct?.themeTags ?? ['any'];

  let candidates = pool.filter(
    (entry) => entry.lemma !== correctLemma && sharesTheme(entry.themeTags, themeTags),
  );

  if (candidates.length < count) {
    const seen = new Set(candidates.map((entry) => entry.lemma));
    for (const entry of pool) {
      if (entry.lemma === correctLemma || seen.has(entry.lemma)) continue;
      candidates.push(entry);
      seen.add(entry.lemma);
      if (candidates.length >= count * 2) break;
    }
  }

  const lemmas = pickDeterministicSubset(
    candidates.map((entry) => entry.lemma),
    Math.min(count, candidates.length),
    seed,
  );

  return lemmas;
};

export const shuffleMcqChoices = (choices: string[], seed: string): string[] =>
  pickDeterministicSubset(choices, choices.length, seed);

/** Reorders choices and updates correctIndex to match the shuffled position. */
export const shuffleMcqPrompt = (prompt: McqPrompt, seed: string): McqPrompt => {
  const correctChoice = prompt.choices[prompt.correctIndex];
  if (!correctChoice) return prompt;

  const choices = shuffleMcqChoices(prompt.choices, seed);
  const correctIndex = choices.findIndex((choice) => choice === correctChoice);

  return {
    ...prompt,
    choices,
    correctIndex: correctIndex >= 0 ? correctIndex : 0,
  };
};

export const choicesAreDistinct = (choices: string[]): boolean => {
  const normalized = choices.map((choice) => choice.trim().toLowerCase());
  return new Set(normalized).size === choices.length;
};
