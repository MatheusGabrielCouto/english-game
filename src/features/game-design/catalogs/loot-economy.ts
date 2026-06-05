import { CollectibleRarity } from '@/types/collectible';
import { LootBoxRarity } from '@/types/inventory';

/** Study Points exchange rates (espelha farm-catalog) */
export const STUDY_POINTS_RATES = {
  WORD_LEARNED: 3,
  MINUTE_READING: 5,
  MINUTE_LISTENING: 5,
  MINUTE_SPEAKING: 8,
  MINUTE_PROGRAMMING: 5,
  EXERCISE_CORRECT: 3,
  REVIEW_COMPLETED: 2,
} as const;

/** Loot box upgrade chain: combine lower → higher */
export const LOOT_BOX_UPGRADE_CHAIN: { from: string; to: string; costStudyPoints: number }[] = [
  { from: LootBoxRarity.COMMON, to: LootBoxRarity.UNCOMMON, costStudyPoints: 50 },
  { from: LootBoxRarity.UNCOMMON, to: LootBoxRarity.RARE, costStudyPoints: 120 },
  { from: LootBoxRarity.RARE, to: LootBoxRarity.EPIC, costStudyPoints: 250 },
  { from: LootBoxRarity.EPIC, to: LootBoxRarity.LEGENDARY, costStudyPoints: 500 },
  { from: LootBoxRarity.LEGENDARY, to: LootBoxRarity.MYTHIC, costStudyPoints: 1000 },
  { from: LootBoxRarity.MYTHIC, to: LootBoxRarity.ANCIENT, costStudyPoints: 2500 },
];

export const STUDY_POINTS_SHOP = [
  { key: 'box_common', label: 'Loot Box Comum', cost: 120, lootRarity: LootBoxRarity.COMMON },
  { key: 'box_uncommon', label: 'Loot Box Incomum', cost: 240, lootRarity: LootBoxRarity.UNCOMMON },
  { key: 'box_rare', label: 'Loot Box Rara', cost: 480, lootRarity: LootBoxRarity.RARE },
  { key: 'box_epic', label: 'Loot Box Épica', cost: 960, lootRarity: LootBoxRarity.EPIC },
  { key: 'pet_egg', label: 'Ovo de Pet', cost: 3200, itemKey: 'pet_egg' },
  { key: 'golden_ticket', label: 'Ticket Dourado', cost: 380, itemKey: 'golden_ticket' },
  { key: 'free_loot_ticket', label: 'Ticket de Loot', cost: 220, itemKey: 'free_loot_ticket' },
] as const;

/** Drop weights for collectible rarity inside a loot box tier */
export const LOOT_RARITY_DROP_WEIGHTS: Record<string, Record<string, number>> = {
  [LootBoxRarity.COMMON]: {
    [CollectibleRarity.COMMON]: 70,
    [CollectibleRarity.UNCOMMON]: 25,
    [CollectibleRarity.RARE]: 5,
  },
  [LootBoxRarity.UNCOMMON]: {
    [CollectibleRarity.COMMON]: 40,
    [CollectibleRarity.UNCOMMON]: 40,
    [CollectibleRarity.RARE]: 18,
    [CollectibleRarity.EPIC]: 2,
  },
  [LootBoxRarity.RARE]: {
    [CollectibleRarity.UNCOMMON]: 35,
    [CollectibleRarity.RARE]: 40,
    [CollectibleRarity.EPIC]: 20,
    [CollectibleRarity.LEGENDARY]: 5,
  },
  [LootBoxRarity.EPIC]: {
    [CollectibleRarity.RARE]: 30,
    [CollectibleRarity.EPIC]: 40,
    [CollectibleRarity.LEGENDARY]: 25,
    [CollectibleRarity.MYTHIC]: 5,
  },
  [LootBoxRarity.LEGENDARY]: {
    [CollectibleRarity.EPIC]: 25,
    [CollectibleRarity.LEGENDARY]: 45,
    [CollectibleRarity.MYTHIC]: 25,
    [CollectibleRarity.ANCIENT]: 5,
  },
  [LootBoxRarity.MYTHIC]: {
    [CollectibleRarity.LEGENDARY]: 30,
    [CollectibleRarity.MYTHIC]: 45,
    [CollectibleRarity.ANCIENT]: 25,
  },
  [LootBoxRarity.ANCIENT]: {
    [CollectibleRarity.MYTHIC]: 35,
    [CollectibleRarity.ANCIENT]: 65,
  },
};

export const LOOT_BOX_LABELS: Record<string, string> = {
  [LootBoxRarity.COMMON]: 'Comum',
  [LootBoxRarity.UNCOMMON]: 'Incomum',
  [LootBoxRarity.RARE]: 'Rara',
  [LootBoxRarity.EPIC]: 'Épica',
  [LootBoxRarity.LEGENDARY]: 'Lendária',
  [LootBoxRarity.MYTHIC]: 'Mítica',
  [LootBoxRarity.ANCIENT]: 'Ancestral',
};

export const LOOT_BOX_EARN_SOURCES = {
  DAILY_MISSION: 'Complete missões diárias',
  WEEKLY_MISSION: 'Reivindique missões semanais',
  STREAK_MILESTONE: 'Alcance marcos de streak',
  ACHIEVEMENT: 'Desbloqueie conquistas',
  CONTRACT: 'Complete contratos',
  STUDY_POINTS: 'Troque Study Points na loja',
  FARM_BONUS: 'Bônus por farm intensivo',
  PRESTIGE: 'Recompensa de prestígio',
} as const;

export const PRESTIGE_MILESTONES = [
  { level: 50, name: 'Rising Star', rewardLabel: 'Moldura rara + 200 moedas', frame: 'rare' },
  { level: 100, name: 'Global Graduate', rewardLabel: 'Moldura lendária + relíquia', frame: 'legendary' },
  { level: 250, name: 'World Mentor', rewardLabel: 'Pet exclusivo + loot mítica', frame: 'mythic' },
  { level: 500, name: 'Legacy Builder', rewardLabel: 'Relíquia ancestral + título', frame: 'ancient' },
] as const;
