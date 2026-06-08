import { z } from 'zod'

export const MentorExerciseQuestionSchema = z.object({
  prompt: z.string().min(1),
  options: z.array(z.string().min(1)).min(2).max(6),
  correctIndex: z.number().int().min(0),
  explanation: z.string().min(1),
})

export const MentorExerciseSetSchema = z
  .object({
    topic: z.string().min(1),
    title: z.string().min(1).optional(),
    questions: z.array(MentorExerciseQuestionSchema).min(1).max(10),
  })
  .superRefine((value, ctx) => {
    value.questions.forEach((question, index) => {
      if (question.correctIndex >= question.options.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `correctIndex out of range at question ${index}`,
          path: ['questions', index, 'correctIndex'],
        })
      }
    })
  })
  .transform((value) => ({
    topic: value.topic,
    title: value.title ?? value.topic,
    questions: value.questions,
  }))

export type MentorExerciseSetParsed = z.infer<typeof MentorExerciseSetSchema>
