import { type Href, router } from 'expo-router'
import { Pressable, Text, View } from 'react-native'

import { Button } from '@/components'
import { GameCard } from '@/components/ui/game'
import { flashDeckRoutes } from '@/features/flash-deck/utils/flash-deck-routes'
import { DEFAULT_FLASH_DECK_ID } from '@/types/flash-card'
import type { MentorFlashcardSet } from '@/types/mentor-ai'

import { MENTOR_AI_UI } from '../constants/mentor-ai-ui'

type MentorFlashcardPreviewListProps = {
  flashcardSet: MentorFlashcardSet
  savedCount: number
  savedDeckId: string | null
  isExporting?: boolean
  onStartStudy: () => void
  onOpenCard: (index: number) => void
  onExport: () => void
  onGenerateAnother: () => void
}

export const MentorFlashcardPreviewList = ({
  flashcardSet,
  savedCount,
  savedDeckId,
  isExporting = false,
  onStartStudy,
  onOpenCard,
  onExport,
  onGenerateAnother,
}: MentorFlashcardPreviewListProps) => (
  <View className="gap-4">
    <GameCard variant="default" className="gap-2">
      <Text className="text-sm font-black uppercase tracking-widest text-muted">
        {MENTOR_AI_UI.flashcards.previewTitle}
      </Text>
      <Text className="text-lg font-bold text-foreground">{flashcardSet.title}</Text>
      <Text className="text-xs text-muted">
        {MENTOR_AI_UI.flashcards.previewCount(flashcardSet.cards.length)}
      </Text>
      <Text className="text-xs text-foreground-secondary">{MENTOR_AI_UI.flashcards.tapToOpen}</Text>
    </GameCard>

    <Button label={MENTOR_AI_UI.flashcards.startStudy} onPress={onStartStudy} />

    {flashcardSet.cards.map((card, index) => (
      <Pressable
        key={`${card.front}-${index}`}
        onPress={() => onOpenCard(index)}
        accessibilityRole="button"
        accessibilityLabel={`${MENTOR_AI_UI.flashcards.openCard}: ${card.front}`}
        className="rounded-2xl border border-border bg-surface px-4 py-3 active:opacity-80">
        <View className="flex-row items-start justify-between gap-2">
          <View className="min-w-0 flex-1">
            <Text className="text-[10px] font-black uppercase tracking-widest text-accent">
              {index + 1}
            </Text>
            <Text className="font-bold text-foreground" numberOfLines={1}>
              {card.front}
            </Text>
            <Text className="mt-0.5 text-sm text-foreground-secondary" numberOfLines={1}>
              {card.back}
            </Text>
            {card.example ? (
              <Text className="mt-1 text-[10px] italic text-muted" numberOfLines={1}>
                {card.example}
              </Text>
            ) : null}
          </View>
          <Text className="text-lg text-muted">›</Text>
        </View>
      </Pressable>
    ))}

    {savedCount > 0 ? (
      <View className="gap-2">
        <Text className="text-center text-xs text-success">
          {MENTOR_AI_UI.flashcards.savedNote(savedCount)}
        </Text>
        <Button
          label={MENTOR_AI_UI.flashcards.openInDeck}
          variant="secondary"
          onPress={() =>
            router.push(flashDeckRoutes.review(savedDeckId ?? DEFAULT_FLASH_DECK_ID) as Href)
          }
        />
      </View>
    ) : (
      <Button
        label={MENTOR_AI_UI.flashcards.export}
        onPress={onExport}
        loading={isExporting}
        loadingLabel={MENTOR_AI_UI.flashcards.exporting}
      />
    )}

    <Button
      label={MENTOR_AI_UI.flashcards.generateAnother}
      variant="secondary"
      onPress={onGenerateAnother}
    />
  </View>
)
