import { useAppStore } from '@/features/app/store/app-store'
import { getTodayKey } from '@/features/quests/utils/date'
import { RoutineService } from '@/features/routines/services/routine-service'
import { GameEvents } from '@/services/game-events'
import { LearningCurriculumRepository } from '@/storage/repositories/learning-curriculum-repository'
import { LearningGpsRepository } from '@/storage/repositories/learning-gps-repository'
import { RoutineRepository } from '@/storage/repositories/routine-repository'
import { FarmActivityType, type FarmActivityTypeValue } from '@/types/farm'
import {
    LearningWorldKey,
    type DailyStudyBlock,
    type LearningGpsSnapshot,
    type LearningWorldKeyValue,
    type LearningWorldRecord,
} from '@/types/learning-gps'
import { RoutineCategory, type RoutineCategoryValue } from '@/types/routine'

import { useLearningGpsStore } from '../store/learning-gps-store'
import {
    applyMinutesToBlock,
    pickBlockForFarmCredit,
} from '../utils/apply-farm-credit-to-blocks'
import { applyRoutineCreditToBlocks } from '../utils/apply-routine-credit-to-blocks'
import {
    buildDailyStudyBlocks,
    getTargetMinutesForDifficulty,
} from '../utils/build-daily-study-blocks'
import {
    computeSkillGainForBlock,
    computeWorldProgressGainForBlock,
} from '../utils/learning-gps-progress'
import {
    farmAmountToGpsMinutes,
    resolveFarmGpsTarget,
} from '../utils/map-farm-activity-to-gps'
import {
    resolveRoutineSkillKey,
    routineDurationToGpsMinutes,
} from '../utils/map-routine-category-to-skill'
import { prioritizeDailyBlocks } from '../utils/prioritize-daily-blocks'
import {
    resolveCompletedWorldKeys,
    resolveUnlockedWorldKeys,
} from '../utils/world-progression'
import { LearningCurriculumBridge } from './learning-curriculum-bridge'
import { LearningCurriculumService } from './learning-curriculum-service'
import { LearningGpsFarmBridge } from './learning-gps-farm-bridge'
import { LearningGpsRoutineBridge } from './learning-gps-routine-bridge'
import { LearningIntelligenceService } from './learning-intelligence-service'

const syncSnapshot = (snapshot: LearningGpsSnapshot) => {
  useLearningGpsStore.setState({
    snapshot,
    hasHydrated: true,
  })
}

const buildSnapshot = async (): Promise<LearningGpsSnapshot> => {
  const difficulty = useAppStore.getState().difficulty
  const dateKey = getTodayKey()
  const dailyPlan = await LearningGpsRepository.getOrCreateDailyPlan(dateKey, difficulty)

  const [profile, skills, world] = await Promise.all([
    LearningGpsRepository.getOrCreateProfile(),
    LearningGpsRepository.listSkillLevels(),
    LearningGpsRepository.getOrCreateProfile().then(async (record) => {
      const resolved = await LearningGpsRepository.findWorldByKey(record.currentWorldKey)
      if (resolved) return resolved
      return (await LearningGpsRepository.findWorldByKey(LearningWorldKey.SURVIVOR))!
    }),
  ])

  const baseBlocks = buildDailyStudyBlocks(difficulty, dailyPlan.blockProgress)
  const [curriculum, worlds, allProgress, todayRoutines] = await Promise.all([
    LearningCurriculumService.getSnapshot(profile.currentWorldKey),
    LearningGpsRepository.listWorlds(),
    LearningCurriculumRepository.listAll(),
    RoutineService.getDueTodayItems(),
  ])

  const intelligence = await LearningIntelligenceService.buildSnapshot({
    profile,
    world,
    skills,
    curriculum,
    todayRoutines,
    dateKey,
  })

  const todayBlocks = prioritizeDailyBlocks(baseBlocks, intelligence.prioritySkillKeys)
  const completedBlocksCount = todayBlocks.filter((block) => block.completed).length
  const completedRoutinesCount = todayRoutines.filter((item) => item.completed).length

  return {
    profile,
    world,
    skills,
    todayBlocks,
    todayRoutines,
    targetMinutes: getTargetMinutesForDifficulty(difficulty),
    completedBlocksCount,
    totalBlocksCount: todayBlocks.length,
    completedRoutinesCount,
    totalRoutinesCount: todayRoutines.length,
    curriculum,
    unlockedWorldKeys: resolveUnlockedWorldKeys(worlds, world),
    completedWorldKeys: resolveCompletedWorldKeys(worlds, allProgress),
    intelligence,
    prioritySkillKeys: intelligence.prioritySkillKeys,
  }
}

const applyBlockCompletionRewards = async (block: DailyStudyBlock): Promise<void> => {
  const skillGain = computeSkillGainForBlock(block)
  const worldGain = computeWorldProgressGainForBlock(block)

  await LearningGpsRepository.incrementSkillLevel(block.skillKey, skillGain)
  await LearningGpsRepository.incrementWorldProgress(worldGain)

  GameEvents.emit({
    type: 'LEARNING_BLOCK_COMPLETED',
    blockId: block.id,
    skillKey: block.skillKey,
    minutes: block.minutes,
    skillGain,
    worldProgressGain: worldGain,
  })
}

const persistBlockCompletion = async (
  block: DailyStudyBlock,
  blockProgress: Record<string, { progressMinutes: number; completedAt?: string }>,
  newlyCompleted: boolean,
): Promise<void> => {
  const dateKey = getTodayKey()
  const difficulty = useAppStore.getState().difficulty
  const completedAt = new Date().toISOString()

  blockProgress[block.id] = {
    progressMinutes: block.progressMinutes,
    ...(block.completed ? { completedAt: blockProgress[block.id]?.completedAt ?? completedAt } : {}),
  }

  await LearningGpsRepository.saveDailyPlanProgress(dateKey, difficulty, blockProgress)

  if (newlyCompleted) {
    await applyBlockCompletionRewards(block)
  }
}

export const LearningGpsService = {
  async initialize(): Promise<void> {
    LearningGpsFarmBridge.initListeners()
    LearningCurriculumBridge.initListeners()
    LearningGpsRoutineBridge.initListeners()
    await LearningGpsRepository.ensureSkillLevels()
    await LearningGpsRepository.listWorlds()

    const profile = await LearningGpsRepository.getOrCreateProfile()
    await LearningCurriculumService.initializeForWorld(profile.currentWorldKey)
    if (!profile.learningGpsOnboarded) {
      const settings = useAppStore.getState()
      if (settings.hasOnboarded) {
        await LearningGpsRepository.updateProfile({
          learningGpsOnboarded: true,
          onboardedAt: new Date().toISOString(),
        })
      }
    }

    await LearningGpsService.hydrate()
  },

  async hydrate(): Promise<LearningGpsSnapshot> {
    useLearningGpsStore.setState({ isSyncing: true })
    try {
      const snapshot = await buildSnapshot()
      syncSnapshot(snapshot)
      return snapshot
    } finally {
      useLearningGpsStore.setState({ isSyncing: false })
    }
  },

  async refresh(): Promise<LearningGpsSnapshot> {
    return LearningGpsService.hydrate()
  },

  getSnapshot(): LearningGpsSnapshot | null {
    return useLearningGpsStore.getState().snapshot
  },

  async listWorlds(): Promise<LearningWorldRecord[]> {
    return LearningGpsRepository.listWorlds()
  },

  async completeOnboarding(worldKey: LearningWorldKeyValue = LearningWorldKey.SURVIVOR): Promise<LearningGpsSnapshot> {
    const onboardedAt = new Date().toISOString()
    await LearningGpsRepository.updateProfile({
      currentWorldKey: worldKey,
      learningGpsOnboarded: true,
      onboardedAt,
    })
    return LearningGpsService.refresh()
  },

  async creditFromFarmActivity(activityType: string, amount: number): Promise<LearningGpsSnapshot | null> {
    const target = resolveFarmGpsTarget(activityType)
    if (!target) return null

    const creditMinutes = farmAmountToGpsMinutes(activityType as FarmActivityTypeValue, amount)
    if (creditMinutes <= 0) return null

    const difficulty = useAppStore.getState().difficulty
    const dateKey = getTodayKey()
    const dailyPlan = await LearningGpsRepository.getOrCreateDailyPlan(dateKey, difficulty)
    const blocks = buildDailyStudyBlocks(difficulty, dailyPlan.blockProgress)
    const block = pickBlockForFarmCredit(blocks, target)
    if (!block) return LearningGpsService.refresh()

    const { block: updatedBlock, newlyCompleted } = applyMinutesToBlock(block, creditMinutes)
    await persistBlockCompletion(updatedBlock, { ...dailyPlan.blockProgress }, newlyCompleted)
    return LearningGpsService.refresh()
  },

  async creditFromRoutineCompletion(routineId: string): Promise<LearningGpsSnapshot | null> {
    const routine = await RoutineRepository.getById(routineId)
    if (!routine || routine.isArchived) return null

    const category = routine.category as RoutineCategoryValue
    const skillKey = resolveRoutineSkillKey(category)
    const creditMinutes = routineDurationToGpsMinutes(routine.expectedDurationMin)

    const difficulty = useAppStore.getState().difficulty
    const dateKey = getTodayKey()
    const dailyPlan = await LearningGpsRepository.getOrCreateDailyPlan(dateKey, difficulty)
    const blocks = buildDailyStudyBlocks(difficulty, dailyPlan.blockProgress)
    const { updatedBlock, newlyCompleted } = applyRoutineCreditToBlocks(
      blocks,
      skillKey,
      creditMinutes,
    )

    if (!updatedBlock) return LearningGpsService.refresh()

    await persistBlockCompletion(updatedBlock, { ...dailyPlan.blockProgress }, newlyCompleted)

    if (category === RoutineCategory.SPEAKING || category === RoutineCategory.CAREER) {
      await LearningCurriculumService.creditFromFarmActivity(FarmActivityType.SPEAKING, 1)
    }

    return LearningGpsService.refresh()
  },

  async completeBlock(blockId: string): Promise<LearningGpsSnapshot> {
    const difficulty = useAppStore.getState().difficulty
    const dateKey = getTodayKey()
    const dailyPlan = await LearningGpsRepository.getOrCreateDailyPlan(dateKey, difficulty)
    const blocks = buildDailyStudyBlocks(difficulty, dailyPlan.blockProgress)
    const block = blocks.find((entry) => entry.id === blockId)

    if (!block || block.completed) {
      return LearningGpsService.refresh()
    }

    const completedBlock: DailyStudyBlock = {
      ...block,
      progressMinutes: block.minutes,
      completed: true,
    }

    await persistBlockCompletion(completedBlock, { ...dailyPlan.blockProgress }, true)
    return LearningGpsService.refresh()
  },

  isWorldUnlocked(
    world: LearningWorldRecord,
    currentWorld: LearningWorldRecord,
    unlockedWorldKeys?: LearningWorldKeyValue[],
  ): boolean {
    if (unlockedWorldKeys) {
      return unlockedWorldKeys.includes(world.key)
    }
    return world.sortOrder <= currentWorld.sortOrder
  },
}
