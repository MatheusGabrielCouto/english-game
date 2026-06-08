import type { MentorAIContext } from '@/types/mentor-ai'

const GOAL_INTENT_PREFIX =
  /^(quero|preciso|gostaria de|sonho em|pretendo|busco|procuro|estudando inglês para|my goal is|i want to|i need to)/i

export const formatGoalRecall = (goal: string): string => {
  const trimmed = goal.trim()
  if (!trimmed) return ''

  if (GOAL_INTENT_PREFIX.test(trimmed)) {
    return `Atlas lembra: ${trimmed}`
  }

  return `Atlas lembra que você quer ${trimmed}`
}

export const formatPreferenceRecall = (preference: string): string => {
  const trimmed = preference.trim()
  if (!trimmed) return ''
  return `Foco em ${trimmed}`
}

const INTERNATIONAL_GOAL =
  /\b(vaga|emprego|job|trabalhar|trabalho|exterior|internacional|abroad|remote|canadá|canada|eua|usa|uk|europa)\b/i

const INTERVIEW_GOAL = /\b(entrevista|interview|frontend|backend|fullstack|devops|mobile)\b/i

export const buildMemoryRecommendationLead = (
  memory: MentorAIContext['memory'],
): string | null => {
  const primaryGoal = memory.goals[0]
  if (primaryGoal) {
    return formatGoalRecall(primaryGoal)
  }

  const primaryPreference = memory.preferences[0]
  if (primaryPreference) {
    return `Atlas ajusta o plano com foco em ${primaryPreference}.`
  }

  return null
}

export const shouldPrioritizeInterviewPractice = (memory: MentorAIContext['memory']): boolean => {
  const combined = [...memory.goals, ...memory.preferences].join(' ').toLowerCase()
  return INTERNATIONAL_GOAL.test(combined) || INTERVIEW_GOAL.test(combined)
}

export const hasMemoryRecall = (memory: MentorAIContext['memory']): boolean =>
  memory.goals.length > 0 || memory.preferences.length > 0
