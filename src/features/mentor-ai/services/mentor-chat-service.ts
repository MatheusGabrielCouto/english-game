import { LEARNING_SKILL_BY_KEY } from '@/features/learning-gps/constants/learning-skills'
import { GameEvents } from '@/services/game-events'
import { MentorChatRepository } from '@/storage/repositories/mentor-chat-repository'
import { MentorMemoryRepository } from '@/storage/repositories/mentor-memory-repository'
import {
    MentorAIMode,
    MentorMemoryKeyPrefix,
    type MentorChatMessage,
    type MentorChatSessionRecord,
} from '@/types/mentor-ai'

import { buildProfessorAtlasSystemPrompt } from '../prompts/professor-atlas-system-prompt'
import { useMentorChatStore } from '../store/mentor-chat-store'
import { buildSessionTitle } from '../utils/build-session-title'
import { createMentorId } from '../utils/create-mentor-id'
import { AIContextBuilder } from './ai-context-builder'
import { LocalLLMRuntime } from './local-llm-runtime'
import { MentorMemoryService } from './mentor-memory-service'

const nowIso = () => new Date().toISOString()

const WELCOME_MESSAGE = (worldCefr: string, weakestLabel: string): string =>
  [
    `Olá! Sou o **Professor Atlas** 🎓`,
    `Seu nível atual: **${worldCefr}**. Vamos reforçar **${weakestLabel}**.`,
    '',
    'Pergunte sobre gramática, vocabulário ou envie uma frase para corrigir.',
  ].join('\n')

let activeGenerationToken = 0

const syncChatState = (partial: Partial<ReturnType<typeof useMentorChatStore.getState>>) => {
  useMentorChatStore.setState(partial)
}

const ensureWelcomeMessage = async (
  session: MentorChatSessionRecord,
  context: Awaited<ReturnType<typeof AIContextBuilder.build>>,
): Promise<MentorChatMessage[]> => {
  if (session.messages.length > 0) return session.messages

  const weakestLabel = LEARNING_SKILL_BY_KEY[context.skills.weakest].label

  const welcome: MentorChatMessage = {
    id: createMentorId('msg'),
    role: 'assistant',
    content: WELCOME_MESSAGE(context.learningGps.worldCefr, weakestLabel),
    createdAt: nowIso(),
  }

  const messages = [welcome]
  await MentorChatRepository.updateMessages(session.id, messages, session.title)
  return messages
}

const saveTopicMemory = async (topic: string | undefined): Promise<void> => {
  if (!topic) return
  const key = `${MentorMemoryKeyPrefix.TOPIC}${topic}`
  await MentorMemoryRepository.set(key, topic)
}

export const MentorChatService = {
  async hydrate(): Promise<void> {
    syncChatState({ hasHydrated: false, error: null })

    const [recentSession, context] = await Promise.all([
      MentorChatRepository.listRecent(1),
      AIContextBuilder.buildFromGps(),
    ])

    let session = recentSession[0] ?? null

    if (!session) {
      const createdAt = nowIso()
      session = {
        id: createMentorId('mentor_chat'),
        mode: MentorAIMode.PROFESSOR,
        title: 'Conversa com o Atlas',
        messages: [],
        createdAt,
        updatedAt: createdAt,
      }
      await MentorChatRepository.create(session)
      GameEvents.emit({ type: 'MENTOR_CHAT_STARTED', sessionId: session.id, mode: session.mode })
    }

    const messages = await ensureWelcomeMessage(session, context)

    syncChatState({
      sessionId: session.id,
      messages,
      isGenerating: false,
      streamingText: '',
      hasHydrated: true,
      error: null,
      lastCapturedGoal: null,
    })
  },

  async startNewSession(): Promise<void> {
    const context = await AIContextBuilder.buildFromGps()
    const createdAt = nowIso()
    const session: MentorChatSessionRecord = {
      id: createMentorId('mentor_chat'),
      mode: MentorAIMode.PROFESSOR,
      title: 'Nova conversa',
      messages: [],
      createdAt,
      updatedAt: createdAt,
    }

    await MentorChatRepository.create(session)
    GameEvents.emit({ type: 'MENTOR_CHAT_STARTED', sessionId: session.id, mode: session.mode })

    const messages = await ensureWelcomeMessage(session, context)
    syncChatState({
      sessionId: session.id,
      messages,
      isGenerating: false,
      streamingText: '',
      error: null,
      lastCapturedGoal: null,
    })
  },

  async sendMessage(rawText: string, options?: { llmText?: string }): Promise<void> {
    const displayText = rawText.trim()
    const llmText = options?.llmText?.trim() || displayText
    const { sessionId, messages, isGenerating } = useMentorChatStore.getState()
    if (!displayText || !sessionId || isGenerating) return

    const token = ++activeGenerationToken
    const userMessage: MentorChatMessage = {
      id: createMentorId('msg'),
      role: 'user',
      content: displayText,
      createdAt: nowIso(),
    }

    const nextMessages = [...messages, userMessage]
    const isFirstUserTurn = messages.filter((message) => message.role === 'user').length === 0
    const title = isFirstUserTurn ? buildSessionTitle(displayText) : undefined

    syncChatState({
      messages: nextMessages,
      isGenerating: true,
      streamingText: '',
      error: null,
      lastCapturedGoal: null,
    })

    await MentorChatRepository.updateMessages(sessionId, nextMessages, title)

    const capturedGoals = await MentorMemoryService.extractAndSaveGoalsFromMessage(llmText)
    if (capturedGoals.length > 0) {
      syncChatState({ lastCapturedGoal: capturedGoals[0] })
    }

    try {
      const context = await AIContextBuilder.buildFromGps()
      const systemPrompt = buildProfessorAtlasSystemPrompt(context)
      let streamed = ''

      const result = await LocalLLMRuntime.generateStream(
        {
          context,
          userMessage: llmText,
          systemPrompt,
          history: messages,
        },
        {
          onToken: (chunk) => {
            if (token !== activeGenerationToken) return
            streamed += chunk
            syncChatState({ streamingText: streamed })
          },
          onDone: () => {},
        },
      )

      if (token !== activeGenerationToken) return

      const assistantMessage: MentorChatMessage = {
        id: createMentorId('msg'),
        role: 'assistant',
        content: result.text,
        createdAt: nowIso(),
      }

      const persisted = [...nextMessages, assistantMessage]
      await MentorChatRepository.updateMessages(sessionId, persisted, title)
      await saveTopicMemory(result.topic)

      const userTurns = persisted.filter((message) => message.role === 'user').length
      if (userTurns >= 3) {
        GameEvents.emit({
          type: 'MENTOR_SESSION_COMPLETED',
          sessionId,
          durationMinutes: Math.max(1, Math.round(result.latencyMs / 60000)),
        })
      }

      syncChatState({
        messages: persisted,
        isGenerating: false,
        streamingText: '',
      })
    } catch (error) {
      if (token !== activeGenerationToken) return
      syncChatState({
        isGenerating: false,
        streamingText: '',
        error: error instanceof Error ? error.message : 'Não foi possível gerar a resposta.',
      })
    }
  },

  cancelGeneration(): void {
    activeGenerationToken += 1
    syncChatState({ isGenerating: false, streamingText: '' })
  },
}
