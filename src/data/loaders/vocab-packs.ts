import christmasPack from '../vocab-packs/christmas.json';

export type VocabPackWord = {
  term: string;
  translation: string;
  example: string;
};

export type VocabPackDefinition = {
  packKey: string;
  title: string;
  farmIntegration: 'override' | 'append' | 'weighted_mix';
  brickConversion: number;
  words: VocabPackWord[];
};

type VocabPackFile = VocabPackDefinition & { version: number };

const PACKS: VocabPackDefinition[] = [(christmasPack as VocabPackFile)];

export const VOCAB_PACKS_BY_KEY = Object.fromEntries(
  PACKS.map((pack) => [pack.packKey, pack]),
) as Record<string, VocabPackDefinition>;
