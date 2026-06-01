import { Pressable, Text, View } from 'react-native';

import type { FlashSrsRating } from '@/types/flash-card';
import { cn } from '@/utils';

import { FLASH_DECK_UI } from '../constants/flash-deck-ui';

type SrsButtonRowProps = {
  onHard: () => void;
  onEasy: () => void;
  disabled?: boolean;
  loadingRating?: FlashSrsRating | null;
};

export const SrsButtonRow = ({
  onHard,
  onEasy,
  disabled = false,
  loadingRating = null,
}: SrsButtonRowProps) => {
  const isBusy = loadingRating !== null;

  return (
    <View className="gap-2">
      <Text className="text-center text-[10px] font-bold uppercase tracking-widest text-muted">
        {FLASH_DECK_UI.swipeOrButtons}
      </Text>
      <View className="flex-row gap-3">
        <Pressable
          onPress={onHard}
          disabled={disabled || (isBusy && loadingRating !== 'hard')}
          accessibilityRole="button"
          accessibilityLabel={FLASH_DECK_UI.hardLabel}
          className={cn(
            'flex-1 items-center rounded-xl border-2 border-warning/50 bg-warning/10 px-3 py-3 active:opacity-80',
            (disabled || (isBusy && loadingRating !== 'hard')) && 'opacity-50',
          )}>
          <Text className="text-lg">😐</Text>
          <Text className="mt-1 text-sm font-black text-warning">{FLASH_DECK_UI.hardLabel}</Text>
          <Text className="text-[10px] text-muted">{FLASH_DECK_UI.hardHint}</Text>
        </Pressable>
        <Pressable
          onPress={onEasy}
          disabled={disabled || (isBusy && loadingRating !== 'easy')}
          accessibilityRole="button"
          accessibilityLabel={FLASH_DECK_UI.easyLabel}
          className={cn(
            'flex-1 items-center rounded-xl border-2 border-success/50 bg-success/10 px-3 py-3 active:opacity-80',
            (disabled || (isBusy && loadingRating !== 'easy')) && 'opacity-50',
          )}>
          <Text className="text-lg">🔥</Text>
          <Text className="mt-1 text-sm font-black text-success">{FLASH_DECK_UI.easyLabel}</Text>
          <Text className="text-[10px] text-muted">{FLASH_DECK_UI.easyHint}</Text>
        </Pressable>
      </View>
    </View>
  );
};
