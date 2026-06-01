import { z } from 'zod';

export const McqPromptSchema = z.object({
  stem: z.string().min(1),
  choices: z.array(z.string().min(1)).length(4),
  correctIndex: z.number().int().min(0).max(3),
  hint: z.string().optional(),
});

export const McqQuestionSchema = z.object({
  id: z.string().min(1),
  type: z.enum([
    'mcq_meaning',
    'mcq_translation',
    'mcq_grammar',
    'mcq_cloze',
    'mcq_register',
    'mcq_collocation',
    'mcq_inference',
  ]),
  lemma: z.string().optional(),
  patent: z.string().min(1),
  theme: z.string().optional(),
  prompt: McqPromptSchema,
});

export const McqQuestionPackSchema = z.object({
  version: z.number().int().positive(),
  packKey: z.string().min(1),
  patent: z.string().min(1),
  theme: z.string().optional(),
  questions: z.array(McqQuestionSchema),
});
