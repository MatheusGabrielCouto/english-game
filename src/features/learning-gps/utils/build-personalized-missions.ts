import { routes } from '@/constants'
import { LEARNING_SKILL_BY_KEY } from '@/features/learning-gps/constants/learning-skills'
import {
    buildGpsMentorPracticeHref,
    mapUnitKindToSkill,
    resolveGpsMentorPracticeLabel,
} from '@/features/mentor-ai/utils/resolve-gps-mentor-practice'
import {
    LearningSkillKey,
    LearningUnitStatus,
    type LearningCurriculumSnapshot,
    type LearningPersonalizedMission,
    type LearningSkillWeakness,
    type LearningWorldRecord,
} from '@/types/learning-gps'
import type { RoutineTodayItem } from '@/types/routine'

import { getSkillLabel } from './detect-skill-weaknesses'

const buildWeaknessMission = (
  weakness: LearningSkillWeakness,
  index: number,
): LearningPersonalizedMission => {
  const skill = LEARNING_SKILL_BY_KEY[weakness.skillKey]
  const title = `Reforçar ${getSkillLabel(weakness.skillKey)}`
  const description = `Sua ${skill.label.toLowerCase()} está ${weakness.gapPercent}% abaixo da média das outras skills.`
  const practiceInput = {
    skillKey: weakness.skillKey,
    title,
    description,
  }

  return {
    id: `weakness-${weakness.skillKey}-${index}`,
    skillKey: weakness.skillKey,
    title,
    description,
    emoji: skill.emoji,
    practiceRoute: buildGpsMentorPracticeHref(practiceInput),
    practiceLabel: resolveGpsMentorPracticeLabel(practiceInput),
    source: 'weakness',
    priority: weakness.priority === 'high' ? 1 : 2,
  }
}

const buildCurriculumMission = (
  curriculum: LearningCurriculumSnapshot,
): LearningPersonalizedMission | null => {
  const active = curriculum.units.find(
    (unit) =>
      unit.progress.status === LearningUnitStatus.AVAILABLE ||
      unit.progress.status === LearningUnitStatus.IN_PROGRESS,
  )

  if (!active) return null

  const skillKey = mapUnitKindToSkill(active.kind)
  const practiceInput = {
    skillKey,
    title: active.title,
    description: active.description,
    unitKey: active.key,
    unitKind: active.kind,
  }

  return {
    id: `curriculum-${active.key}`,
    skillKey,
    title: active.title,
    description: active.description,
    emoji: active.emoji,
    practiceRoute: buildGpsMentorPracticeHref(practiceInput),
    practiceLabel: resolveGpsMentorPracticeLabel(practiceInput),
    source: 'world',
    priority: 0,
  }
}

const buildRoutineMission = (item: RoutineTodayItem): LearningPersonalizedMission | null => {
  if (item.completed) return null

  return {
    id: `routine-${item.routine.id}`,
    skillKey: LearningSkillKey.VOCABULARY,
    title: item.routine.name,
    description: item.routine.description ?? 'Sua rotina fixa de hoje.',
    emoji: '📋',
    practiceRoute: routes.routines,
    practiceLabel: 'Ver rotina',
    source: 'routine',
    priority: 3,
  }
}

export const buildPersonalizedMissions = (input: {
  weaknesses: LearningSkillWeakness[]
  curriculum: LearningCurriculumSnapshot | null
  todayRoutines: RoutineTodayItem[]
  world: LearningWorldRecord
}): LearningPersonalizedMission[] => {
  const missions: LearningPersonalizedMission[] = []

  const curriculumMission = input.curriculum ? buildCurriculumMission(input.curriculum) : null
  if (curriculumMission) missions.push(curriculumMission)

  input.weaknesses.slice(0, 2).forEach((weakness, index) => {
    missions.push(buildWeaknessMission(weakness, index))
  })

  input.todayRoutines
    .filter((item) => !item.completed)
    .slice(0, 2)
    .forEach((item) => {
      const mission = buildRoutineMission(item)
      if (mission) missions.push(mission)
    })

  return missions
    .sort((left, right) => left.priority - right.priority)
    .slice(0, 5)
}
