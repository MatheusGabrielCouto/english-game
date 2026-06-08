import type { MentorExerciseSet } from '@/types/mentor-ai'

import { MentorExerciseSetSchema } from '../schemas/mentor-exercise-schema'
import { extractJsonObject } from './extract-json-object'

export const parseExerciseResponse = (raw: string): MentorExerciseSet | null => {
  const text = raw.trim()
  if (!text) return null

  try {
    const json = extractJsonObject(text)
    const parsed = MentorExerciseSetSchema.safeParse(json)
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}
