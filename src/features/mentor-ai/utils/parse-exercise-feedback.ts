import type { MentorExerciseResultFeedback } from '@/types/mentor-ai'

import { MentorExerciseResultFeedbackSchema } from '../schemas/mentor-exercise-feedback-schema'
import { extractJsonObject } from './extract-json-object'

export const parseExerciseFeedback = (raw: string): MentorExerciseResultFeedback | null => {
  const text = raw.trim()
  if (!text) return null

  try {
    const json = extractJsonObject(text)
    const parsed = MentorExerciseResultFeedbackSchema.safeParse(json)
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}
