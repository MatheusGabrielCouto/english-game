import type { LemmaPoolEntry } from '@/types/lexicon-brick';
import lemmaPoolJson from '../lemma-pool.json';

type LemmaPoolFile = {
  version: number;
  entries: LemmaPoolEntry[];
};

const data = lemmaPoolJson as LemmaPoolFile;

export const LEMMA_POOL: LemmaPoolEntry[] = data.entries;

export const LEMMA_POOL_BY_ID = Object.fromEntries(
  LEMMA_POOL.map((entry) => [entry.lemmaId, entry]),
) as Record<string, LemmaPoolEntry>;
