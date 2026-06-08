export const buildSessionTitle = (firstUserMessage: string): string => {
  const trimmed = firstUserMessage.trim().replace(/\s+/g, ' ')
  if (!trimmed) return 'Conversa com o Atlas'
  if (trimmed.length <= 48) return trimmed
  return `${trimmed.slice(0, 45)}…`
}
