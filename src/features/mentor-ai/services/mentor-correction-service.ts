import { GameEvents } from '@/services/game-events'
import { MentorErrorRepository } from '@/storage/repositories/mentor-error-repository'
import { MentorCorrectionCategory, type CorrectionResult } from '@/types/mentor-ai'

import {
  buildCorrectionSystemPrompt,
  buildCorrectionUserPrompt,
} from '../prompts/correction-system-prompt'
import { useMentorCorrectionStore } from '../store/mentor-correction-store'
import { createMentorId } from '../utils/create-mentor-id'
import { formatCorrectionResult } from '../utils/format-correction-result'
import {
  buildUnstructuredCorrectionResult,
  parseCorrectionResponse,
} from '../utils/parse-correction-response'
import { AIContextBuilder } from './ai-context-builder'
import { LocalLLMRuntime } from './local-llm-runtime'
import { MentorCorrectionEngine } from './mentor-correction-engine'

const nowIso = () => new Date().toISOString()

let activeGenerationToken = 0

const syncState = (partial: Partial<ReturnType<typeof useMentorCorrectionStore.getState>>) => {
  useMentorCorrectionStore.setState(partial)
}

const persistCorrection = async (result: CorrectionResult): Promise<string> => {
  const errorId = createMentorId('mentor_error')
  const occurredAt = nowIso()

  await MentorErrorRepository.insert({
    id: errorId,
    category: result.category,
    original: result.original,
    corrected: result.corrected,
    occurredAt,
  })

  GameEvents.emit({
    type: 'MENTOR_CORRECTION_APPLIED',
    errorId,
    category: result.category,
  })

  return errorId
}

const parseCorrectionCandidates = (
  sentence: string,
  ...candidates: string[]
): CorrectionResult | null => {
  for (const candidate of candidates) {
    const trimmed = candidate.trim()
    if (!trimmed) continue

    const parsed = parseCorrectionResponse(trimmed, sentence)
    if (parsed) return parsed
  }

  return null
}

const buildOfflineFallback = (sentence: string): CorrectionResult => ({
  original: sentence.trim(),
  corrected: sentence.trim(),
  explanation:
    'Não identifiquei um padrão de erro conhecido. Revise a frase com calma ou tente um dos exemplos rápidos.',
  explanationEn:
    'I could not detect a known error pattern. Review the sentence carefully or try one of the quick examples.',
  category: MentorCorrectionCategory.OTHER,
})

const resolveCorrection = async (
  sentence: string,
  context: Awaited<ReturnType<typeof AIContextBuilder.buildFromGps>>,
): Promise<CorrectionResult> => {
  const offline = MentorCorrectionEngine.tryCorrect(sentence, context)
  if (offline) return offline

  const systemPrompt = buildCorrectionSystemPrompt(context)
  let streamed = ''

  const llmResult = await LocalLLMRuntime.generateStream(
    {
      context,
      userMessage: buildCorrectionUserPrompt(sentence),
      systemPrompt,
      llmOptions: {
        temperature: 0.2,
        topP: 0.85,
        nPredict: 256,
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

  const parsed =
    parseCorrectionCandidates(sentence, llmResult.text, streamed) ??
    (llmResult.text.trim() || streamed.trim()
      ? buildUnstructuredCorrectionResult(sentence, llmResult.text.trim() || streamed.trim())
      : null)

  if (parsed) return parsed

  const pedagogyFormatted = MentorCorrectionEngine.tryCorrect(sentence, context)
  if (pedagogyFormatted) return pedagogyFormatted

  return buildOfflineFallback(sentence)
}

export const MentorCorrectionService = {
  setInput(input: string): void {
    syncState({ input, error: null })
  },

  reset(): void {
    activeGenerationToken += 1
    useMentorCorrectionStore.getState().reset()
  },

  cancelGeneration(): void {
    activeGenerationToken += 1
    syncState({ isGenerating: false, streamingText: '' })
  },

  async correctSentence(rawSentence?: string): Promise<CorrectionResult | null> {
    const sentence = (rawSentence ?? useMentorCorrectionStore.getState().input).trim()
    if (!sentence) return null

    const token = ++activeGenerationToken

    syncState({
      input: sentence,
      result: null,
      isGenerating: true,
      streamingText: '',
      error: null,
      savedErrorId: null,
    })

    try {
      const context = await AIContextBuilder.buildFromGps()
      const result = await resolveCorrection(sentence, context)

      if (token !== activeGenerationToken) return null

      const savedErrorId = await persistCorrection(result)

      syncState({
        result,
        isGenerating: false,
        streamingText: formatCorrectionResult(result),
        savedErrorId,
      })

      return result
    } catch (error) {
      if (token !== activeGenerationToken) return null

      syncState({
        isGenerating: false,
        streamingText: '',
        error: error instanceof Error ? error.message : 'Não foi possível corrigir a frase.',
      })

      return null
    }
  },
}
