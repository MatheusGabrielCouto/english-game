import { LEMMA_POOL } from '@/data/loaders/lemma-pool';
import { pickDeterministicSubset } from '@/features/game-design/utils/reward-scaling';
import { getTodayKey } from '@/features/quests/utils/date';
import { GameEvents, type GameEvent } from '@/services/game-events';
import { LemmaMasteryRepository } from '@/storage/repositories/lemma-mastery-repository';
import { LexiconBrickRepository } from '@/storage/repositories/lexicon-brick-repository';
import type { LemmaPoolEntry, LexiconBrickRecord } from '@/types/lexicon-brick';

import {
    BRICK_DECAY_BLANK_STAGE,
    BRICK_DECAY_CRACKED_STAGE,
    MASTERY_REINFORCE_THRESHOLD,
    MINT_RECOGNITION_BONUS,
    REPAIR_PRODUCTION_BONUS,
    REPAIR_RECOGNITION_BONUS,
    SRS_REVIEW_INTERVALS_DAYS,
} from '../constants/memory-wall-config';
import { CityEventScheduler } from './city-event-scheduler';

let listenersInitialized = false;
let mintSessionCounter = 0;

const addDaysIso = (days: number): string => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
};

const nextReviewAfterSuccess = (currentStage: number): string => {
  const index = Math.min(currentStage, SRS_REVIEW_INTERVALS_DAYS.length - 1);
  return addDaysIso(SRS_REVIEW_INTERVALS_DAYS[index] ?? 1);
};

const buildBrickId = (lemmaId: string): string =>
  `brick_${lemmaId}_${Date.now()}_${mintSessionCounter++}`;

const normalizeToken = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const toLemmaId = (term: string): string =>
  `farm_${normalizeToken(term).replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'word'}`;

const pickLemmasForMint = (amount: number, seed: string): LemmaPoolEntry[] => {
  const count = Math.min(amount, LEMMA_POOL.length);
  return pickDeterministicSubset(LEMMA_POOL, count, seed);
};

const brickMatchesTheme = (brick: LexiconBrickRecord, themeTag: string): boolean => {
  if (themeTag === 'any') return true;
  return brick.themeTags.includes(themeTag);
};

export const LexiconBrickService = {
  initListeners(): void {
    if (listenersInitialized) return;
    listenersInitialized = true;

    GameEvents.subscribe((event: GameEvent) => {
      if (event.type === 'WORDS_LEARNED') {
        void LexiconBrickService.mintFromWordsLearned(event.amount, 'farm', event.words);
      }
    });
  },

  async initialize(): Promise<void> {
    await LexiconBrickService.tickDecay();
  },

  async tickDecay(): Promise<number> {
    const now = Date.now();
    let crackedEmitted = 0;
    const bricks = await LexiconBrickRepository.listAll();
    const masteries = await LemmaMasteryRepository.listAll();

    for (const brick of bricks) {
      if (new Date(brick.nextReviewAt).getTime() > now) continue;

      const nextStage = Math.min(BRICK_DECAY_BLANK_STAGE, brick.decayStage + 1);
      const updated: LexiconBrickRecord = {
        ...brick,
        decayStage: nextStage,
        nextReviewAt: addDaysIso(1),
      };
      await LexiconBrickRepository.upsert(updated);

      if (nextStage >= BRICK_DECAY_CRACKED_STAGE && brick.decayStage < BRICK_DECAY_CRACKED_STAGE) {
        crackedEmitted += 1;
        GameEvents.emit({
          type: 'LEXICON_BRICK_CRACKED',
          brickId: brick.brickId,
          lemmaId: brick.lemmaId,
          lemma: brick.lemma,
          decayStage: nextStage,
        });
      }
    }

    for (const mastery of masteries) {
      if (new Date(mastery.nextReviewAt).getTime() > now) continue;

      const nextStage = Math.min(BRICK_DECAY_BLANK_STAGE, mastery.decayStage + 1);
      await LemmaMasteryRepository.upsert({
        ...mastery,
        decayStage: nextStage,
        nextReviewAt: addDaysIso(1),
      });
    }

    return crackedEmitted;
  },

  async mintFromWordsLearned(
    amount: number,
    source: 'farm' | 'speaking',
    learnedWords?: {
      term: string;
      translation: string;
      sourcePackKey?: string;
      themeTags?: string[];
    }[],
  ): Promise<number> {
    if (amount <= 0) return 0;

    const seed = `mint-${getTodayKey()}-${amount}-${mintSessionCounter}`;
    const sessionEntries =
      learnedWords?.map((word): LemmaPoolEntry => ({
        lemmaId: toLemmaId(word.term),
        lemma: normalizeToken(word.term),
        translation: word.translation.trim(),
        themeTags: word.themeTags?.length ? word.themeTags : ['any'],
      })) ?? [];

    const picks =
      sessionEntries.length > 0
        ? sessionEntries.slice(0, amount)
        : pickLemmasForMint(amount, seed);
    let minted = 0;

    const activeEvent = CityEventScheduler.getActiveMajorEvent();
    const eventTags = activeEvent ? [`event:${activeEvent.eventKey}`] : [];

    for (const entry of picks) {
      const created = await LexiconBrickService.mintLemma(entry, source, eventTags);
      if (created) minted += 1;
    }

    return minted;
  },

  async mintLemma(
    entry: LemmaPoolEntry,
    source: 'farm' | 'speaking' | 'event_pack' | 'chain_reward',
    extraThemeTags: string[] = [],
  ): Promise<LexiconBrickRecord | null> {
    const existing = await LemmaMasteryRepository.findById(entry.lemmaId);
    const now = new Date().toISOString();

    if (
      existing &&
      existing.recognitionScore >= MASTERY_REINFORCE_THRESHOLD &&
      existing.productionScore >= MASTERY_REINFORCE_THRESHOLD
    ) {
      await LemmaMasteryRepository.upsert({
        ...existing,
        recognitionScore: Math.min(100, existing.recognitionScore + 4),
        productionScore: Math.min(100, existing.productionScore + 3),
        lastReviewAt: now,
        nextReviewAt: nextReviewAfterSuccess(existing.decayStage),
        decayStage: 0,
      });
      return null;
    }

    const mergedThemeTags = Array.from(new Set([...entry.themeTags, ...extraThemeTags]));

    const brick: LexiconBrickRecord = {
      brickId: buildBrickId(entry.lemmaId),
      lemmaId: entry.lemmaId,
      lemma: entry.lemma,
      translation: entry.translation,
      themeTags: mergedThemeTags,
      source,
      mintedAt: now,
      lastReviewAt: now,
      nextReviewAt: nextReviewAfterSuccess(0),
      decayStage: 0,
      placedPoiKey: null,
      placedProjectKey: null,
      placedAt: null,
    };

    await LexiconBrickRepository.upsert(brick);

    await LemmaMasteryRepository.upsert({
      lemmaId: entry.lemmaId,
      lemma: entry.lemma,
      translation: entry.translation,
      recognitionScore: MINT_RECOGNITION_BONUS,
      productionScore: 0,
      lastReviewAt: now,
      nextReviewAt: brick.nextReviewAt,
      decayStage: 0,
      themeTags: mergedThemeTags,
      contextsSeen: [],
    });

    GameEvents.emit({
      type: 'LEXICON_BRICK_MINTED',
      brickId: brick.brickId,
      lemmaId: brick.lemmaId,
      lemma: brick.lemma,
      themeTags: brick.themeTags,
      source,
    });

    return brick;
  },

  async getInventorySummary(): Promise<{
    unplacedTotal: number;
    crackedTotal: number;
    byTheme: Record<string, number>;
  }> {
    const bricks = await LexiconBrickRepository.listUnplaced();
    const byTheme: Record<string, number> = {};
    let crackedTotal = 0;

    for (const brick of bricks) {
      if (brick.decayStage >= BRICK_DECAY_CRACKED_STAGE) crackedTotal += 1;

      const themes = brick.themeTags.length > 0 ? brick.themeTags : ['any'];
      for (const tag of themes) {
        byTheme[tag] = (byTheme[tag] ?? 0) + 1;
      }
      byTheme.any = (byTheme.any ?? 0) + 1;
    }

    return {
      unplacedTotal: bricks.length,
      crackedTotal,
      byTheme,
    };
  },

  brickMatchesTheme,

  async repairBrick(brickId: string, chosenLemma: string): Promise<{
    ok: boolean;
    reason?: 'not_found' | 'not_cracked' | 'wrong_answer';
  }> {
    const brick = await LexiconBrickRepository.findById(brickId);
    if (!brick) return { ok: false, reason: 'not_found' };
    if (brick.decayStage < BRICK_DECAY_CRACKED_STAGE) {
      return { ok: false, reason: 'not_cracked' };
    }

    if (chosenLemma.toLowerCase() !== brick.lemma.toLowerCase()) {
      return { ok: false, reason: 'wrong_answer' };
    }

    const now = new Date().toISOString();
    const repaired: LexiconBrickRecord = {
      ...brick,
      decayStage: 0,
      lastReviewAt: now,
      nextReviewAt: nextReviewAfterSuccess(0),
    };
    await LexiconBrickRepository.upsert(repaired);

    const mastery = await LemmaMasteryRepository.findById(brick.lemmaId);
    if (mastery) {
      await LemmaMasteryRepository.upsert({
        ...mastery,
        recognitionScore: Math.min(100, mastery.recognitionScore + REPAIR_RECOGNITION_BONUS),
        productionScore: Math.min(100, mastery.productionScore + REPAIR_PRODUCTION_BONUS),
        lastReviewAt: now,
        nextReviewAt: repaired.nextReviewAt,
        decayStage: 0,
      });
    }

    GameEvents.emit({
      type: 'LEXICON_BRICK_REPAIRED',
      brickId: brick.brickId,
      lemmaId: brick.lemmaId,
      lemma: brick.lemma,
    });

    return { ok: true };
  },

  buildRepairChoices(correctLemma: string, count = 4): string[] {
    const distractors = pickDeterministicSubset(
      LEMMA_POOL.filter((e) => e.lemma !== correctLemma).map((e) => e.lemma),
      count - 1,
      `repair-${correctLemma}`,
    );
    const choices = [correctLemma, ...distractors];
    return pickDeterministicSubset(choices, choices.length, `repair-shuffle-${correctLemma}`);
  },
};
