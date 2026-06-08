import { z } from 'zod'

export const MentorExerciseResultFeedbackSchema = z.object({
  summary: z.string().min(1),
  weaknesses: z.array(z.string().min(1)).max(8),
  improvements: z.array(z.string().min(1)).min(1).max(5),
})
