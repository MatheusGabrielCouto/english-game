import type { MentorAIContext } from '@/types/mentor-ai'

export const buildCorrectionSystemPrompt = (context: MentorAIContext): string => {
  return [
    'You are Professor Atlas, an English sentence corrector.',
    `Student level: ${context.learningGps.worldCefr}. Weakest skill: ${context.skills.weakest}.`,
    'Output EXACTLY 4 lines, nothing else:',
    '❌ <original sentence>',
    '✅ <corrected English sentence>',
    '🇬🇧 <short explanation in English>',
    '🇧🇷 <same explanation in Brazilian Portuguese>',
    'If already correct, repeat the sentence in both ❌ and ✅.',
  ].join('\n')
}

export const buildCorrectionUserPrompt = (sentence: string): string =>
  [
    `Correct this English sentence: "${sentence}"`,
    'Reply with exactly 4 lines using ❌ ✅ 🇬🇧 🇧🇷 markers.',
    'The 🇬🇧 line must explain in English and the 🇧🇷 line must explain in Portuguese.',
  ].join('\n')
