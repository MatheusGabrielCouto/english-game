import {
    LearningUnitKind,
    LearningUnitStatus,
    type LearningCurriculumUnitDefinition,
    type LearningCurriculumUnitView,
    type LearningUnitProgressRecord,
} from '@/types/learning-gps'

export const mergeCurriculumUnits = (
  units: LearningCurriculumUnitDefinition[],
  progressRows: LearningUnitProgressRecord[],
): LearningCurriculumUnitView[] => {
  const byKey = new Map(progressRows.map((row) => [row.unitKey, row]))

  return units.map((unit) => {
    const progress = byKey.get(unit.key)
    return {
      ...unit,
      progress:
        progress ??
        ({
          unitKey: unit.key,
          worldKey: unit.worldKey,
          status: LearningUnitStatus.LOCKED,
          practiceProgress: 0,
          completedAt: null,
          updatedAt: new Date().toISOString(),
        } satisfies LearningUnitProgressRecord),
    }
  })
}

export const computeWorldProgressFromUnits = (units: LearningCurriculumUnitView[]): number => {
  if (units.length === 0) return 0
  const completed = units.filter(
    (unit) => unit.progress.status === LearningUnitStatus.COMPLETED,
  ).length
  return Math.min(100, Math.round((completed / units.length) * 100))
}

export const applyPracticeCredit = (
  unit: LearningCurriculumUnitDefinition,
  progress: LearningUnitProgressRecord,
  amount: number,
): { progress: LearningUnitProgressRecord; completed: boolean } => {
  if (
    progress.status === LearningUnitStatus.LOCKED ||
    progress.status === LearningUnitStatus.COMPLETED
  ) {
    return { progress, completed: false }
  }

  const nextProgress = Math.min(
    unit.requiredPracticeAmount,
    progress.practiceProgress + amount,
  )
  const completed = nextProgress >= unit.requiredPracticeAmount
  const completedAt = completed ? progress.completedAt ?? new Date().toISOString() : null

  return {
    progress: {
      ...progress,
      status: completed
        ? LearningUnitStatus.COMPLETED
        : LearningUnitStatus.IN_PROGRESS,
      practiceProgress: nextProgress,
      completedAt,
      updatedAt: new Date().toISOString(),
    },
    completed,
  }
}

export const unlockNextUnit = (
  units: LearningCurriculumUnitView[],
  completedUnitKey: string,
): LearningUnitProgressRecord | null => {
  const index = units.findIndex((unit) => unit.key === completedUnitKey)
  if (index < 0 || index >= units.length - 1) return null

  const next = units[index + 1]
  if (next.progress.status !== LearningUnitStatus.LOCKED) return null

  return {
    ...next.progress,
    status: LearningUnitStatus.AVAILABLE,
    updatedAt: new Date().toISOString(),
  }
}

export const isCheckpointUnit = (unit: LearningCurriculumUnitDefinition): boolean =>
  unit.kind === LearningUnitKind.CHECKPOINT
