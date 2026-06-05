import type { PetFarmFieldKey } from '@/types/pet-instance';

export type PetFarmFieldDef = {
  key: PetFarmFieldKey;
  label: string;
  description: string;
  initialLevel: number;
  maxLevel: number;
  costCoins: (nextLevel: number) => number;
};

export const PET_FARM_FIELDS: PetFarmFieldDef[] = [
  {
    key: 'passive_pasture',
    label: 'Pasto de passivas',
    description: 'Slots para pets ativarem bônus na fazenda.',
    initialLevel: 1,
    maxLevel: 8,
    costCoins: (level) => 300 * level * level,
  },
  {
    key: 'breeding_pen',
    label: 'Cercado de cruzamento',
    description: 'Casais simultâneos no laboratório.',
    initialLevel: 1,
    maxLevel: 3,
    costCoins: (level) => 500 * level * level,
  },
  {
    key: 'incubator_room',
    label: 'Incubadora',
    description: 'Fila de ovos em desenvolvimento.',
    initialLevel: 2,
    maxLevel: 6,
    costCoins: (level) => 250 * level,
  },
  {
    key: 'barn_storage',
    label: 'Celeiro',
    description: 'Capacidade de pets guardados.',
    initialLevel: 12,
    maxLevel: 50,
    costCoins: (level) => 150 * level,
  },
];

export const PET_FARM_PASSIVE_CAPS = {
  xp_boost: 18,
  coin_boost: 18,
  loot_luck: 12,
  shield_weekly: 2,
} as const;

export const slotEfficiencyForFieldLevel = (passivePastureLevel: number): number =>
  Math.min(0.85, 0.5 + (passivePastureLevel - 1) * 0.05);

export const BREEDING_COOLDOWN_HOURS = 72;

export const BREEDING_COST_COINS: Record<string, number> = {
  common: 150,
  rare: 400,
  epic: 900,
  legendary: 2000,
};
