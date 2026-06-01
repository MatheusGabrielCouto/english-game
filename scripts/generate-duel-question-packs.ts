/**
 * Gera pacotes JSON de duelo (A1–B2) com 200+ perguntas por tier.
 * Rode: pnpm generate:duel-packs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { McqQuestionPackSchema } from '../src/features/learning/schemas/mcq-question-schema';
import type { McqPrompt, McqQuestion } from '../src/types/mcq-question';

type SeedEntry = {
  lemma: string;
  translation: string;
  cefr: 'A1' | 'A2' | 'B1' | 'B2';
  theme?: string;
};

const hashString = (value: string): number => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
};

const shuffleChoices = (choices: string[], correctIndex: number, seed: string): McqPrompt => {
  const correct = choices[correctIndex] ?? choices[0]!;
  const sorted = [...choices].sort(
    (left, right) => hashString(`${seed}-${left}`) - hashString(`${seed}-${right}`),
  );
  const nextIndex = sorted.findIndex((choice) => choice === correct);

  return {
    stem: '',
    choices: sorted,
    correctIndex: nextIndex >= 0 ? nextIndex : 0,
    hint: '',
  };
};

const CEFR_TO_PATENT: Record<SeedEntry['cefr'], string> = {
  A1: 'tourist',
  A2: 'resident',
  B1: 'intern',
  B2: 'analyst',
};

const seedsPath = join(__dirname, 'duel-vocabulary-seeds.json');
const seedsByCefr = JSON.parse(readFileSync(seedsPath, 'utf8')) as Record<
  SeedEntry['cefr'],
  SeedEntry[]
>;

const poolPath = join(__dirname, '../src/data/lemma-pool.json');
const pool = JSON.parse(readFileSync(poolPath, 'utf8')) as {
  entries: { lemma: string; translation: string; cefrBand: string; themeTags?: string[] }[];
};

const allEntries: SeedEntry[] = [
  ...Object.values(seedsByCefr).flat(),
  ...pool.entries.map((entry) => ({
    lemma: entry.lemma,
    translation: entry.translation,
    cefr: (entry.cefrBand as SeedEntry['cefr']) ?? 'A1',
    theme: entry.themeTags?.[0],
  })),
];

const pickDistractors = <T,>(source: T[], count: number, exclude: T, seed: string): T[] => {
  const filtered = source.filter((item) => item !== exclude);
  const sorted = [...filtered].sort(
    (left, right) =>
      hashString(`${seed}-${JSON.stringify(left)}`) - hashString(`${seed}-${JSON.stringify(right)}`),
  );
  return sorted.slice(0, count);
};

const buildQuestion = (
  entry: SeedEntry,
  type: 'mcq_meaning' | 'mcq_translation',
  index: number,
  bandEntries: SeedEntry[],
): McqQuestion => {
  const patent = CEFR_TO_PATENT[entry.cefr];
  const id = `mcq_${entry.lemma}_${type}_${index}`;
  const shuffleSeed = `${entry.lemma}-${type}-${index}`;

  if (type === 'mcq_meaning') {
    const distractorTranslations = pickDistractors(
      bandEntries.map((item) => item.translation),
      3,
      entry.translation,
      `${shuffleSeed}-meaning-d`,
    );
    const rawChoices = [entry.translation, ...distractorTranslations];
    const shuffled = shuffleChoices(rawChoices, 0, `${shuffleSeed}-shuffle`);

    return {
      id,
      type,
      lemma: entry.lemma,
      patent,
      theme: entry.theme,
      prompt: {
        stem: `What does "${entry.lemma}" mean?`,
        choices: shuffled.choices,
        correctIndex: shuffled.correctIndex,
        hint: `English word: ${entry.lemma}`,
      },
    };
  }

  const distractorLemmas = pickDistractors(
    bandEntries.map((item) => item.lemma),
    3,
    entry.lemma,
    `${shuffleSeed}-translation-d`,
  );
  const rawChoices = [entry.lemma, ...distractorLemmas];
  const shuffled = shuffleChoices(rawChoices, 0, `${shuffleSeed}-shuffle`);

  return {
    id,
    type,
    lemma: entry.lemma,
    patent,
    theme: entry.theme,
    prompt: {
      stem: `Choose the English for: "${entry.translation}"`,
      choices: shuffled.choices,
      correctIndex: shuffled.correctIndex,
      hint: `Portuguese: ${entry.translation}`,
    },
  };
};

const groupByCefr = (cefr: SeedEntry['cefr']) => {
  const seen = new Set<string>();
  return allEntries.filter((entry) => {
    if (entry.cefr !== cefr) return false;
    const key = entry.lemma.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const buildPack = (packKey: string, patent: string, theme: string, cefr: SeedEntry['cefr']) => {
  const entries = groupByCefr(cefr);
  const questions: McqQuestion[] = [];

  entries.forEach((entry, index) => {
    questions.push(buildQuestion(entry, 'mcq_meaning', index * 2, entries));
    questions.push(buildQuestion(entry, 'mcq_translation', index * 2 + 1, entries));
  });

  return McqQuestionPackSchema.parse({
    version: 1,
    packKey,
    patent,
    theme,
    questions,
  });
};

const packs = [
  buildPack('a1-core', 'tourist', 'core', 'A1'),
  buildPack('a2-routine', 'resident', 'routine', 'A2'),
  buildPack('b1-work', 'intern', 'work', 'B1'),
  buildPack('b2-abstract', 'analyst', 'abstract', 'B2'),
];

const outDir = join(__dirname, '../src/data/duel-questions');

for (const pack of packs) {
  const path = join(outDir, `${pack.packKey}.json`);
  writeFileSync(path, `${JSON.stringify(pack, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${path} (${pack.questions.length} questions)`);
}

const total = packs.reduce((sum, pack) => sum + pack.questions.length, 0);
console.log(`Total static questions: ${total}`);

for (const pack of packs) {
  const alwaysZero = pack.questions.every((q) => q.prompt.correctIndex === 0);
  const indices = new Set(pack.questions.map((q) => q.prompt.correctIndex));
  console.log(
    `${pack.packKey}: correctIndex distribution`,
    [...indices].sort().join(','),
    alwaysZero ? '(all zero — check shuffle)' : '',
  );
}
