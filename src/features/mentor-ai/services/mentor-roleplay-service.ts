import { GameEvents } from '@/services/game-events'
import {
    MentorRoleplayMode,
    type MentorChatMessage,
    type MentorInterviewTrackValue,
    type MentorRoleplayFeedback,
    type MentorRoleplayModeValue,
    type MentorRoleplayRoleValue,
} from '@/types/mentor-ai'

import { MENTOR_ROLEPLAY_MIN_TURNS } from '../constants/mentor-roleplay-catalog'
import {
    buildInterviewFeedbackPrompt,
    buildInterviewOpeningPrompt,
    buildInterviewSystemPrompt,
    buildInterviewTurnPrompt,
} from '../prompts/interview-system-prompt'
import {
    buildRoleplayFeedbackPrompt,
    buildRoleplayOpeningPrompt,
    buildRoleplaySystemPrompt,
    buildRoleplayTurnPrompt,
} from '../prompts/roleplay-system-prompt'
import { useMentorRoleplayStore } from '../store/mentor-roleplay-store'
import { createMentorId } from '../utils/create-mentor-id'
import {
    buildHeuristicRoleplayFeedback,
    parseRoleplayFeedback,
} from '../utils/parse-roleplay-feedback'
import { AIContextBuilder } from './ai-context-builder'
import { LocalLLMRuntime } from './local-llm-runtime'
import { MentorRoleplayEngine } from './mentor-roleplay-engine'

const nowIso = () => new Date().toISOString()

let activeGenerationToken = 0

const syncState = (partial: Partial<ReturnType<typeof useMentorRoleplayStore.getState>>) => {
  useMentorRoleplayStore.setState(partial)
}

const countUserTurns = (messages: MentorChatMessage[]): number =>
  messages.filter((message) => message.role === 'user').length

const resolveFeedback = async (
  mode: MentorRoleplayModeValue,
  track: MentorInterviewTrackValue | null,
  messages: MentorChatMessage[],
  context: Awaited<ReturnType<typeof AIContextBuilder.buildFromGps>>,
): Promise<MentorRoleplayFeedback> => {
  const userTurns = countUserTurns(messages)

  const feedbackPrompt =
    mode === MentorRoleplayMode.INTERVIEW && track
      ? buildInterviewFeedbackPrompt(track)
      : buildRoleplayFeedbackPrompt()

  const transcript = messages
    .map((message) => `${message.role === 'user' ? 'Student' : 'Atlas'}: ${message.content}`)
    .join('\n')

  try {
    const result = await LocalLLMRuntime.generate({
      context,
      userMessage: `Evaluate this session transcript:\n\n${transcript}`,
      systemPrompt: feedbackPrompt,
      llmOptions: { temperature: 0.2, nPredict: 512 },
    })

    const parsed = parseRoleplayFeedback(result.text)
    if (parsed) return parsed
  } catch {
    // fallback below
  }

  return buildHeuristicRoleplayFeedback(userTurns, mode === MentorRoleplayMode.INTERVIEW)
}

const generateReply = async (
  userMessage: string | null,
  history: MentorChatMessage[],
  context: Awaited<ReturnType<typeof AIContextBuilder.buildFromGps>>,
  mode: MentorRoleplayModeValue,
  role: MentorRoleplayRoleValue | null,
  track: MentorInterviewTrackValue | null,
  onToken: (chunk: string) => void,
): Promise<string> => {
  const userTurns = countUserTurns(history)
  const offline = userMessage
    ? MentorRoleplayEngine.buildTurnReply(mode, track, userTurns, userMessage)
    : MentorRoleplayEngine.buildOpening(mode, role, track)

  const systemPrompt =
    mode === MentorRoleplayMode.INTERVIEW && track
      ? buildInterviewSystemPrompt(context, track)
      : buildRoleplaySystemPrompt(context, role ?? ('coworker' as MentorRoleplayRoleValue))

  const prompt = userMessage
    ? mode === MentorRoleplayMode.INTERVIEW && track
      ? buildInterviewTurnPrompt(userMessage, userTurns)
      : buildRoleplayTurnPrompt(userMessage)
    : mode === MentorRoleplayMode.INTERVIEW && track
      ? buildInterviewOpeningPrompt(track)
      : buildRoleplayOpeningPrompt(role ?? ('coworker' as MentorRoleplayRoleValue))

  let streamed = ''

  try {
    const result = await LocalLLMRuntime.generateStream(
      {
        context,
        userMessage: prompt,
        systemPrompt,
        history,
        llmOptions: { temperature: 0.65, topP: 0.9, nPredict: 256 },
      },
      {
        onToken: (chunk) => {
          streamed += chunk
          onToken(streamed)
        },
        onDone: () => {},
      },
    )

    const text = result.text.trim() || streamed.trim()
    if (text) return text
  } catch {
    // pedagogy fallback
  }

  return offline
}

export const MentorRoleplayService = {
  reset(): void {
    activeGenerationToken += 1
    useMentorRoleplayStore.getState().reset()
  },

  cancelGeneration(): void {
    activeGenerationToken += 1
    syncState({ isGenerating: false, streamingText: '' })
  },

  async startConversation(role: MentorRoleplayRoleValue): Promise<void> {
    const token = ++activeGenerationToken
    const sessionId = createMentorId('mentor_roleplay')

    syncState({
      phase: 'active',
      mode: MentorRoleplayMode.CONVERSATION,
      role,
      track: null,
      sessionId,
      messages: [],
      turnCount: 0,
      isGenerating: true,
      streamingText: '',
      error: null,
      feedback: null,
    })

    try {
      const context = await AIContextBuilder.buildFromGps()
      const content = await generateReply(null, [], context, MentorRoleplayMode.CONVERSATION, role, null, (chunk) => {
        if (token !== activeGenerationToken) return
        syncState({ streamingText: chunk })
      })

      if (token !== activeGenerationToken) return

      const opening: MentorChatMessage = {
        id: createMentorId('msg'),
        role: 'assistant',
        content,
        createdAt: nowIso(),
      }

      syncState({
        messages: [opening],
        isGenerating: false,
        streamingText: '',
      })
    } catch (error) {
      if (token !== activeGenerationToken) return
      syncState({
        isGenerating: false,
        streamingText: '',
        error: error instanceof Error ? error.message : 'Não foi possível iniciar o roleplay.',
      })
    }
  },

  async startInterview(track: MentorInterviewTrackValue): Promise<void> {
    const token = ++activeGenerationToken
    const sessionId = createMentorId('mentor_roleplay')

    syncState({
      phase: 'active',
      mode: MentorRoleplayMode.INTERVIEW,
      role: null,
      track,
      sessionId,
      messages: [],
      turnCount: 0,
      isGenerating: true,
      streamingText: '',
      error: null,
      feedback: null,
    })

    try {
      const context = await AIContextBuilder.buildFromGps()
      const content = await generateReply(
        null,
        [],
        context,
        MentorRoleplayMode.INTERVIEW,
        null,
        track,
        (chunk) => {
          if (token !== activeGenerationToken) return
          syncState({ streamingText: chunk })
        },
      )

      if (token !== activeGenerationToken) return

      const opening: MentorChatMessage = {
        id: createMentorId('msg'),
        role: 'assistant',
        content,
        createdAt: nowIso(),
      }

      syncState({
        messages: [opening],
        isGenerating: false,
        streamingText: '',
      })
    } catch (error) {
      if (token !== activeGenerationToken) return
      syncState({
        isGenerating: false,
        streamingText: '',
        error: error instanceof Error ? error.message : 'Não foi possível iniciar a entrevista.',
      })
    }
  },

  async sendMessage(rawText: string, options?: { llmText?: string }): Promise<void> {
    const displayText = rawText.trim()
    const llmText = options?.llmText?.trim() || displayText
    const { phase, mode, role, track, messages, isGenerating, sessionId } =
      useMentorRoleplayStore.getState()

    if (!displayText || phase !== 'active' || !mode || !sessionId || isGenerating) return

    const token = ++activeGenerationToken
    const userMessage: MentorChatMessage = {
      id: createMentorId('msg'),
      role: 'user',
      content: displayText,
      createdAt: nowIso(),
    }

    const nextMessages = [...messages, userMessage]
    const turnCount = countUserTurns(nextMessages)

    syncState({
      messages: nextMessages,
      turnCount,
      isGenerating: true,
      streamingText: '',
      error: null,
    })

    try {
      const context = await AIContextBuilder.buildFromGps()
      const content = await generateReply(
        llmText,
        messages,
        context,
        mode,
        role,
        track,
        (chunk) => {
          if (token !== activeGenerationToken) return
          syncState({ streamingText: chunk })
        },
      )

      if (token !== activeGenerationToken) return

      const assistantMessage: MentorChatMessage = {
        id: createMentorId('msg'),
        role: 'assistant',
        content,
        createdAt: nowIso(),
      }

      syncState({
        messages: [...nextMessages, assistantMessage],
        isGenerating: false,
        streamingText: '',
      })
    } catch (error) {
      if (token !== activeGenerationToken) return
      syncState({
        isGenerating: false,
        streamingText: '',
        error: error instanceof Error ? error.message : 'Não foi possível gerar a resposta.',
      })
    }
  },

  async finishSession(): Promise<MentorRoleplayFeedback | null> {
    const { phase, mode, track, messages, sessionId, turnCount } =
      useMentorRoleplayStore.getState()

    if (phase !== 'active' || !mode || !sessionId) return null

    const token = ++activeGenerationToken

    syncState({ isGenerating: true, streamingText: '', error: null })

    try {
      const context = await AIContextBuilder.buildFromGps()
      const feedback = await resolveFeedback(mode, track, messages, context)

      if (token !== activeGenerationToken) return null

      if (turnCount >= MENTOR_ROLEPLAY_MIN_TURNS) {
        GameEvents.emit({
          type: 'MENTOR_ROLEPLAY_COMPLETED',
          sessionId,
          turns: turnCount,
        })
        GameEvents.emit({
          type: 'MENTOR_SESSION_COMPLETED',
          sessionId,
          durationMinutes: Math.max(1, turnCount),
        })
      }

      syncState({
        phase: 'feedback',
        feedback,
        isGenerating: false,
        streamingText: '',
      })

      return feedback
    } catch (error) {
      if (token !== activeGenerationToken) return null

      const fallback = MentorRoleplayEngine.buildFeedback(turnCount, mode)

      syncState({
        phase: 'feedback',
        feedback: fallback,
        isGenerating: false,
        streamingText: '',
        error: error instanceof Error ? error.message : null,
      })

      return fallback
    }
  },

  backToPicker(): void {
    activeGenerationToken += 1
    syncState({
      phase: 'pick',
      mode: null,
      role: null,
      track: null,
      sessionId: null,
      messages: [],
      turnCount: 0,
      isGenerating: false,
      streamingText: '',
      error: null,
      feedback: null,
    })
  },
}
