import type { MentorRoleplayFeedback } from '@/types/mentor-ai'

import { MentorRoleplayFeedbackSchema } from '../schemas/mentor-roleplay-feedback-schema'
import { extractJsonObject } from './extract-json-object'

export const parseRoleplayFeedback = (raw: string): MentorRoleplayFeedback | null => {
  const text = raw.trim()
  if (!text) return null

  try {
    const json = extractJsonObject(text)
    const parsed = MentorRoleplayFeedbackSchema.safeParse(json)
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}

export const buildHeuristicRoleplayFeedback = (
  userTurns: number,
  isInterview: boolean,
): MentorRoleplayFeedback => {
  const base = Math.min(5, 2 + Math.floor(userTurns / 2))

  return {
    clarity: {
      score: base,
      note: 'Mantenha respostas curtas e com estrutura: contexto → ação → resultado.',
    },
    vocabulary: {
      score: Math.max(1, base - 1),
      note: 'Inclua termos do cenário e evite traduzir palavra por palavra do português.',
    },
    grammar: {
      score: base,
      note: 'Revise tempos verbais e preposições antes de enviar cada resposta.',
    },
    technical: isInterview
      ? {
          score: base,
          note: 'Use exemplos concretos de projetos, trade-offs e métricas quando possível.',
        }
      : undefined,
    summary:
      userTurns >= 6
        ? 'Boa prática! Você completou uma simulação útil para speaking.'
        : 'Sessão curta — tente pelo menos 6 turnos para um feedback mais rico.',
    nextSteps: [
      'Grave-se respondendo em voz alta e compare com a resposta ideal.',
      'Anote 5 termos novos do cenário e revise no Baralho Vivo.',
    ],
  }
}
