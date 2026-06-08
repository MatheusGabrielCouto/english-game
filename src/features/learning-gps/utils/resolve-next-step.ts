import { LEARNING_SKILL_BY_KEY } from '@/features/learning-gps/constants/learning-skills'
import {
    LearningUnitStatus,
    type DailyStudyBlock,
    type LearningCurriculumSnapshot,
    type LearningIntelligenceSnapshot,
    type LearningPersonalizedMission,
} from '@/types/learning-gps'

export type LearningGpsNextStep =
  | {
      kind: 'mission'
      title: string
      description: string
      emoji: string
      ctaLabel: string
      route: string
      mission: LearningPersonalizedMission
    }
  | {
      kind: 'unit'
      title: string
      description: string
      emoji: string
      ctaLabel: string
      route: string
      unitKey: string
    }
  | {
      kind: 'block'
      title: string
      description: string
      emoji: string
      ctaLabel: string
      route: string
      blockId: string
    }
  | {
      kind: 'done'
      title: string
      description: string
      emoji: string
    }

export const resolveNextStep = (input: {
  intelligence: LearningIntelligenceSnapshot
  curriculum: LearningCurriculumSnapshot | null
  todayBlocks: DailyStudyBlock[]
}): LearningGpsNextStep => {
  const topMission = input.intelligence.missions[0]
  if (topMission) {
    return {
      kind: 'mission',
      title: topMission.title,
      description: topMission.description,
      emoji: topMission.emoji,
      ctaLabel: topMission.practiceLabel,
      route: topMission.practiceRoute,
      mission: topMission,
    }
  }

  const activeUnit = input.curriculum?.units.find(
    (unit) =>
      unit.progress.status === LearningUnitStatus.AVAILABLE ||
      unit.progress.status === LearningUnitStatus.IN_PROGRESS,
  )

  if (activeUnit) {
    return {
      kind: 'unit',
      title: activeUnit.title,
      description: activeUnit.description,
      emoji: activeUnit.emoji,
      ctaLabel: activeUnit.practiceLabel,
      route: activeUnit.practiceRoute,
      unitKey: activeUnit.key,
    }
  }

  const nextBlock = input.todayBlocks.find((block) => !block.completed)
  if (nextBlock) {
    const skill = LEARNING_SKILL_BY_KEY[nextBlock.skillKey]
    return {
      kind: 'block',
      title: nextBlock.label,
      description: `${nextBlock.progressMinutes}/${nextBlock.minutes} min do plano de hoje`,
      emoji: nextBlock.emoji,
      ctaLabel: 'Estudar no Farm',
      route: '/farm',
      blockId: nextBlock.id,
    }
  }

  return {
    kind: 'done',
    title: 'Plano de hoje concluído',
    description: 'Ótimo trabalho! Volte amanhã ou explore a trilha do seu mundo.',
    emoji: '🌟',
  }
}

export const countTodayPending = (input: {
  todayBlocks: DailyStudyBlock[]
  completedRoutinesCount: number
  totalRoutinesCount: number
}): number => {
  const pendingBlocks = input.todayBlocks.filter((block) => !block.completed).length
  const pendingRoutines = input.totalRoutinesCount - input.completedRoutinesCount
  return pendingBlocks + pendingRoutines
}
