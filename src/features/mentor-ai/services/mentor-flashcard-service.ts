import { FlashSrsService } from '@/features/flash-deck/services/flash-srs-service'
import { normalizeLemma } from '@/features/learning'
import { GameEvents } from '@/services/game-events'
import { FlashDeckRepository } from '@/storage/repositories/flash-deck-repository'
import { DEFAULT_FLASH_DECK_ID, type FlashCardRecord } from '@/types/flash-card'
import type { MentorFlashcardSet } from '@/types/mentor-ai'

import {
    buildFlashcardSystemPrompt,
    buildFlashcardUserPrompt,
} from '../prompts/flashcard-system-prompt'
import { useMentorFlashcardStore } from '../store/mentor-flashcard-store'
import { createMentorId } from '../utils/create-mentor-id'
import { parseFlashcardResponse } from '../utils/parse-flashcard-response'
import { AIContextBuilder } from './ai-context-builder'
import { LocalLLMRuntime } from './local-llm-runtime'

const DEFAULT_CARD_COUNT = 10
const MIN_CARD_COUNT = 5
const MAX_CARD_COUNT = 20

let activeGenerationToken = 0

const syncState = (partial: Partial<ReturnType<typeof useMentorFlashcardStore.getState>>) => {
  useMentorFlashcardStore.setState(partial)
}

const clampCardCount = (count: number): number =>
  Math.min(MAX_CARD_COUNT, Math.max(MIN_CARD_COUNT, count))

const parseFlashcardCandidates = (...candidates: string[]): MentorFlashcardSet | null => {
  for (const candidate of candidates) {
    const trimmed = candidate.trim()
    if (!trimmed) continue

    const parsed = parseFlashcardResponse(trimmed)
    if (parsed) return parsed
  }

  return null
}

const buildOfflineFlashcards = (topic: string, count: number): MentorFlashcardSet => {
  const topicKey = topic.trim().toLowerCase()
  const title = topic.trim() || 'Vocabulário'

  const travelCards = [
    { front: 'boarding pass', back: 'cartão de embarque', example: 'Show your boarding pass at the gate.' },
    { front: 'luggage', back: 'bagagem', example: 'Where is my luggage?' },
    { front: 'delay', back: 'atraso', example: 'Our flight has a two-hour delay.' },
    { front: 'customs', back: 'alfândega', example: 'We went through customs quickly.' },
    { front: 'layover', back: 'escala', example: 'We have a layover in Madrid.' },
    { front: 'departure gate', back: 'portão de embarque', example: 'Gate B12 is on the left.' },
    { front: 'passport', back: 'passaporte', example: 'Keep your passport with you.' },
    { front: 'seat belt', back: 'cinto de segurança', example: 'Fasten your seat belt.' },
    { front: 'itinerary', back: 'itinerário', example: 'Check your itinerary for hotel details.' },
    { front: 'reservation', back: 'reserva', example: 'I have a reservation under Silva.' },
  ]

  const techCards = [
    { front: 'deploy', back: 'publicar / implantar', example: 'We deploy every Friday.' },
    { front: 'pull request', back: 'solicitação de merge', example: 'Open a pull request for review.' },
    { front: 'refactor', back: 'refatorar', example: 'Let us refactor this module.' },
    { front: 'scalability', back: 'escalabilidade', example: 'We need better scalability.' },
    { front: 'latency', back: 'latência', example: 'High latency hurts the user experience.' },
    { front: 'endpoint', back: 'ponto de API', example: 'This endpoint returns JSON.' },
    { front: 'cache', back: 'cache / armazenamento temporário', example: 'Cache the response for one hour.' },
    { front: 'rollback', back: 'reverter versão', example: 'We had to rollback the release.' },
    { front: 'debug', back: 'depurar', example: 'I need to debug this issue.' },
    { front: 'stakeholder', back: 'parte interessada', example: 'Update the stakeholders weekly.' },
  ]

  const defaultCards = [
    { front: 'improve', back: 'melhorar', example: 'I want to improve my English.' },
    { front: 'achieve', back: 'alcançar', example: 'She achieved her goal.' },
    { front: 'challenge', back: 'desafio', example: 'Learning is a fun challenge.' },
    { front: 'practice', back: 'praticar', example: 'Practice every day.' },
    { front: 'confident', back: 'confiante', example: 'I feel more confident now.' },
    { front: 'fluent', back: 'fluente', example: 'He is fluent in three languages.' },
    { front: 'pronunciation', back: 'pronúncia', example: 'Work on your pronunciation.' },
    { front: 'grammar', back: 'gramática', example: 'Grammar takes time to master.' },
    { front: 'vocabulary', back: 'vocabulário', example: 'Expand your vocabulary daily.' },
    { front: 'feedback', back: 'feedback / retorno', example: 'Ask for feedback from your mentor.' },
  ]

  const pool =
    topicKey.includes('travel') || topicKey.includes('viagem') || topicKey.includes('airport')
      ? travelCards
      : topicKey.includes('tech') ||
          topicKey.includes('dev') ||
          topicKey.includes('interview') ||
          topicKey.includes('api')
        ? techCards
        : defaultCards

  return {
    topic: topicKey.replace(/\s+/g, '_') || 'vocabulary',
    title,
    cards: pool.slice(0, count),
  }
}

const resolveFlashcardSet = async (
  topic: string,
  count: number,
  context: Awaited<ReturnType<typeof AIContextBuilder.buildFromGps>>,
): Promise<MentorFlashcardSet> => {
  const systemPrompt = buildFlashcardSystemPrompt(context)
  let streamed = ''

  const llmResult = await LocalLLMRuntime.generateStream(
    {
      context,
      userMessage: buildFlashcardUserPrompt(topic, count),
      systemPrompt,
      llmOptions: {
        temperature: 0.4,
        topP: 0.9,
        nPredict: 1536,
      },
    },
    {
      onToken: (chunk) => {
        streamed += chunk
        syncState({ streamingText: streamed })
      },
      onDone: () => {},
    },
  )

  const parsed = parseFlashcardCandidates(llmResult.text, streamed)
  if (parsed) return parsed

  return buildOfflineFlashcards(topic, count)
}

const buildMentorCard = (
  deckId: string,
  card: MentorFlashcardSet['cards'][number],
  topic: string,
  now: Date,
): FlashCardRecord => ({
  id: createMentorId('flash_card'),
  deckId,
  lemma: normalizeLemma(card.front),
  front: card.front.trim(),
  back: card.back.trim(),
  exampleSentence: card.example?.trim() || null,
  audioUri: null,
  imageUri: null,
  tags: ['mentor', topic],
  source: 'mentor',
  ...FlashSrsService.initialFields(now),
  lastReviewedAt: null,
  createdAt: now.toISOString(),
  suspended: false,
})

export const MentorFlashcardService = {
  setTopic(topic: string): void {
    syncState({ topic, error: null })
  },

  setCardCount(cardCount: number): void {
    syncState({ cardCount: clampCardCount(cardCount) })
  },

  reset(): void {
    activeGenerationToken += 1
    useMentorFlashcardStore.getState().reset()
  },

  cancelGeneration(): void {
    activeGenerationToken += 1
    syncState({ isGenerating: false, streamingText: '' })
  },

  async generateFlashcards(rawTopic?: string, rawCount?: number): Promise<MentorFlashcardSet | null> {
    const topic = (rawTopic ?? useMentorFlashcardStore.getState().topic).trim()
    const count = clampCardCount(rawCount ?? useMentorFlashcardStore.getState().cardCount ?? DEFAULT_CARD_COUNT)
    if (!topic) return null

    const token = ++activeGenerationToken

    syncState({
      topic,
      cardCount: count,
      flashcardSet: null,
      phase: 'input',
      currentIndex: 0,
      isGenerating: true,
      streamingText: '',
      error: null,
      savedDeckId: null,
      savedCount: 0,
    })

    try {
      const context = await AIContextBuilder.buildFromGps()
      const flashcardSet = await resolveFlashcardSet(topic, count, context)

      if (token !== activeGenerationToken) return null

      syncState({
        flashcardSet,
        phase: 'preview',
        currentIndex: 0,
        isGenerating: false,
        streamingText: '',
      })

      return flashcardSet
    } catch (error) {
      if (token !== activeGenerationToken) return null

      syncState({
        isGenerating: false,
        streamingText: '',
        error: error instanceof Error ? error.message : 'Não foi possível gerar flashcards.',
      })

      return null
    }
  },

  async exportToDeck(deckId = DEFAULT_FLASH_DECK_ID): Promise<number> {
    const { flashcardSet, topic } = useMentorFlashcardStore.getState()
    if (!flashcardSet || flashcardSet.cards.length === 0) return 0

    const deck = await FlashDeckRepository.getDeck(deckId)
    if (!deck) {
      throw new Error('Baralho não encontrado. Abra o Baralho Vivo primeiro.')
    }

    const now = new Date()
    const cards = flashcardSet.cards.map((card) =>
      buildMentorCard(deckId, card, flashcardSet.topic || topic, now),
    )

    await FlashDeckRepository.insertCardsBatch(cards)

    syncState({
      savedDeckId: deckId,
      savedCount: cards.length,
    })

    if (cards.length >= 5) {
      GameEvents.emit({ type: 'MENTOR_SESSION_COMPLETED' })
    }

    return cards.length
  },

  startStudy(index = 0): void {
    const { flashcardSet } = useMentorFlashcardStore.getState()
    if (!flashcardSet || flashcardSet.cards.length === 0) return

    const safeIndex = Math.min(Math.max(0, index), flashcardSet.cards.length - 1)
    syncState({ phase: 'study', currentIndex: safeIndex })
  },

  openCardAt(index: number): void {
    MentorFlashcardService.startStudy(index)
  },

  nextCard(): void {
    const { flashcardSet, currentIndex } = useMentorFlashcardStore.getState()
    if (!flashcardSet) return

    const nextIndex = currentIndex + 1
    if (nextIndex >= flashcardSet.cards.length) return

    syncState({ currentIndex: nextIndex })
  },

  prevCard(): void {
    const { currentIndex } = useMentorFlashcardStore.getState()
    if (currentIndex <= 0) return

    syncState({ currentIndex: currentIndex - 1 })
  },

  exitStudy(): void {
    syncState({ phase: 'preview' })
  },
}
