/**
 * Gera o baralho de entrevistas internacionais em tech.
 * Rode: pnpm generate:interview-tech
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { INTERVIEW_TECH_ENTRIES } from './data/interview-tech-seed';

const pack = {
  version: 1 as const,
  deckId: 'deck_interview_tech',
  name: 'Entrevistas internacionais (Tech)',
  description:
    'Palavras e frases para entrevistas em inglês — comunicação profissional, sem jargão de linguagem específica',
  coverEmoji: '💼',
  newPerDay: 12,
  cards: INTERVIEW_TECH_ENTRIES.map((entry, index) => ({
    rank: index + 1,
    front: entry.front,
    back: entry.back,
    lemma: entry.front.split(/\s+/).slice(0, 3).join(' ').toLowerCase(),
    tags: ['interview', 'tech-career', ...entry.tags],
    exampleSentence: entry.example,
  })),
};

const outPath = join(__dirname, '../src/data/flash-deck-seeds/interview-tech.json');
writeFileSync(outPath, `${JSON.stringify(pack)}\n`, 'utf8');
console.log(`Wrote ${outPath} (${pack.cards.length} cards)`);
