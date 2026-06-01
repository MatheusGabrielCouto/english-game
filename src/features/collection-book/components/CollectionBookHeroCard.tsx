import { Text, View } from 'react-native';

import { ProgressBar } from '@/components';
import { GameCard } from '@/components/ui/game';
import { COLLECTIBLE_CATALOG_STATS } from '@/features/game-design/catalogs/collectible-catalog';

import { COLLECTION_BOOK_UI } from '../constants/collection-book-ui';

type CollectionBookHeroCardProps = {
  overallPercentage: number;
  discoveredCount: number;
};

export const CollectionBookHeroCard = ({
  overallPercentage,
  discoveredCount,
}: CollectionBookHeroCardProps) => (
  <GameCard variant="reward" glow className="gap-4 p-4">
    <Text className="text-xs font-bold uppercase tracking-widest text-gold">
      📖 {COLLECTION_BOOK_UI.heroTitle}
    </Text>

    <Text className="text-sm leading-5 text-foreground-secondary">{COLLECTION_BOOK_UI.heroSubtitle}</Text>

    <View className="flex-row items-end gap-4">
      <View className="min-w-0 flex-1">
        <Text className="text-3xl font-black text-foreground">{overallPercentage}%</Text>
        <Text className="mt-1 text-sm text-foreground-secondary">
          {discoveredCount} / {COLLECTIBLE_CATALOG_STATS.total} {COLLECTION_BOOK_UI.discoveredLabel}
        </Text>
      </View>
      <View className="shrink-0 rounded-2xl border border-gold/35 bg-gold/10 px-4 py-3">
        <Text className="text-center text-[10px] font-bold text-muted">Total</Text>
        <Text className="text-center text-lg font-black text-gold">{COLLECTIBLE_CATALOG_STATS.total}</Text>
      </View>
    </View>

    <View className="gap-1.5">
      <View className="flex-row items-center justify-between gap-2">
        <Text className="text-xs font-semibold text-muted">Coleção global</Text>
        <Text className="shrink-0 text-xs font-bold text-gold">{overallPercentage}%</Text>
      </View>
      <ProgressBar value={overallPercentage} variant="gold" height="sm" />
    </View>
  </GameCard>
);
