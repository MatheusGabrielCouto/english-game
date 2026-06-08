import { routes } from '@/constants/routes'
import { LEARNING_SKILL_BY_KEY } from '@/features/learning-gps/constants/learning-skills'
import { getSkillLabel } from '@/features/learning-gps/utils/detect-skill-weaknesses'
import { LearningSkillKey, type LearningSkillWeakness } from '@/types/learning-gps'
import type {
    MentorAIContext,
    MentorGpsMissionSnapshot,
    MentorRecommendation,
    MentorRecommendationAction,
} from '@/types/mentor-ai'

import {
    buildMemoryRecommendationLead,
    shouldPrioritizeInterviewPractice,
} from '../utils/format-memory-recall'

const SKILL_ACTIONS: Record<string, Omit<MentorRecommendationAction, 'id'>> = {
  vocabulary: { label: 'Vocabulário com o Atlas', emoji: '📝', route: routes.mentor.exercise },
  reading: { label: 'Estudar leitura com o Atlas', emoji: '📖', route: routes.mentor.chat },
  listening: { label: 'Estudar listening com o Atlas', emoji: '🎧', route: routes.mentor.chat },
  speaking: { label: 'Roleplay de conversação', emoji: '🗣️', route: routes.mentor.roleplay },
  writing: { label: 'Escrever com o Atlas', emoji: '✍️', route: routes.mentor.correct },
  grammar: { label: 'Exercícios de gramática', emoji: '📐', route: routes.mentor.exercise },
}

const buildSkillSummary = (weaknesses: LearningSkillWeakness[]): string => {
  if (weaknesses.length === 0) {
    return 'Suas skills estão equilibradas. Mantenha a rotina do GPS e explore o chat com o Atlas.'
  }

  const high = weaknesses.filter((weakness) => weakness.priority === 'high')
  if (high.length >= 2) {
    const labels = high.map((weakness) => getSkillLabel(weakness.skillKey).toLowerCase())
    return `Seu ${labels[0]} e ${labels[1]} estão bem abaixo das outras habilidades.`
  }

  const top = high[0] ?? weaknesses[0]
  const skill = LEARNING_SKILL_BY_KEY[top.skillKey]
  return `Sua ${skill.label.toLowerCase()} está ${top.gapPercent}% abaixo da média — priorize isso esta semana.`
}

const resolveSpeakingMissionRoute = (mission: NonNullable<MentorGpsMissionSnapshot>) => {
  if (mission.skillKey !== LearningSkillKey.SPEAKING) return mission
  return {
    ...mission,
    route: routes.mentor.roleplay,
    label: 'Roleplay com o Atlas',
  }
}

const buildGpsMissionAction = (
  mission: NonNullable<MentorGpsMissionSnapshot>,
): MentorRecommendationAction => {
  const resolved = resolveSpeakingMissionRoute(mission)
  return {
    id: 'rec-gps-mission',
    label: resolved.label,
    emoji: resolved.emoji,
    route: resolved.route,
  }
}

const buildInsightSummary = (
  weaknesses: LearningSkillWeakness[],
  memory?: MentorAIContext['memory'],
): string => {
  const skillSummary = buildSkillSummary(weaknesses)
  const memoryLead = memory ? buildMemoryRecommendationLead(memory) : null

  if (!memoryLead) return skillSummary

  if (shouldPrioritizeInterviewPractice(memory)) {
    return `${memoryLead} Para isso, reforce speaking com roleplay e entrevistas.`
  }

  return `${memoryLead} ${skillSummary.charAt(0).toLowerCase()}${skillSummary.slice(1)}`
}

const buildSummary = (
  weaknesses: LearningSkillWeakness[],
  memory?: MentorAIContext['memory'],
  context?: Pick<MentorAIContext, 'learningGps' | 'farm' | 'motivation'>,
): string => {
  const parts: string[] = []

  if (context?.learningGps.path.pathSummary) {
    parts.push(context.learningGps.path.pathSummary)
  }

  const skillSummary = buildSkillSummary(weaknesses)
  const memoryLead = memory ? buildMemoryRecommendationLead(memory) : null

  if (memoryLead) {
    if (shouldPrioritizeInterviewPractice(memory)) {
      parts.push(`${memoryLead} Para isso, reforce speaking com roleplay e entrevistas.`)
    } else {
      parts.push(`${memoryLead} ${skillSummary.charAt(0).toLowerCase()}${skillSummary.slice(1)}`)
    }
  } else if (parts.length === 0) {
    parts.push(skillSummary)
  } else {
    parts.push(skillSummary.charAt(0).toLowerCase() + skillSummary.slice(1))
  }

  if (context?.farm.coachMessage) {
    parts.push(context.farm.coachMessage)
  }

  if (context?.motivation.coachMessage) {
    parts.push(context.motivation.coachMessage)
  }

  return parts.join(' ')
}

const prioritizeActionsForMemory = (
  actions: MentorRecommendationAction[],
  memory?: MentorAIContext['memory'],
): MentorRecommendationAction[] => {
  if (!memory || !shouldPrioritizeInterviewPractice(memory)) return actions

  const roleplay = actions.find((action) => action.route === routes.mentor.roleplay)
  if (!roleplay) {
    return [
      {
        id: 'rec-roleplay-memory',
        label: 'Simular entrevista técnica',
        emoji: '🎭',
        route: routes.mentor.roleplay,
      },
      ...actions,
    ]
  }

  return [roleplay, ...actions.filter((action) => action.id !== roleplay.id)]
}

const dedupeActions = (actions: MentorRecommendationAction[]): MentorRecommendationAction[] => {
  const seen = new Set<string>()
  return actions.filter((action) => {
    const key = `${action.route}:${action.label}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export const MentorRecommendationService = {
  build(
    weaknesses: LearningSkillWeakness[],
    memory?: MentorAIContext['memory'],
    context?: Pick<MentorAIContext, 'learningGps' | 'farm' | 'motivation'>,
  ): MentorRecommendation {
    const prioritized = weaknesses.slice(0, 3)
    let actions: MentorRecommendationAction[] = prioritized.map((weakness, index) => {
      const template = SKILL_ACTIONS[weakness.skillKey] ?? SKILL_ACTIONS.vocabulary
      return {
        id: `rec-${weakness.skillKey}-${index}`,
        ...template,
      }
    })

    const topMission = context?.learningGps.path.topMission
    if (topMission) {
      actions = [buildGpsMissionAction(topMission), ...actions]
    }

    const farmAction: MentorRecommendationAction | null = context?.farm.suggestedActivityLabel
      ? {
          id: 'rec-farm-bridge',
          label: context.farm.suggestedActivityLabel,
          emoji: context.farm.suggestedActivityEmoji ?? '🌾',
          route: context.farm.suggestedRoute,
        }
      : null

    if (farmAction) {
      actions = dedupeActions([...actions, farmAction])
    }

    if (actions.length === 0) {
      actions.push({
        id: 'rec-chat',
        label: 'Perguntar ao Professor Atlas',
        emoji: '🎓',
        route: routes.mentor.chat,
      })
    }

    actions = prioritizeActionsForMemory(actions, memory)

    return {
      summary: buildSummary(weaknesses, memory, context),
      insightSummary: buildInsightSummary(weaknesses, memory),
      actions,
    }
  },
}
