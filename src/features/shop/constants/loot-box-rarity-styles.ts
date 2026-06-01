import { theme } from '@/constants/theme';
import { LootBoxRarity, type LootBoxRarityValue } from '@/types/inventory';

export type LootBoxRarityBadgeStyle = {
  color: string;
  borderColor: string;
  backgroundColor: string;
};

export type LootBoxRarityStyle = {
  barClassName: string;
  badge: LootBoxRarityBadgeStyle;
  label: string;
};

export const LOOT_BOX_RARITY_STYLES: Record<LootBoxRarityValue, LootBoxRarityStyle> = {
  [LootBoxRarity.COMMON]: {
    barClassName: 'bg-muted',
    badge: {
      color: theme.colors.foreground,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceElevated,
    },
    label: 'Comum',
  },
  [LootBoxRarity.UNCOMMON]: {
    barClassName: 'bg-success/70',
    badge: {
      color: theme.colors.success,
      borderColor: 'rgba(34, 197, 94, 0.45)',
      backgroundColor: 'rgba(34, 197, 94, 0.15)',
    },
    label: 'Incomum',
  },
  [LootBoxRarity.RARE]: {
    barClassName: 'bg-primary',
    badge: {
      color: theme.colors.primary,
      borderColor: 'rgba(139, 92, 246, 0.45)',
      backgroundColor: 'rgba(139, 92, 246, 0.15)',
    },
    label: 'Rara',
  },
  [LootBoxRarity.EPIC]: {
    barClassName: 'bg-legendary',
    badge: {
      color: theme.colors.legendary,
      borderColor: 'rgba(244, 114, 182, 0.45)',
      backgroundColor: 'rgba(244, 114, 182, 0.15)',
    },
    label: 'Épica',
  },
  [LootBoxRarity.LEGENDARY]: {
    barClassName: 'bg-gold',
    badge: {
      color: theme.colors.gold,
      borderColor: 'rgba(251, 191, 36, 0.45)',
      backgroundColor: 'rgba(251, 191, 36, 0.15)',
    },
    label: 'Lendária',
  },
  [LootBoxRarity.MYTHIC]: {
    barClassName: 'bg-accent',
    badge: {
      color: theme.colors.accent,
      borderColor: 'rgba(56, 189, 248, 0.45)',
      backgroundColor: 'rgba(56, 189, 248, 0.15)',
    },
    label: 'Mítica',
  },
  [LootBoxRarity.ANCIENT]: {
    barClassName: 'bg-danger',
    badge: {
      color: theme.colors.danger,
      borderColor: 'rgba(239, 68, 68, 0.45)',
      backgroundColor: 'rgba(239, 68, 68, 0.15)',
    },
    label: 'Ancestral',
  },
};

/** Accent bar color for upgrade cards (avoids dynamic Tailwind class names). */
export const getRarityAccentBarColor = (rarity: LootBoxRarityValue): string =>
  LOOT_BOX_RARITY_STYLES[rarity]?.badge.color ?? theme.colors.accent;
