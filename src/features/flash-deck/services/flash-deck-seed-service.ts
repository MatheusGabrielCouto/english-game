import {
    getEnglish1000FlashPack,
    getInterviewTechFlashPack,
    type FlashDeckSeedPack,
} from '@/data/loaders/flash-deck-seed';
import {
    DEFAULT_FLASH_DECK_ID,
    INTERVIEW_TECH_DECK_ID,
    type FlashCardRecord,
} from '@/types/flash-card';

import { FlashDeckRepository } from '@/storage/repositories/flash-deck-repository';
import { LearningAppStateRepository } from '@/storage/repositories/learning-app-state-repository';

import { FLASH_SRS_CONFIG } from '../constants/flash-srs-config';

const ENGLISH_SEED_STATE_KEY = 'flash_english_1000_seeded_v1';
const INTERVIEW_SEED_STATE_KEY = 'flash_interview_tech_seeded_v1';
const ENGLISH_CARDS_PER_DAY = 10;
const INTERVIEW_CARDS_PER_DAY = 12;

const addDays = (from: Date, days: number): Date => {
  const result = new Date(from);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
};

type PackSeedOptions = {
  stateKey: string;
  pack: FlashDeckSeedPack;
  sortOrder: number;
  idPrefix: string;
  cardsPerDay: number;
  defaultNewPerDay: number;
};

const buildPackCard = (
  deckId: string,
  entry: FlashDeckSeedPack['cards'][number],
  baseNow: Date,
  idPrefix: string,
  cardsPerDay: number,
): FlashCardRecord => {
  const dueDayOffset = Math.floor((entry.rank - 1) / cardsPerDay);
  const dueAt = addDays(baseNow, dueDayOffset).toISOString();
  const createdAt = baseNow.toISOString();

  return {
    id: `${idPrefix}${String(entry.rank).padStart(4, '0')}`,
    deckId,
    lemma: entry.lemma,
    front: entry.front,
    back: entry.back,
    exampleSentence: entry.exampleSentence ?? null,
    audioUri: null,
    imageUri: null,
    tags: entry.tags,
    source: 'pack',
    easeFactor: FLASH_SRS_CONFIG.defaultEaseFactor,
    intervalDays: 0,
    repetitions: 0,
    lapseCount: 0,
    dueAt,
    state: 'new',
    lastReviewedAt: null,
    createdAt,
    suspended: false,
  };
};

const seedPack = async (options: PackSeedOptions): Promise<{ seeded: boolean; cardCount: number }> => {
  const { stateKey, pack, sortOrder, idPrefix, cardsPerDay, defaultNewPerDay } = options;
  const deckId = pack.deckId;

  const flag = await LearningAppStateRepository.get(stateKey);
  if (flag === '1') {
    return { seeded: false, cardCount: 0 };
  }

  const existingPackCards = await FlashDeckRepository.countCardsBySource(deckId, 'pack');
  if (existingPackCards > 0) {
    await LearningAppStateRepository.set(stateKey, '1');
    return { seeded: false, cardCount: 0 };
  }

  let deck = await FlashDeckRepository.getDeck(deckId);
  const now = new Date().toISOString();

  if (!deck) {
    await FlashDeckRepository.insertDeck({
      id: deckId,
      name: pack.name,
      description: pack.description,
      coverEmoji: pack.coverEmoji,
      sortOrder,
      newPerDay: pack.newPerDay ?? defaultNewPerDay,
      reviewCap: 80,
      createdAt: now,
      archivedAt: null,
    });
    deck = await FlashDeckRepository.getDeck(deckId);
  }

  if (deck) {
    await FlashDeckRepository.updateDeck({
      ...deck,
      name: pack.name,
      description: pack.description,
      coverEmoji: pack.coverEmoji,
      sortOrder,
      newPerDay: Math.max(deck.newPerDay, pack.newPerDay ?? defaultNewPerDay),
    });
  }

  const baseNow = new Date();
  const cards = pack.cards.map((entry) =>
    buildPackCard(deckId, entry, baseNow, idPrefix, cardsPerDay),
  );

  await FlashDeckRepository.insertCardsBatch(cards);
  await LearningAppStateRepository.set(stateKey, '1');

  return { seeded: true, cardCount: cards.length };
};

export const FlashDeckSeedService = {
  async isEnglish1000Seeded(): Promise<boolean> {
    const flag = await LearningAppStateRepository.get(ENGLISH_SEED_STATE_KEY);
    if (flag === '1') return true;

    const packCount = await FlashDeckRepository.countCardsBySource(DEFAULT_FLASH_DECK_ID, 'pack');
    return packCount > 0;
  },

  async isInterviewTechSeeded(): Promise<boolean> {
    const flag = await LearningAppStateRepository.get(INTERVIEW_SEED_STATE_KEY);
    if (flag === '1') return true;

    const packCount = await FlashDeckRepository.countCardsBySource(INTERVIEW_TECH_DECK_ID, 'pack');
    return packCount > 0;
  },

  async initialize(): Promise<{
    english: { seeded: boolean; cardCount: number };
    interview: { seeded: boolean; cardCount: number };
  }> {
    const english = await seedPack({
      stateKey: ENGLISH_SEED_STATE_KEY,
      pack: getEnglish1000FlashPack(),
      sortOrder: 0,
      idPrefix: 'flash_pack_',
      cardsPerDay: ENGLISH_CARDS_PER_DAY,
      defaultNewPerDay: 15,
    });

    const interview = await seedPack({
      stateKey: INTERVIEW_SEED_STATE_KEY,
      pack: getInterviewTechFlashPack(),
      sortOrder: 1,
      idPrefix: 'flash_interview_',
      cardsPerDay: INTERVIEW_CARDS_PER_DAY,
      defaultNewPerDay: 12,
    });

    return { english, interview };
  },
};
