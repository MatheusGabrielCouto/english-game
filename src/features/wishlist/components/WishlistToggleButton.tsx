import { Text, View } from 'react-native';

import { PressableScale } from '@/components/ui/game';
import { TOUCH_TARGET_MIN_CLASS } from '@/constants/touch-target-ui';
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
        'items-center justify-center rounded-full border',
        TOUCH_TARGET_MIN_CLASS,
        isWishlisted ? 'border-gold/50 bg-gold/20' : 'border-border bg-surface',
        size === 'sm' ? 'px-2' : 'px-3',
      )}>
      <Text className={cn('text-center', size === 'sm' ? 'text-[10px]' : 'text-xs')}>
        {isWishlisted ? '⭐' : '☆'}
      </Text>
    </PressableScale>
  );
};
