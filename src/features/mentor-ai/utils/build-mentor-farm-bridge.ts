import { getSkillLabel } from '@/features/learning-gps/utils/detect-skill-weaknesses'
import { FarmActivityType, type FarmActivityTypeValue, type FarmSessionRecord } from '@/types/farm'
import { LearningSkillKey, type LearningSkillKeyValue } from '@/types/learning-gps'
import type { MentorFarmBridgeSnapshot } from '@/types/mentor-ai'

import {
    buildGpsMentorPracticeHref,
    resolveGpsMentorPracticeLabel,
} from './resolve-gps-mentor-practice'

const SKILL_TO_FARM: Record<LearningSkillKeyValue, FarmActivityTypeValue> = {
  [LearningSkillKey.VOCABULARY]: FarmActivityType.VOCABULARY,
  [LearningSkillKey.READING]: FarmActivityType.READING,
  [LearningSkillKey.LISTENING]: FarmActivityType.LISTENING,
  [LearningSkillKey.SPEAKING]: FarmActivityType.SPEAKING,
  [LearningSkillKey.WRITING]: FarmActivityType.READING,
  [LearningSkillKey.GRAMMAR]: FarmActivityType.EXERCISE,
}

const summarizeRecentFarm = (sessions: FarmSessionRecord[], dateKey: string): string | null => {
  const todaySessions = sessions.filter((session) => session.recordedAt.startsWith(dateKey))
  if (todaySessions.length === 0) return null

  const totals = new Map<FarmActivityTypeValue, number>()
  for (const session of todaySessions) {
    totals.set(session.activityType, (totals.get(session.activityType) ?? 0) + session.amount)
  }

  return `${todaySessions.length} sessão${todaySessions.length === 1 ? '' : 'ões'} no Farm hoje`
}

const buildCoachMessage = (input: {
  weakestSkill: LearningSkillKeyValue
  minutesToday: number
  skillLabel: string
  isSpeakingDay: boolean
}): string => {
  const skillLabel = input.skillLabel

  if (input.weakestSkill === LearningSkillKey.SPEAKING || input.isSpeakingDay) {
    return `O GPS pede ${skillLabel}. Abra o roleplay do Atlas — a sessão conta no plano.`
  }

  if (input.minutesToday > 0) {
    return `Você já fez ${input.minutesToday} min no Farm. Complete o plano do GPS com exercícios ou chat no Atlas.`
  }

  return `Estude o plano do GPS com o Atlas: foco em ${skillLabel} agora.`
}

export const buildMentorFarmBridge = (input: {
  weakestSkill: LearningSkillKeyValue
  farmMinutesToday: number
  recentSessions: FarmSessionRecord[]
  dateKey: string
  isSpeakingDay: boolean
  gpsMissionTitle?: string | null
}): MentorFarmBridgeSnapshot => {
  const skillLabel = getSkillLabel(input.weakestSkill).toLowerCase()
  const title = input.gpsMissionTitle ?? `Reforçar ${getSkillLabel(input.weakestSkill)}`
  const practiceInput = {
    skillKey: input.weakestSkill,
    title,
    description: `Plano do GPS · ${skillLabel}`,
  }

  const suggestedRoute = buildGpsMentorPracticeHref(practiceInput)
  const suggestedLabel = resolveGpsMentorPracticeLabel(practiceInput)
  const farmKey = SKILL_TO_FARM[input.weakestSkill] ?? FarmActivityType.VOCABULARY

  return {
    suggestedActivityKey: farmKey,
    suggestedActivityLabel: suggestedLabel,
    suggestedActivityEmoji: '🎓',
    suggestedRoute,
    minutesToday: input.farmMinutesToday,
    recentSummary: summarizeRecentFarm(input.recentSessions, input.dateKey),
    coachMessage: buildCoachMessage({
      weakestSkill: input.weakestSkill,
      minutesToday: input.farmMinutesToday,
      skillLabel,
      isSpeakingDay: input.isSpeakingDay,
    }),
  }
}
