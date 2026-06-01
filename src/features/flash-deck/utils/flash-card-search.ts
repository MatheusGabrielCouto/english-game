import type { FlashCardRecord } from '@/types/flash-card';

export const normalizeSearchQuery = (query: string): string => query.trim().toLowerCase();

export const cardMatchesSearch = (card: FlashCardRecord, query: string): boolean => {
  const needle = normalizeSearchQuery(query);
  if (!needle) return true;

  if (card.front.toLowerCase().includes(needle)) return true;
  if (card.back.toLowerCase().includes(needle)) return true;
  if (card.lemma?.toLowerCase().includes(needle)) return true;
  if (card.exampleSentence?.toLowerCase().includes(needle)) return true;

  return card.tags.some((tag) => tag.toLowerCase().includes(needle));
};

export const cardMatchesTag = (card: FlashCardRecord, tag: string | null): boolean => {
  if (!tag) return true;
  const needle = tag.trim().toLowerCase();
  return card.tags.some((item) => item.toLowerCase() === needle);
};

export const parseTagsInput = (raw: string): string[] => {
  const parts = raw
    .split(/[,;#]/)
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);

  return [...new Set(parts)];
};

export const collectTagsFromCards = (cards: FlashCardRecord[]): string[] => {
  const set = new Set<string>();
  for (const card of cards) {
    for (const tag of card.tags) {
      if (tag) set.add(tag);
    }
  }
  return [...set].sort((a, b) => a.localeCompare(b));
};
