import {
  InventoryCategory,
  LootBoxRarity,
  type InventoryAcquisitionSource,
  type InventoryCategoryValue,
  type LootBoxRarityValue,
} from '@/types/inventory';

export const LOOT_BOX_RARITY_CONFIG: Record<
  LootBoxRarityValue,
  {
    label: string;
    emoji: string;
    colorClass: string;
    slotBorderClass: string;
    slotGlowClass: string;
  }
> = {
  [LootBoxRarity.COMMON]: {
    label: 'Comum',
    emoji: '📦',
    colorClass: 'text-muted',
    slotBorderClass: 'border-muted/40 bg-muted/5',
    slotGlowClass: 'shadow-muted/20',
  },
  [LootBoxRarity.UNCOMMON]: {
    label: 'Incomum',
    emoji: '🎁',
    colorClass: 'text-success',
    slotBorderClass: 'border-success/35 bg-success/5',
    slotGlowClass: 'shadow-success/20',
  },
  [LootBoxRarity.RARE]: {
    label: 'Rara',
    emoji: '🎁',
    colorClass: 'text-accent',
    slotBorderClass: 'border-accent/40 bg-accent/5',
    slotGlowClass: 'shadow-accent/25',
  },
  [LootBoxRarity.EPIC]: {
    label: 'Épica',
    emoji: '💎',
    colorClass: 'text-primary',
    slotBorderClass: 'border-primary/45 bg-primary/8',
    slotGlowClass: 'shadow-primary/30',
  },
  [LootBoxRarity.LEGENDARY]: {
    label: 'Lendária',
    emoji: '👑',
    colorClass: 'text-warning',
    slotBorderClass: 'border-warning/45 bg-warning/8',
    slotGlowClass: 'shadow-warning/30',
  },
  [LootBoxRarity.MYTHIC]: {
    label: 'Mítica',
    emoji: '✨',
    colorClass: 'text-gold',
    slotBorderClass: 'border-gold/45 bg-gold/8',
    slotGlowClass: 'shadow-gold/30',
  },
  [LootBoxRarity.ANCIENT]: {
    label: 'Ancestral',
    emoji: '🔥',
    colorClass: 'text-danger',
    slotBorderClass: 'border-danger/45 bg-danger/8',
    slotGlowClass: 'shadow-danger/30',
  },
};

export const LOOT_BOX_RARITY_ORDER: LootBoxRarityValue[] = [
  LootBoxRarity.ANCIENT,
  LootBoxRarity.MYTHIC,
  LootBoxRarity.LEGENDARY,
  LootBoxRarity.EPIC,
  LootBoxRarity.RARE,
  LootBoxRarity.UNCOMMON,
  LootBoxRarity.COMMON,
];

export const INVENTORY_CATEGORY_LABELS: Record<InventoryCategoryValue, string> = {
  [InventoryCategory.SHIELD]: 'Escudos',
  [InventoryCategory.LOOT_BOX]: 'Loot Boxes',
  [InventoryCategory.PET]: 'Pet',
  [InventoryCategory.SPECIAL]: 'Itens Especiais',
};

export const INVENTORY_MESSAGES = {
  shieldEarned: (amount: number) =>
    amount === 1 ? 'Escudo conquistado' : `${amount} escudos conquistados`,
  shieldUsed: (count: number) =>
    count === 1 ? 'Escudo utilizado' : `${count} escudos utilizados`,
  lootBoxReceived: (rarity: LootBoxRarityValue) => {
    const label = LOOT_BOX_RARITY_CONFIG[rarity].label;
    return `Loot Box ${label} recebida`;
  },
  petEvolved: (stageLabel: string) => `Pet evoluiu para ${stageLabel}`,
  specialItemReceived: (itemKey: string) => `Item especial recebido: ${itemKey}`,
} as const;

export type { InventoryAcquisitionSource };
