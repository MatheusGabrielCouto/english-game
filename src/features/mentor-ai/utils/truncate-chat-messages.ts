import type { MentorChatMessage } from '@/types/mentor-ai'

export const MENTOR_CHAT_CONTEXT_LIMIT = 12

export const truncateChatMessages = (
  messages: MentorChatMessage[],
  limit = MENTOR_CHAT_CONTEXT_LIMIT,
): MentorChatMessage[] => {
  const visible = messages.filter((message) => message.role !== 'system')
  if (visible.length <= limit) return visible
  return visible.slice(visible.length - limit)
}
