/**
 * Gera o pacote de 1000 palavras para o baralho padrão.
 * Rode: pnpm generate:english-1000
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

type SeedEntry = {
  lemma: string;
  translation: string;
  cefr: 'A1' | 'A2' | 'B1' | 'B2';
  theme?: string;
};

const CEFR_RANK: Record<SeedEntry['cefr'], number> = {
  A1: 1,
  A2: 2,
  B1: 3,
  B2: 4,
};

/** Function words + ultra-high frequency (often missing from themed lists) */
const CORE_EXTRA: SeedEntry[] = [
  { lemma: 'the', translation: 'o / a / os / as', cefr: 'A1', theme: 'grammar' },
  { lemma: 'a', translation: 'um / uma', cefr: 'A1', theme: 'grammar' },
  { lemma: 'an', translation: 'um / uma', cefr: 'A1', theme: 'grammar' },
  { lemma: 'and', translation: 'e', cefr: 'A1', theme: 'grammar' },
  { lemma: 'or', translation: 'ou', cefr: 'A1', theme: 'grammar' },
  { lemma: 'but', translation: 'mas', cefr: 'A1', theme: 'grammar' },
  { lemma: 'if', translation: 'se', cefr: 'A1', theme: 'grammar' },
  { lemma: 'in', translation: 'em / no / na', cefr: 'A1', theme: 'grammar' },
  { lemma: 'on', translation: 'em / sobre', cefr: 'A1', theme: 'grammar' },
  { lemma: 'at', translation: 'em / a', cefr: 'A1', theme: 'grammar' },
  { lemma: 'to', translation: 'para / a', cefr: 'A1', theme: 'grammar' },
  { lemma: 'of', translation: 'de', cefr: 'A1', theme: 'grammar' },
  { lemma: 'for', translation: 'para / por', cefr: 'A1', theme: 'grammar' },
  { lemma: 'with', translation: 'com', cefr: 'A1', theme: 'grammar' },
  { lemma: 'from', translation: 'de / desde', cefr: 'A1', theme: 'grammar' },
  { lemma: 'by', translation: 'por / de', cefr: 'A1', theme: 'grammar' },
  { lemma: 'as', translation: 'como', cefr: 'A1', theme: 'grammar' },
  { lemma: 'is', translation: 'é / está', cefr: 'A1', theme: 'grammar' },
  { lemma: 'are', translation: 'são / estão', cefr: 'A1', theme: 'grammar' },
  { lemma: 'was', translation: 'era / estava', cefr: 'A1', theme: 'grammar' },
  { lemma: 'were', translation: 'eram / estavam', cefr: 'A1', theme: 'grammar' },
  { lemma: 'be', translation: 'ser / estar', cefr: 'A1', theme: 'grammar' },
  { lemma: 'have', translation: 'ter', cefr: 'A1', theme: 'grammar' },
  { lemma: 'has', translation: 'tem', cefr: 'A1', theme: 'grammar' },
  { lemma: 'had', translation: 'tinha / teve', cefr: 'A1', theme: 'grammar' },
  { lemma: 'do', translation: 'fazer', cefr: 'A1', theme: 'grammar' },
  { lemma: 'does', translation: 'faz', cefr: 'A1', theme: 'grammar' },
  { lemma: 'did', translation: 'fez', cefr: 'A1', theme: 'grammar' },
  { lemma: 'will', translation: 'vai / irá', cefr: 'A1', theme: 'grammar' },
  { lemma: 'would', translation: 'iria / faria', cefr: 'A2', theme: 'grammar' },
  { lemma: 'can', translation: 'poder / conseguir', cefr: 'A1', theme: 'grammar' },
  { lemma: 'could', translation: 'poderia', cefr: 'A2', theme: 'grammar' },
  { lemma: 'should', translation: 'deveria', cefr: 'A2', theme: 'grammar' },
  { lemma: 'may', translation: 'poder / talvez', cefr: 'A2', theme: 'grammar' },
  { lemma: 'might', translation: 'poderia', cefr: 'A2', theme: 'grammar' },
  { lemma: 'must', translation: 'dever / precisar', cefr: 'A2', theme: 'grammar' },
  { lemma: 'this', translation: 'este / esta / isso', cefr: 'A1', theme: 'grammar' },
  { lemma: 'that', translation: 'aquele / isso', cefr: 'A1', theme: 'grammar' },
  { lemma: 'these', translation: 'estes / estas', cefr: 'A1', theme: 'grammar' },
  { lemma: 'those', translation: 'aqueles / aquelas', cefr: 'A1', theme: 'grammar' },
  { lemma: 'it', translation: 'ele / ela / isso', cefr: 'A1', theme: 'grammar' },
  { lemma: 'they', translation: 'eles / elas', cefr: 'A1', theme: 'grammar' },
  { lemma: 'we', translation: 'nós', cefr: 'A1', theme: 'grammar' },
  { lemma: 'you', translation: 'você / vocês', cefr: 'A1', theme: 'grammar' },
  { lemma: 'he', translation: 'ele', cefr: 'A1', theme: 'grammar' },
  { lemma: 'she', translation: 'ela', cefr: 'A1', theme: 'grammar' },
  { lemma: 'I', translation: 'eu', cefr: 'A1', theme: 'grammar' },
  { lemma: 'my', translation: 'meu / minha', cefr: 'A1', theme: 'grammar' },
  { lemma: 'your', translation: 'seu / sua', cefr: 'A1', theme: 'grammar' },
  { lemma: 'his', translation: 'dele', cefr: 'A1', theme: 'grammar' },
  { lemma: 'her', translation: 'dela', cefr: 'A1', theme: 'grammar' },
  { lemma: 'our', translation: 'nosso / nossa', cefr: 'A1', theme: 'grammar' },
  { lemma: 'their', translation: 'deles / delas', cefr: 'A1', theme: 'grammar' },
  { lemma: 'not', translation: 'não', cefr: 'A1', theme: 'grammar' },
];

const seedsPath = join(__dirname, 'duel-vocabulary-seeds.json');
const seedsByCefr = JSON.parse(readFileSync(seedsPath, 'utf8')) as Record<
  SeedEntry['cefr'],
  SeedEntry[]
>;

const poolPath = join(__dirname, '../src/data/lemma-pool.json');
const pool = JSON.parse(readFileSync(poolPath, 'utf8')) as {
  entries: { lemma: string; translation: string; cefrBand: string; themeTags?: string[] }[];
};

const fromPool: SeedEntry[] = pool.entries.map((entry) => ({
  lemma: entry.lemma,
  translation: entry.translation,
  cefr: (entry.cefrBand as SeedEntry['cefr']) ?? 'A1',
  theme: entry.themeTags?.[0],
}));

const allSources = [...CORE_EXTRA, ...Object.values(seedsByCefr).flat(), ...fromPool];

const seen = new Set<string>();
const unique: SeedEntry[] = [];

for (const entry of allSources) {
  const key = entry.lemma.trim().toLowerCase();
  if (!key || seen.has(key)) continue;
  seen.add(key);
  unique.push({
    lemma: entry.lemma.trim().toLowerCase(),
    translation: entry.translation.trim(),
    cefr: entry.cefr,
    theme: entry.theme,
  });
}

unique.sort((left, right) => {
  const cefrDiff = CEFR_RANK[left.cefr] - CEFR_RANK[right.cefr];
  if (cefrDiff !== 0) return cefrDiff;
  return left.lemma.localeCompare(right.lemma);
});

const TARGET = 1000;
const picked = unique.slice(0, TARGET);

if (picked.length < TARGET) {
  console.warn(`Only ${picked.length} unique entries available (target ${TARGET})`);
}

const pack = {
  version: 1 as const,
  deckId: 'deck_default',
  name: '1000 palavras essenciais',
  description: 'As palavras mais usadas em inglês — pronto para revisar',
  coverEmoji: '🌍',
  cards: picked.map((entry, index) => ({
    rank: index + 1,
    front: entry.lemma,
    back: entry.translation,
    lemma: entry.lemma,
    tags: ['essencial', entry.cefr.toLowerCase(), ...(entry.theme ? [entry.theme] : [])],
  })),
};

const outPath = join(__dirname, '../src/data/flash-deck-seeds/english-1000.json');
writeFileSync(outPath, `${JSON.stringify(pack)}\n`, 'utf8');
console.log(`Wrote ${outPath} (${pack.cards.length} cards)`);
