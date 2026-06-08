import { routes } from '@/constants'
import { LEARNING_SKILL_BY_KEY } from '@/features/learning-gps/constants/learning-skills'
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

const SKILL_ROUTES: Record<string, { route: string; label: string }> = {
  vocabulary: { route: routes.farm, label: 'Praticar no Farm' },
  reading: { route: routes.farm, label: 'Ler no Farm' },
  listening: { route: routes.farm, label: 'Ouvir no Farm' },
  speaking: { route: routes.farm, label: 'Conversar no Farm' },
  writing: { route: routes.englishJournal, label: 'Escrever no Journal' },
  grammar: { route: routes.duels, label: 'Duelo de gramática' },
}

const buildWeaknessMission = (
  weakness: LearningSkillWeakness,
  index: number,
): LearningPersonalizedMission => {
  const skill = LEARNING_SKILL_BY_KEY[weakness.skillKey]
  const route = SKILL_ROUTES[weakness.skillKey]

  return {
    id: `weakness-${weakness.skillKey}-${index}`,
    skillKey: weakness.skillKey,
    title: `Reforçar ${getSkillLabel(weakness.skillKey)}`,
    description: `Sua ${skill.label.toLowerCase()} está ${weakness.gapPercent}% abaixo da média das outras skills.`,
    emoji: skill.emoji,
    practiceRoute: route.route,
    practiceLabel: route.label,
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

  return {
    id: `curriculum-${active.key}`,
    skillKey:
      active.kind === 'grammar'
        ? LearningSkillKey.GRAMMAR
        : active.kind === 'speaking'
          ? LearningSkillKey.SPEAKING
          : LearningSkillKey.VOCABULARY,
    title: active.title,
    description: active.description,
    emoji: active.emoji,
    practiceRoute: active.practiceRoute,
    practiceLabel: active.practiceLabel,
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
