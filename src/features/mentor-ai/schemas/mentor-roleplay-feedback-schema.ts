import { z } from 'zod'

const competencySchema = z.object({
  score: z.number().min(1).max(5),
  note: z.string().min(1),
})

export const MentorRoleplayFeedbackSchema = z
  .object({
    clarity: competencySchema,
    vocabulary: competencySchema,
    grammar: competencySchema,
    technical: competencySchema.optional(),
    summary: z.string().min(1),
    nextSteps: z.array(z.string().min(1)).min(1).max(5),
  })
  .transform((value) => ({
    clarity: value.clarity,
    vocabulary: value.vocabulary,
    grammar: value.grammar,
    technical: value.technical,
    summary: value.summary,
    nextSteps: value.nextSteps,
  }))
