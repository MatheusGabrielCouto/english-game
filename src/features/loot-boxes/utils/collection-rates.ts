import { COLLECTIBLES_BY_CATEGORY } from '@/features/game-design/catalogs/collectible-catalog';
import type { CollectibleCategoryValue } from '@/types/collectible';

export type CollectionRateRow = {
  key: CollectibleCategoryValue;
  label: string;
  emoji: string;
  discovered: number;
  total: number;
};

const RATE_LABELS: Record<CollectibleCategoryValue, { label: string; emoji: string }> = {
  relic: { label: 'Relíquias', emoji: '📕' },
  artifact: { label: 'Artefatos', emoji: '🔮' },
  mythic: { label: 'Itens Míticos', emoji: '⚔️' },
  cosmetic: { label: 'Cosméticos', emoji: '🎨' },
  pet_exclusive: { label: 'Pets', emoji: '🐾' },
  ultra_rare: { label: 'Ultra Raros', emoji: '👑' },
};

export const buildCollectionRates = (
  discoveredKeys: Set<string>,
): CollectionRateRow[] =>
  (Object.keys(COLLECTIBLES_BY_CATEGORY) as CollectibleCategoryValue[]).map((key) => {
    const catalog = COLLECTIBLES_BY_CATEGORY[key];
    const meta = RATE_LABELS[key];
    const discovered = catalog.filter((item) => discoveredKeys.has(item.key)).length;
    return {
      key,
      label: meta.label,
      emoji: meta.emoji,
      discovered,
      total: catalog.length,
    };
  });
