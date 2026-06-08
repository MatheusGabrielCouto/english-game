import type { MentorFlashcardSet } from '@/types/mentor-ai'

import { MentorFlashcardSetSchema } from '../schemas/mentor-flashcard-schema'
import { extractJsonObject } from './extract-json-object'

export const parseFlashcardResponse = (raw: string): MentorFlashcardSet | null => {
  const text = raw.trim()
  if (!text) return null

  try {
    const json = extractJsonObject(text)
    const parsed = MentorFlashcardSetSchema.safeParse(json)
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}
