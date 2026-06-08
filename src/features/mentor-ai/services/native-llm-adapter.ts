import { MentorLLMRuntimeEngine, type MentorLLMGenerateResult } from '@/types/mentor-ai'

import { buildProfessorAtlasSystemPrompt } from '../prompts/professor-atlas-system-prompt'
import { truncateChatMessages } from '../utils/truncate-chat-messages'
import type { MentorLLMGenerateInput } from './local-llm-runtime'
import { MentorLLMService, type MentorLLMChatMessage } from './mentor-llm-service'

const buildMessages = (input: MentorLLMGenerateInput): MentorLLMChatMessage[] => {
  const system = input.systemPrompt ?? buildProfessorAtlasSystemPrompt(input.context)
  const history = input.history ?? []
  const truncated = truncateChatMessages(history)

  return [
    { role: 'system', content: system },
    ...truncated.map((message) => ({
      role: message.role as 'user' | 'assistant',
      content: message.content,
    })),
    { role: 'user', content: input.userMessage },
  ]
}

export const NativeLLMAdapter = {
  isAvailable(): boolean {
    return MentorLLMService.isLoaded()
  },

  async generate(input: MentorLLMGenerateInput): Promise<MentorLLMGenerateResult | null> {
    if (!MentorLLMService.isLoaded()) return null

    const started = Date.now()
    const system = input.systemPrompt ?? buildProfessorAtlasSystemPrompt(input.context)
    const messages = buildMessages(input)

    const text = await MentorLLMService.completeStream({
      messages,
      onToken: () => {},
      ...input.llmOptions,
    })

    return {
      text,
      fromMock: false,
      engine: MentorLLMRuntimeEngine.NATIVE,
      latencyMs: Date.now() - started,
      systemPrompt: system,
    }
  },

  async generateStream(
    input: MentorLLMGenerateInput,
    onToken: (chunk: string) => void,
  ): Promise<MentorLLMGenerateResult | null> {
    if (!MentorLLMService.isLoaded()) return null

    const started = Date.now()
    const system = input.systemPrompt ?? buildProfessorAtlasSystemPrompt(input.context)
    const messages = buildMessages(input)

    const text = await MentorLLMService.completeStream({
      messages,
      onToken,
      ...input.llmOptions,
    })

    return {
      text,
      fromMock: false,
      engine: MentorLLMRuntimeEngine.NATIVE,
      latencyMs: Date.now() - started,
      systemPrompt: system,
    }
  },
}
