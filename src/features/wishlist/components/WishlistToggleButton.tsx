import { Text, View } from 'react-native';

import { PressableScale } from '@/components/ui/game';
import { COLLECTIBLE_BY_KEY } from '@/features/game-design/catalogs/collectible-catalog';
import { WishlistService } from '@/features/wishlist/services/wishlist-service';
import { useWishlistStore } from '@/features/wishlist/store/wishlist-store';
import { cn } from '@/utils';

type WishlistToggleButtonProps = {
  itemKey: string;
  size?: 'sm' | 'md';
};

export const WishlistToggleButton = ({ itemKey, size = 'md' }: WishlistToggleButtonProps) => {
  const isWishlisted = useWishlistStore((s) => s.wishlistedKeys.has(itemKey));
  const item = COLLECTIBLE_BY_KEY[itemKey];
  if (!item) return null;

  const handleToggle = () => {
    void WishlistService.toggle(itemKey);
  };

  return (
    <PressableScale
      onPress={handleToggle}
      accessibilityRole="button"
      accessibilityLabel={isWishlisted ? `Remover ${item.name} da wishlist` : `Adicionar ${item.name} à wishlist`}
      className={cn(
        'rounded-full border px-2 py-0.5',
        isWishlisted ? 'border-gold/50 bg-gold/20' : 'border-border bg-surface',
        size === 'sm' ? 'px-1.5' : 'px-2',
      )}>
      <Text className={cn('text-center', size === 'sm' ? 'text-[10px]' : 'text-xs')}>
        {isWishlisted ? '⭐' : '☆'}
      </Text>
    </PressableScale>
  );
};
