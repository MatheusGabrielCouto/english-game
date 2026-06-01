import { useMemo } from 'react';
import { Text, View } from 'react-native';

import { ProgressBar } from '@/components';
import { GameCard } from '@/components/ui/game';
import { COLLECTIBLE_BY_KEY } from '@/features/game-design/catalogs/collectible-catalog';
import { useCollectionBookStore } from '@/features/collection-book/store/collection-book-store';
import { useWishlistStore } from '@/features/wishlist/store/wishlist-store';
import { cn } from '@/utils';

import { WishlistToggleButton } from './WishlistToggleButton';

export const WishlistSection = () => {
  const entries = useWishlistStore((s) => s.entries);
  const collectionEntries = useCollectionBookStore((s) => s.entries);
  const discoveredKeys = useMemo(
    () => new Set(collectionEntries.map((entry) => entry.itemKey)),
    [collectionEntries],
  );
  const obtainedCount = entries.filter((entry) => discoveredKeys.has(entry.itemKey)).length;
  const progress = entries.length > 0 ? Math.round((obtainedCount / entries.length) * 100) : 0;

  if (entries.length === 0) return null;

  return (
    <GameCard variant="quest" className="gap-4 p-4">
      <Text className="text-xs font-bold uppercase tracking-widest text-accent">⭐ Lista de desejos</Text>
      <Text className="text-sm leading-5 text-foreground-secondary">
        Objetivos de longo prazo — {obtainedCount}/{entries.length} conquistados
      </Text>

      <View className="gap-1.5">
        <View className="flex-row items-center justify-between gap-2">
          <Text className="text-xs font-semibold text-muted">Progresso</Text>
          <Text className="shrink-0 text-xs font-bold text-primary">{progress}%</Text>
        </View>
        <ProgressBar value={progress} variant="xp" height="sm" />
      </View>

      <View className="gap-2">
        {entries.map((entry) => {
          const item = COLLECTIBLE_BY_KEY[entry.itemKey];
          if (!item) return null;
          const discovered = discoveredKeys.has(entry.itemKey);

          return (
            <View
              key={entry.itemKey}
              className={cn(
                'flex-row items-center gap-3 rounded-xl border px-3 py-3',
                discovered ? 'border-success/30 bg-success/10' : 'border-border bg-surface',
              )}>
              <Text className="text-2xl">{discovered ? item.icon : '❓'}</Text>
              <View className="min-w-0 flex-1">
                <Text className="text-sm font-bold text-foreground" numberOfLines={2}>
                  {discovered ? item.name : 'Item secreto'}
                </Text>
                <Text className="text-xs text-muted">{discovered ? 'Obtido ✓' : 'Não obtido'}</Text>
              </View>
              <WishlistToggleButton itemKey={entry.itemKey} />
            </View>
          );
        })}
      </View>
    </GameCard>
  );
};
