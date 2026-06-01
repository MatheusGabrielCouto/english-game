import { Text, View } from 'react-native';

import { PressableScale } from '@/components/ui/game/PressableScale';
import { cn } from '@/utils';

import { FLASH_DECK_UI } from '../constants/flash-deck-ui';
import type { FlashDeckListItem } from '../services/flash-deck-service';

type FlashDeckListTileProps = {
  deck: FlashDeckListItem;
  onPress: () => void;
};

export const FlashDeckListTile = ({ deck, onPress }: FlashDeckListTileProps) => (
  <PressableScale onPress={onPress} fill>
    <View
      className={cn(
        'flex-row items-center gap-3 rounded-2xl border-2 px-4 py-3.5',
        deck.dueCount > 0
          ? 'border-accent/45 bg-accent/10'
          : 'border-border bg-surface-elevated',
      )}>
      <View className="h-12 w-12 items-center justify-center rounded-xl border border-border/60 bg-background/50">
        <Text className="text-2xl">{deck.coverEmoji ?? FLASH_DECK_UI.emoji}</Text>
      </View>
      <View className="min-w-0 flex-1">
        <Text className="text-base font-black text-foreground" numberOfLines={1}>
          {deck.name}
        </Text>
        {deck.description ? (
          <Text className="mt-0.5 text-xs text-foreground-secondary" numberOfLines={2}>
            {deck.description}
          </Text>
        ) : null}
        <Text className="mt-1 text-[10px] font-bold uppercase tracking-wide text-muted">
          {FLASH_DECK_UI.cardsInDeck(deck.totalCards)} · {FLASH_DECK_UI.deckDueBadge(deck.dueCount)}
        </Text>
      </View>
      {deck.dueCount > 0 ? (
        <View className="min-w-[2.5rem] items-center rounded-full border-2 border-accent bg-accent/20 px-2.5 py-1.5">
          <Text className="text-sm font-black text-accent">{deck.dueCount}</Text>
        </View>
      ) : (
        <Text className="text-lg text-muted">›</Text>
      )}
    </View>
  </PressableScale>
);
