import { initLlama, type LlamaContext, type NativeCompletionResult, type TokenData } from 'llama.rn'

import { MENTOR_LLM_STOP_WORDS } from '../constants/mentor-model'

export type MentorLLMChatMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

let context: LlamaContext | null = null
let loadedModelPath: string | null = null
let loadPromise: Promise<LlamaContext> | null = null

const toFileUri = (path: string): string => (path.startsWith('file://') ? path : `file://${path}`)

const extractCompletionText = (result: NativeCompletionResult): string => {
  const content = result.content?.trim()
  if (content) return content

  const text = result.text?.trim()
  if (text) return text

  return result.reasoning_content?.trim() ?? ''
}

const emitStreamDelta = (
  data: TokenData,
  streamedContent: { value: string },
  onToken: (token: string) => void,
): void => {
  const nextContent = data.content ?? ''
  if (nextContent.length > streamedContent.value.length) {
    const delta = nextContent.slice(streamedContent.value.length)
    streamedContent.value = nextContent
    if (delta) onToken(delta)
    return
  }

  if (data.token) onToken(data.token)
}

export const MentorLLMService = {
  isLoaded(): boolean {
    return context !== null
  },

  getLoadedModelPath(): string | null {
    return loadedModelPath
  },

  async load(modelPath: string): Promise<LlamaContext> {
    if (context && loadedModelPath === modelPath) return context
    if (loadPromise) return loadPromise

    loadPromise = (async () => {
      if (context) {
        await context.release()
        context = null
        loadedModelPath = null
      }

      const next = await initLlama({
        model: toFileUri(modelPath),
        use_mlock: false,
        n_ctx: 2048,
        n_gpu_layers: 0,
        n_threads: 4,
      })

      context = next
      loadedModelPath = modelPath
      return next
    })()

    try {
      return await loadPromise
    } finally {
      loadPromise = null
    }
  },

  async completeStream(input: {
    messages: MentorLLMChatMessage[]
    onToken: (token: string) => void
    nPredict?: number
    temperature?: number
    topP?: number
  }): Promise<string> {
    if (!context) {
      throw new Error('Mentor LLM não carregado')
    }

    const streamedContent = { value: '' }

    const result = await context.completion(
      {
        messages: input.messages,
        n_predict: input.nPredict ?? 512,
        temperature: input.temperature ?? 0.7,
        top_p: input.topP ?? 0.9,
        jinja: true,
        enable_thinking: false,
        reasoning_format: 'none',
        stop: MENTOR_LLM_STOP_WORDS,
      },
      (data) => {
        emitStreamDelta(data, streamedContent, input.onToken)
      },
    )

    return extractCompletionText(result)
  },

  async release(): Promise<void> {
    if (context) {
      await context.release()
      context = null
      loadedModelPath = null
    }
  },
}
