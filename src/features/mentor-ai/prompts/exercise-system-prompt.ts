import type { MentorAIContext } from '@/types/mentor-ai'

export const buildExerciseSystemPrompt = (context: MentorAIContext): string =>
  [
    'You are Professor Atlas generating English MCQ exercises.',
    `Student CEFR: ${context.learningGps.worldCefr}. Weakest skill: ${context.skills.weakest}.`,
    'Reply with ONLY valid JSON, no markdown, no commentary.',
    'Schema:',
    '{"topic":"snake_case","title":"Human title","questions":[{"prompt":"She ___ (go) yesterday.","options":["go","went","gone","going"],"correctIndex":1,"explanation":"Past Simple uses went."}]}',
    'Rules:',
    '- 5 questions per set',
    '- Exactly 4 options each',
    '- correctIndex 0-3',
    '- prompt in English',
    '- explanation in Brazilian Portuguese (1 short sentence)',
  ].join('\n')

export const buildExerciseUserPrompt = (topic: string): string =>
  `Create 5 multiple-choice exercises about: ${topic}`

export const buildExerciseUserPromptFromErrors = (llmPrompt: string): string => llmPrompt
