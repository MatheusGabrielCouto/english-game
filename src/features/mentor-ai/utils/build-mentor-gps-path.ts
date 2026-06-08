import {
    LearningWorldKey,
    type LearningIntelligenceSnapshot,
    type LearningPersonalizedMission,
    type LearningWorldKeyValue,
    type LearningWorldRecord,
} from '@/types/learning-gps'
import type { MentorGpsPathSnapshot } from '@/types/mentor-ai'

import {
    WORLD_PROGRESSION_ORDER,
    getNextWorldKey,
} from '@/features/learning-gps/utils/world-progression'

const ADVANCED_MILESTONE_KEY = LearningWorldKey.GLOBAL_ENGINEER
const MASTERY_TARGET_KEY = LearningWorldKey.LEGEND

const resolveAdvancedTarget = (
  currentWorldKey: LearningWorldKeyValue,
  worlds: LearningWorldRecord[],
): { targetKey: LearningWorldKeyValue; worldsUntil: number } => {
  const currentIndex = WORLD_PROGRESSION_ORDER.indexOf(currentWorldKey)
  const advancedIndex = WORLD_PROGRESSION_ORDER.indexOf(ADVANCED_MILESTONE_KEY)
  const masteryIndex = WORLD_PROGRESSION_ORDER.indexOf(MASTERY_TARGET_KEY)

  if (currentIndex < 0) {
    return { targetKey: ADVANCED_MILESTONE_KEY, worldsUntil: advancedIndex }
  }

  if (currentIndex < advancedIndex) {
    return { targetKey: ADVANCED_MILESTONE_KEY, worldsUntil: advancedIndex - currentIndex }
  }

  if (currentIndex < masteryIndex) {
    return { targetKey: MASTERY_TARGET_KEY, worldsUntil: masteryIndex - currentIndex }
  }

  return { targetKey: MASTERY_TARGET_KEY, worldsUntil: 0 }
}

const missionToSnapshot = (
  mission: LearningPersonalizedMission | null | undefined,
): MentorGpsPathSnapshot['topMission'] => {
  if (!mission) return null

  return {
    title: mission.title,
    description: mission.description,
    emoji: mission.emoji,
    route: mission.practiceRoute,
    label: mission.practiceLabel,
    skillKey: mission.skillKey,
  }
}

const buildPathSummary = (input: {
  currentWorldName: string
  currentCefr: string
  targetWorldName: string
  targetCefr: string
  worldsUntil: number
  nextWorldName: string | null
  topMissionTitle: string | null
}): string => {
  if (input.worldsUntil <= 0) {
    return `Você está no ápice do GPS (${input.currentWorldName}, ${input.currentCefr}). O Atlas ajuda a manter fluência e precisão.`
  }

  const steps =
    input.worldsUntil === 1
      ? `1 mundo até ${input.targetWorldName} (${input.targetCefr})`
      : `${input.worldsUntil} mundos até ${input.targetWorldName} (${input.targetCefr})`

  const nextHint = input.nextWorldName
    ? ` Próximo passo: ${input.nextWorldName}.`
    : ''

  const missionHint = input.topMissionTitle
    ? ` Missão de hoje: ${input.topMissionTitle}.`
    : ''

  return `Trilha GPS: ${input.currentWorldName} (${input.currentCefr}) → ${steps}.${nextHint}${missionHint}`
}

export const buildMentorGpsPath = (input: {
  world: LearningWorldRecord
  worlds: LearningWorldRecord[]
  intelligence: LearningIntelligenceSnapshot | null
}): MentorGpsPathSnapshot => {
  const { targetKey, worldsUntil } = resolveAdvancedTarget(input.world.key, input.worlds)
  const targetWorld = input.worlds.find((entry) => entry.key === targetKey)
  const nextWorldKey = getNextWorldKey(input.world.key)
  const nextWorld = nextWorldKey
    ? input.worlds.find((entry) => entry.key === nextWorldKey)
    : null

  const topMission = input.intelligence?.missions[0] ?? null
  const todayPlan = input.intelligence?.weeklyPlan.days.find((day) => day.isToday)
  const monthlyGoals = input.intelligence?.monthlyReport.goals ?? []

  const pathSummary = buildPathSummary({
    currentWorldName: input.world.name,
    currentCefr: input.world.cefrLevel,
    targetWorldName: targetWorld?.name ?? 'Global Engineer',
    targetCefr: targetWorld?.cefrLevel ?? 'C1',
    worldsUntil,
    nextWorldName: nextWorld?.name ?? null,
    topMissionTitle: topMission?.title ?? null,
  })

  return {
    nextWorldName: nextWorld?.name ?? null,
    nextWorldCefr: nextWorld?.cefrLevel ?? null,
    worldsUntilAdvanced: worldsUntil,
    advancedTargetWorld: targetWorld?.name ?? 'Global Engineer',
    advancedTargetCefr: targetWorld?.cefrLevel ?? 'C1',
    topMission: missionToSnapshot(topMission),
    weeklyProjectTitle: input.intelligence?.weeklyPlan.projectTitle ?? null,
    isSpeakingDay: todayPlan?.isSpeakingDay ?? false,
    monthlyGoals,
    pathSummary,
  }
}
