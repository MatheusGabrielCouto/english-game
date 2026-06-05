import { router } from 'expo-router'
import { Pressable, Text, View } from 'react-native'

import type { FlashCardRecord } from '@/types/flash-card'

import { flashDeckRoutes } from '../utils/flash-deck-routes'
import { FlashCardStateBadge } from './FlashCardStateBadge'

type FlashDeckCardRowProps = {
  card: FlashCardRecord
}

export const FlashDeckCardRow = ({ card }: FlashDeckCardRowProps) => (
  <Pressable
    onPress={() => router.push(flashDeckRoutes.card(card.id))}
    accessibilityRole="button"
    className="rounded-2xl border border-border bg-surface px-4 py-3 active:opacity-80">
    <View className="flex-row items-start justify-between gap-2">
      <View className="min-w-0 flex-1">
        <Text className="text-base font-bold text-foreground" numberOfLines={1}>
          {card.front}
        </Text>
        <Text className="mt-0.5 text-sm text-foreground-secondary" numberOfLines={1}>
          {card.back}
        </Text>
        {card.tags.length > 0 ? (
          <Text className="mt-1 text-[10px] text-muted" numberOfLines={1}>
            {card.tags.map((t) => `#${t}`).join(' ')}
          </Text>
        ) : null}
      </View>
      <FlashCardStateBadge card={card} />
    </View>
  </Pressable>
)
