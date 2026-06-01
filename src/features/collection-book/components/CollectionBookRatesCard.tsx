import { Text, View } from 'react-native';

import { GameCard } from '@/components/ui/game';
import type { CollectionRateRow } from '@/features/loot-boxes/utils/collection-rates';

import { COLLECTION_BOOK_UI } from '../constants/collection-book-ui';

type CollectionBookRatesCardProps = {
  rates: CollectionRateRow[];
};

export const CollectionBookRatesCard = ({ rates }: CollectionBookRatesCardProps) => (
  <GameCard variant="default" className="gap-3 p-4">
    <Text className="text-xs font-bold uppercase tracking-wide text-muted">
      {COLLECTION_BOOK_UI.ratesTitle}
    </Text>
    <View className="gap-2">
      {rates.map((row) => (
        <View
          key={row.key}
          className="flex-row items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2.5">
          <Text className="text-lg">{row.emoji}</Text>
          <Text className="min-w-0 flex-1 text-sm text-foreground-secondary">{row.label}</Text>
          <Text className="shrink-0 text-sm font-black text-foreground">
            {row.discovered} / {row.total}
          </Text>
        </View>
      ))}
    </View>
  </GameCard>
);
