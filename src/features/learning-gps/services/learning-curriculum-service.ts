import { getCurriculumForWorld } from '@/features/learning-gps/catalogs/curriculum-index'
import {
    applyPracticeCredit,
    computeWorldProgressFromUnits,
    isCheckpointUnit,
    mergeCurriculumUnits,
    unlockNextUnit,
} from '@/features/learning-gps/utils/curriculum-progress'
import { getNextWorldKey } from '@/features/learning-gps/utils/world-progression'
import { farmAmountToGpsMinutes } from '@/features/learning-gps/utils/map-farm-activity-to-gps'
import { GameEvents } from '@/services/game-events'
import { LearningCurriculumRepository } from '@/storage/repositories/learning-curriculum-repository'
import { LearningGpsRepository } from '@/storage/repositories/learning-gps-repository'
import type { FarmActivityTypeValue } from '@/types/farm'
import {
    LearningUnitKind,
    LearningUnitStatus,
    type LearningCurriculumSnapshot,
    type LearningWorldKeyValue,
} from '@/types/learning-gps'

const buildCurriculumSnapshot = async (
  worldKey: LearningWorldKeyValue,
): Promise<LearningCurriculumSnapshot | null> => {
  const units = getCurriculumForWorld(worldKey)
  if (units.length === 0) return null

  const progressRows = await LearningCurriculumRepository.listForWorld(worldKey)
  const merged = mergeCurriculumUnits(units, progressRows)
  const completedCount = merged.filter(
    (unit) => unit.progress.status === LearningUnitStatus.COMPLETED,
  ).length

  const checkpointCompleted = merged.some(
    (unit) =>
      unit.kind === LearningUnitKind.CHECKPOINT &&
      unit.progress.status === LearningUnitStatus.COMPLETED,
  )

  return {
    worldKey,
    units: merged,
    completedCount,
    totalCount: merged.length,
    checkpointCompleted,
  }
}

const syncWorldProgressFromCurriculum = async (
  worldKey: LearningWorldKeyValue,
): Promise<void> => {
  const snapshot = await buildCurriculumSnapshot(worldKey)
  if (!snapshot) return

  const profile = await LearningGpsRepository.getOrCreateProfile()
  const nextProgress = computeWorldProgressFromUnits(snapshot.units)
  if (profile.worldProgress !== nextProgress) {
    await LearningGpsRepository.updateProfile({ worldProgress: nextProgress })
  }
}

const advanceWorldIfCheckpoint = async (
  unitKey: string,
  worldKey: LearningWorldKeyValue,
): Promise<void> => {
  const units = getCurriculumForWorld(worldKey)
  const completedUnit = units.find((entry) => entry.key === unitKey)
  if (!completedUnit || !isCheckpointUnit(completedUnit)) return

  const nextWorldKey = getNextWorldKey(worldKey)
  if (!nextWorldKey) return

  await LearningGpsRepository.updateProfile({
    currentWorldKey: nextWorldKey,
    worldProgress: 0,
  })
  await LearningCurriculumRepository.ensureWorldSeeded(nextWorldKey)

  GameEvents.emit({
    type: 'LEARNING_WORLD_ADVANCED',
    fromWorldKey: worldKey,
    toWorldKey: nextWorldKey,
  })
}

const finalizeUnitCompletion = async (
  unitKey: string,
  worldKey: LearningWorldKeyValue,
): Promise<void> => {
  const units = getCurriculumForWorld(worldKey)
  const progressRows = await LearningCurriculumRepository.listForWorld(worldKey)
  const merged = mergeCurriculumUnits(units, progressRows)
  const nextUnlock = unlockNextUnit(merged, unitKey)

  if (nextUnlock) {
    await LearningCurriculumRepository.saveProgress(nextUnlock)
  }

  await syncWorldProgressFromCurriculum(worldKey)

  GameEvents.emit({
    type: 'LEARNING_UNIT_COMPLETED',
    unitKey,
    worldKey,
  })

  await advanceWorldIfCheckpoint(unitKey, worldKey)
}

export const LearningCurriculumService = {
  async initializeForWorld(worldKey: LearningWorldKeyValue): Promise<void> {
    await LearningCurriculumRepository.ensureWorldSeeded(worldKey)
    await syncWorldProgressFromCurriculum(worldKey)
  },

  async getSnapshot(worldKey: LearningWorldKeyValue): Promise<LearningCurriculumSnapshot | null> {
    return buildCurriculumSnapshot(worldKey)
  },

  async creditFromFarmActivity(
    activityType: FarmActivityTypeValue,
    amount: number,
  ): Promise<boolean> {
    const profile = await LearningGpsRepository.getOrCreateProfile()
    const units = getCurriculumForWorld(profile.currentWorldKey)
    if (units.length === 0) return false

    const active = await LearningCurriculumRepository.getActiveUnit(profile.currentWorldKey, units)
    if (!active) return false

    if (active.unit.practiceActivity !== activityType) return false

    const credit = farmAmountToGpsMinutes(activityType, amount)
    const { progress, completed } = applyPracticeCredit(active.unit, active.progress, credit)

    await LearningCurriculumRepository.saveProgress(progress)
    if (completed) {
      await finalizeUnitCompletion(active.unit.key, profile.currentWorldKey)
    }

    return completed
  },

  async creditFromDuelWin(): Promise<boolean> {
    const profile = await LearningGpsRepository.getOrCreateProfile()
    const units = getCurriculumForWorld(profile.currentWorldKey)
    if (units.length === 0) return false

    const active = await LearningCurriculumRepository.getActiveUnit(profile.currentWorldKey, units)
    if (!active || active.unit.kind !== LearningUnitKind.GRAMMAR) return false

    const { progress, completed } = applyPracticeCredit(active.unit, active.progress, 1)
    await LearningCurriculumRepository.saveProgress(progress)

    if (completed) {
      await finalizeUnitCompletion(active.unit.key, profile.currentWorldKey)
    }

    return completed
  },

  async completeUnitManually(unitKey: string): Promise<boolean> {
    const profile = await LearningGpsRepository.getOrCreateProfile()
    const units = getCurriculumForWorld(profile.currentWorldKey)
    const unit = units.find((entry) => entry.key === unitKey)
    if (!unit) return false

    const existing = await LearningCurriculumRepository.findByKey(unitKey)
    if (!existing || existing.status === LearningUnitStatus.LOCKED) return false
    if (existing.status === LearningUnitStatus.COMPLETED) return false

    const completedProgress = {
      ...existing,
      status: LearningUnitStatus.COMPLETED,
      practiceProgress: unit.requiredPracticeAmount,
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await LearningCurriculumRepository.saveProgress(completedProgress)
    await finalizeUnitCompletion(unitKey, profile.currentWorldKey)
    return true
  },
}
