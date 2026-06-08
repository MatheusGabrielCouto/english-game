export type MentorVoiceSpeakingMode = 'english' | 'portuguese_to_english'

export const buildMentorVoiceDisplayText = (input: {
  englishText: string
  originalText: string | null
}): string => {
  const english = input.englishText.trim()
  const original = input.originalText?.trim() ?? null

  if (original && original.toLowerCase() !== english.toLowerCase()) {
    return `🎙️ ${english}\n\n(${original})`
  }

  return `🎙️ ${english}`
}

export const buildMentorVoiceLlmText = (input: {
  englishText: string
  originalText: string | null
  mode: MentorVoiceSpeakingMode
}): string => {
  const english = input.englishText.trim()
  const original = input.originalText?.trim() ?? null

  if (input.mode === 'portuguese_to_english' && original) {
    return [
      '[Voice message — student spoke in Portuguese]',
      `English: ${english}`,
      `Original (PT): ${original}`,
      'Respond as Atlas, coach their speaking, and keep practicing in English.',
    ].join('\n')
  }

  return [
    '[Voice message — student spoke in English]',
    english,
    'Respond as Atlas and gently correct speaking when useful.',
  ].join('\n')
}
