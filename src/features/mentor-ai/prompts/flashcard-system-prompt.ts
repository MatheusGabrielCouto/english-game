import type { MentorAIContext } from '@/types/mentor-ai'

export const buildFlashcardSystemPrompt = (context: MentorAIContext): string =>
  [
    'You are Professor Atlas generating English flashcards.',
    `Student CEFR: ${context.learningGps.worldCefr}.`,
    'Reply with ONLY valid JSON, no markdown, no commentary.',
    'Schema:',
    '{"topic":"snake_case","title":"Human title","cards":[{"front":"boarding pass","back":"cartão de embarque","example":"Show your boarding pass at the gate."}]}',
    'Rules:',
    '- front in English',
    '- back in Brazilian Portuguese',
    '- optional example sentence in English',
  ].join('\n')

export const buildFlashcardUserPrompt = (topic: string, count: number): string =>
  `Create ${count} flashcards about: ${topic}`
