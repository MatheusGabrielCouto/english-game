import { z } from 'zod'

export const MentorGeneratedFlashcardSchema = z.object({
  front: z.string().min(1),
  back: z.string().min(1),
  example: z.string().optional(),
})

export const MentorFlashcardSetSchema = z
  .object({
    topic: z.string().min(1),
    title: z.string().min(1).optional(),
    cards: z.array(MentorGeneratedFlashcardSchema).min(1).max(30),
  })
  .transform((value) => ({
    topic: value.topic,
    title: value.title ?? value.topic,
    cards: value.cards,
  }))

export type MentorFlashcardSetParsed = z.infer<typeof MentorFlashcardSetSchema>
