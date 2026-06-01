import { Text, View } from 'react-native';

import { GameCard } from '@/components/ui/game';
import { WishlistToggleButton } from '@/features/wishlist/components/WishlistToggleButton';
import type { CollectibleDefinition } from '@/types/collectible';
import { cn } from '@/utils';

type CollectionBookItemRowProps = {
  item: CollectibleDefinition;
  discovered: boolean;
};

export const CollectionBookItemRow = ({ item, discovered }: CollectionBookItemRowProps) => (
  <GameCard
    variant={discovered ? 'reward' : 'default'}
    className={cn('flex-row items-start gap-3 p-4', !discovered && 'opacity-75')}>
    <View className="h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-elevated">
      <Text className="text-2xl">{discovered ? item.icon : '❓'}</Text>
    </View>

    <View className="min-w-0 flex-1 gap-1">
      <Text className="text-sm font-bold text-foreground" numberOfLines={2}>
        {discovered ? item.name : '???'}
      </Text>
      <Text className="text-[10px] font-bold uppercase text-muted">{item.rarity}</Text>
      {discovered ? (
        <Text className="text-xs leading-4 text-foreground-secondary" numberOfLines={3}>
          {item.description}
        </Text>
      ) : (
        <Text className="text-xs text-muted">Ainda não descoberto</Text>
      )}
      {discovered && item.passiveBonus ? (
        <Text className="text-xs font-semibold text-accent" numberOfLines={2}>
          {item.passiveBonus}
        </Text>
      ) : null}
    </View>

    <View className="shrink-0 pt-1">
      <WishlistToggleButton itemKey={item.key} size="sm" />
    </View>
  </GameCard>
);
