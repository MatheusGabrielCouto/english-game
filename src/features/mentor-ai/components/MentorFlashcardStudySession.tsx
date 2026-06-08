import { type Href, router } from 'expo-router'
import { Text, View } from 'react-native'

import { Button } from '@/components'
import { GameCard } from '@/components/ui/game'
import { FlashCardFace } from '@/features/flash-deck/components/FlashCardFace'
import { flashDeckRoutes } from '@/features/flash-deck/utils/flash-deck-routes'
import { LearningProgressHeader } from '@/features/learning/components/ui'
import { DEFAULT_FLASH_DECK_ID } from '@/types/flash-card'

import { MENTOR_AI_UI } from '../constants/mentor-ai-ui'
import { useMentorFlashcards } from '../hooks/use-mentor-flashcards'

export const MentorFlashcardStudySession = () => {
  const {
    flashcardSet,
    currentIndex,
    savedDeckId,
    nextCard,
    prevCard,
    exitStudy,
  } = useMentorFlashcards()

  if (!flashcardSet) return null

  const card = flashcardSet.cards[currentIndex]
  if (!card) return null

  const isFirst = currentIndex === 0
  const isLast = currentIndex >= flashcardSet.cards.length - 1

  const handleOpenInDeck = () => {
    const deckId = savedDeckId ?? DEFAULT_FLASH_DECK_ID
    router.push(flashDeckRoutes.review(deckId) as Href)
  }

  return (
    <View className="gap-4">
      <LearningProgressHeader
        questLabel={flashcardSet.title}
        current={currentIndex + 1}
        total={flashcardSet.cards.length}
      />

      <GameCard variant="default" className="gap-1 p-1">
        <FlashCardFace
          cardKey={`${card.front}-${currentIndex}`}
          front={card.front}
          back={card.back}
          exampleSentence={card.example ?? null}
        />
      </GameCard>

      <View className="flex-row gap-2">
        <Button
          label={MENTOR_AI_UI.flashcards.prevCard}
          variant="secondary"
          onPress={prevCard}
          disabled={isFirst}
          className="flex-1"
        />
        <Button
          label={isLast ? MENTOR_AI_UI.flashcards.finishStudy : MENTOR_AI_UI.flashcards.nextCard}
          onPress={isLast ? exitStudy : nextCard}
          className="flex-1"
        />
      </View>

      <Button
        label={MENTOR_AI_UI.flashcards.backToList}
        variant="ghost"
        onPress={exitStudy}
      />

      {savedDeckId ? (
        <View className="gap-2">
          <Text className="text-center text-xs text-success">
            {MENTOR_AI_UI.flashcards.savedNote(flashcardSet.cards.length)}
          </Text>
          <Button
            label={MENTOR_AI_UI.flashcards.openInDeck}
            variant="secondary"
            onPress={handleOpenInDeck}
          />
        </View>
      ) : null}
    </View>
  )
}
