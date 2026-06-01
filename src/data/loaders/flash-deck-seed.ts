import english1000Json from '../flash-deck-seeds/english-1000.json';
import interviewTechJson from '../flash-deck-seeds/interview-tech.json';

export type FlashDeckSeedCard = {
  rank: number;
  front: string;
  back: string;
  lemma: string;
  tags: string[];
  exampleSentence?: string;
};

export type FlashDeckSeedPack = {
  version: number;
  deckId: string;
  name: string;
  description: string;
  coverEmoji: string;
  newPerDay?: number;
  cards: FlashDeckSeedCard[];
};

export const ENGLISH_1000_FLASH_PACK = english1000Json as FlashDeckSeedPack;

export const INTERVIEW_TECH_FLASH_PACK = interviewTechJson as FlashDeckSeedPack;

export const getEnglish1000FlashPack = (): FlashDeckSeedPack => ENGLISH_1000_FLASH_PACK;

export const getInterviewTechFlashPack = (): FlashDeckSeedPack => INTERVIEW_TECH_FLASH_PACK;
