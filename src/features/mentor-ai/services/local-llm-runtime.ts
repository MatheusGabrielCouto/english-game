import type { MentorChatMessage } from '@/types/mentor-ai'
import {
    MentorLLMRuntimeEngine,
    type MentorAIContext,
    type MentorLLMGenerateResult,
    type MentorLLMRuntimeEngineValue,
    type MentorLLMStatus,
    type MentorLLMStreamCallbacks,
} from '@/types/mentor-ai'

import { buildProfessorAtlasSystemPrompt } from '../prompts/professor-atlas-system-prompt'
import {
    buildTranslationLlmUserPrompt,
    buildTranslationSystemPrompt,
} from '../prompts/translation-system-prompt'
import { useMentorLlmStore } from '../store/mentor-llm-store'
import { MentorPedagogyEngine } from './mentor-pedagogy-engine'
import {
    extractTranslationPhrase,
    isTranslationRequest,
    MentorTranslationEngine,
} from './mentor-translation-engine'
import { NativeLLMAdapter } from './native-llm-adapter'

export const MENTOR_LLM_MODEL_ID = 'qwen2.5-1.5b-instruct'
export const MENTOR_LLM_MODEL_LABEL = 'Qwen 2.5 1.5B Instruct'

export type MentorLLMCompletionOptions = {
  temperature?: number
  topP?: number
  nPredict?: number
}

export type MentorLLMGenerateInput = {
  context: MentorAIContext
  userMessage: string
  systemPrompt?: string
  history?: MentorChatMessage[]
  llmOptions?: MentorLLMCompletionOptions
}

const generateWithPedagogy = (
  input: MentorLLMGenerateInput,
  started: number,
): MentorLLMGenerateResult => {
  const systemPrompt = input.systemPrompt ?? buildProfessorAtlasSystemPrompt(input.context)
  const match = MentorPedagogyEngine.generate(input.context, input.userMessage)

  return {
    text: match.response,
    fromMock: false,
    engine: MentorLLMRuntimeEngine.PEDAGOGY,
    latencyMs: Date.now() - started,
    systemPrompt,
    topic: match.topic,
  }
}

const deliverInstantResult = (
  text: string,
  topic: string,
  started: number,
  callbacks: MentorLLMStreamCallbacks,
): MentorLLMGenerateResult => {
  const result: MentorLLMGenerateResult = {
    text,
    fromMock: false,
    engine: MentorLLMRuntimeEngine.PEDAGOGY,
    latencyMs: Date.now() - started,
    systemPrompt: buildTranslationSystemPrompt(),
    topic,
  }

  callbacks.onToken(text)
  callbacks.onDone(result)
  return result
}

const resolveTranslation = async (
  input: MentorLLMGenerateInput,
  started: number,
  callbacks: MentorLLMStreamCallbacks,
): Promise<MentorLLMGenerateResult | null> => {
  const offline = MentorTranslationEngine.tryTranslate(input.userMessage)
  if (offline?.trim()) {
    return deliverInstantResult(offline, 'translation', started, callbacks)
  }

  const phrase = extractTranslationPhrase(input.userMessage)
  if (!phrase) return null

  const translationInput: MentorLLMGenerateInput = {
    ...input,
    history: [],
    systemPrompt: buildTranslationSystemPrompt(),
    userMessage: buildTranslationLlmUserPrompt(phrase),
    llmOptions: { temperature: 0.2, topP: 0.85, nPredict: 160 },
  }

  if (NativeLLMAdapter.isAvailable()) {
    const native = await NativeLLMAdapter.generateStream(translationInput, callbacks.onToken)
    if (native?.text.trim()) {
      callbacks.onDone(native)
      return { ...native, topic: 'translation' }
    }
  }

  const fallback = MentorTranslationEngine.tryTranslate(input.userMessage)
  if (fallback?.trim()) {
    return deliverInstantResult(fallback, 'translation', started, callbacks)
  }

  return null
}

export const LocalLLMRuntime = {
  getStatus(): MentorLLMStatus {
    const llmState = useMentorLlmStore.getState()
    const engine: MentorLLMRuntimeEngineValue = NativeLLMAdapter.isAvailable()
      ? MentorLLMRuntimeEngine.NATIVE
      : MentorLLMRuntimeEngine.PEDAGOGY

    const modelLabel =
      engine === MentorLLMRuntimeEngine.NATIVE
        ? MENTOR_LLM_MODEL_LABEL
        : llmState.status === 'missing' || llmState.status === 'error'
          ? 'Motor pedagógico (fallback)'
          : 'Motor pedagógico offline'

    return {
      ready: engine === MentorLLMRuntimeEngine.NATIVE || llmState.status !== 'idle',
      engine,
      modelId: MENTOR_LLM_MODEL_ID,
      modelLabel,
      offlineBadge: '100% no seu dispositivo',
    }
  },

  async generate(input: MentorLLMGenerateInput): Promise<MentorLLMGenerateResult> {
    const started = Date.now()

    if (isTranslationRequest(input.userMessage)) {
      const translation = await resolveTranslation(input, started, {
        onToken: () => {},
        onDone: () => {},
      })
      if (translation) return translation
    }

    if (NativeLLMAdapter.isAvailable()) {
      const native = await NativeLLMAdapter.generate(input)
      if (native?.text.trim()) return native
    }

    return generateWithPedagogy(input, started)
  },

  async generateStream(
    input: MentorLLMGenerateInput,
    callbacks: MentorLLMStreamCallbacks,
  ): Promise<MentorLLMGenerateResult> {
    const started = Date.now()

    try {
      if (isTranslationRequest(input.userMessage)) {
        const translation = await resolveTranslation(input, started, callbacks)
        if (translation) return translation
      }

      if (NativeLLMAdapter.isAvailable()) {
        const native = await NativeLLMAdapter.generateStream(input, callbacks.onToken)
        if (native?.text.trim()) {
          callbacks.onDone(native)
          return native
        }
      }

      const result = generateWithPedagogy(input, started)
      callbacks.onToken(result.text)
      callbacks.onDone(result)
      return result
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      callbacks.onError?.(err)
      throw err
    }
  },
}
