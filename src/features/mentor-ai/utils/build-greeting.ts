import { LEARNING_SKILL_BY_KEY } from '@/features/learning-gps/constants/learning-skills'
import type { LearningSkillKeyValue } from '@/types/learning-gps'
import type { MentorGreeting, MentorMotivationBridgeSnapshot } from '@/types/mentor-ai'

export const buildMentorGreeting = (input: {
  streak: number
  weakestSkill: LearningSkillKeyValue
  worldName: string
  worldCefr: string
  worldsUntilAdvanced?: number
  advancedTargetWorld?: string
  topMissionTitle?: string | null
  motivation?: Pick<MentorMotivationBridgeSnapshot, 'dailySparkTitle' | 'openedToday' | 'openStreak'>
}): MentorGreeting => {
  const skill = LEARNING_SKILL_BY_KEY[input.weakestSkill]

  const headline = (() => {
    if (input.streak >= 30) {
      return `${input.streak} dias de sequência`
    }
    if (input.streak >= 7) {
      return `Hoje: ${skill.label.toLowerCase()}`
    }
    return `Foco em ${skill.label.toLowerCase()}`
  })()

  const gpsParts: string[] = [
    `GPS ${input.worldName} (${input.worldCefr})`,
    `reforço em ${skill.label.toLowerCase()}`,
  ]

  if (input.topMissionTitle) {
    gpsParts.push(`missão: ${input.topMissionTitle}`)
  }

  if (
    input.worldsUntilAdvanced != null &&
    input.worldsUntilAdvanced > 0 &&
    input.advancedTargetWorld
  ) {
    gpsParts.push(
      `${input.worldsUntilAdvanced} ${input.worldsUntilAdvanced === 1 ? 'mundo' : 'mundos'} → ${input.advancedTargetWorld}`,
    )
  }

  if (input.motivation?.dailySparkTitle && !input.motivation.openedToday) {
    gpsParts.push(`chama: ${input.motivation.dailySparkTitle}`)
  }

  return {
    headline,
    subtitle: gpsParts.join(' · '),
  }
}
