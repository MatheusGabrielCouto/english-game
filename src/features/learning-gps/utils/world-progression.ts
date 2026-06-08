import {
  LearningUnitStatus,
  LearningWorldKey,
  type LearningUnitProgressRecord,
  type LearningWorldKeyValue,
  type LearningWorldRecord,
} from '@/types/learning-gps'

export const WORLD_PROGRESSION_ORDER: LearningWorldKeyValue[] = [
  LearningWorldKey.SURVIVOR,
  LearningWorldKey.EXPLORER,
  LearningWorldKey.PROFESSIONAL,
  LearningWorldKey.DEVELOPER,
  LearningWorldKey.GLOBAL_ENGINEER,
  LearningWorldKey.LEGEND,
]

export const getNextWorldKey = (
  worldKey: LearningWorldKeyValue,
): LearningWorldKeyValue | null => {
  const index = WORLD_PROGRESSION_ORDER.indexOf(worldKey)
  if (index < 0 || index >= WORLD_PROGRESSION_ORDER.length - 1) return null
  return WORLD_PROGRESSION_ORDER[index + 1]
}

export const WORLD_CHECKPOINT_UNIT_KEYS: Record<LearningWorldKeyValue, string> = {
  [LearningWorldKey.SURVIVOR]: 'survivor_checkpoint_conversation',
  [LearningWorldKey.EXPLORER]: 'explorer_checkpoint_conversation',
  [LearningWorldKey.PROFESSIONAL]: 'professional_checkpoint_meetings',
  [LearningWorldKey.DEVELOPER]: 'developer_checkpoint_international',
  [LearningWorldKey.GLOBAL_ENGINEER]: 'global_checkpoint_hired',
  [LearningWorldKey.LEGEND]: 'legend_checkpoint_mastery',
}

export const getCheckpointUnitKey = (worldKey: LearningWorldKeyValue): string | null =>
  WORLD_CHECKPOINT_UNIT_KEYS[worldKey] ?? null

export const isCheckpointCompletedForWorld = (
  worldKey: LearningWorldKeyValue,
  progressRows: LearningUnitProgressRecord[],
): boolean => {
  const checkpointKey = getCheckpointUnitKey(worldKey)
  if (!checkpointKey) return false

  const row = progressRows.find((entry) => entry.unitKey === checkpointKey)
  return row?.status === LearningUnitStatus.COMPLETED
}

export const isWorldUnlocked = (
  world: LearningWorldRecord,
  currentWorld: LearningWorldRecord,
): boolean => world.sortOrder <= currentWorld.sortOrder

export const isWorldCompleted = (
  worldKey: LearningWorldKeyValue,
  progressRows: LearningUnitProgressRecord[],
): boolean => isCheckpointCompletedForWorld(worldKey, progressRows)

export const resolveUnlockedWorldKeys = (
  worlds: LearningWorldRecord[],
  currentWorld: LearningWorldRecord,
): LearningWorldKeyValue[] =>
  worlds
    .filter((world) => isWorldUnlocked(world, currentWorld))
    .map((world) => world.key)

export const resolveCompletedWorldKeys = (
  worlds: LearningWorldRecord[],
  progressRows: LearningUnitProgressRecord[],
): LearningWorldKeyValue[] =>
  worlds
    .filter((world) => isWorldCompleted(world.key, progressRows))
    .map((world) => world.key)
