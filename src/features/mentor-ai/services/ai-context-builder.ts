import { CONTRACTS_BY_KEY } from '@/data/loaders/contracts'
import { getTodayKey } from '@/features/quests/utils/date'
import { getCareerProgress } from '@/storage/repositories/career-repository'
import { ContractRunRepository } from '@/storage/repositories/contract-run-repository'
import { LearningAnalyticsRepository } from '@/storage/repositories/learning-analytics-repository'
import { LearningGpsRepository } from '@/storage/repositories/learning-gps-repository'
import { MentorErrorRepository } from '@/storage/repositories/mentor-error-repository'
import { MentorMemoryRepository } from '@/storage/repositories/mentor-memory-repository'
import { getPlayer } from '@/storage/repositories/player-repository'
import { getOrCreateStudyPointsBalance } from '@/storage/repositories/study-points-repository'
import { ContractStatus } from '@/types/contract'
import {
    LearningUnitStatus,
    type LearningCurriculumSnapshot,
    type LearningIntelligenceSnapshot,
    type LearningWorldRecord,
    type PlayerLearningProfileRecord,
    type SkillLevelRecord,
} from '@/types/learning-gps'
import {
    MentorAIMode,
    MentorMemoryKeyPrefix,
    type MentorAIContext,
    type MentorAIModeValue,
} from '@/types/mentor-ai'
import type { RoutineTodayItem } from '@/types/routine'

import { detectSkillWeaknesses, getPrioritySkillKeys } from '@/features/learning-gps/utils/detect-skill-weaknesses'
import { farmAmountToGpsMinutes } from '@/features/learning-gps/utils/map-farm-activity-to-gps'
import { getRecentFarmSessions } from '@/storage/repositories/farm-repository'
import { FlashDeckRepository } from '@/storage/repositories/flash-deck-repository'

import { LEARNING_SKILL_BY_KEY } from '@/features/learning-gps/constants/learning-skills'
import { MotivationDailyPickService } from '@/features/motivation-spark/services/motivation-daily-pick-service'
import { AchievementStatsRepository } from '@/storage/repositories/achievement-stats-repository'

import { buildMentorFarmBridge } from '../utils/build-mentor-farm-bridge'
import { buildMentorGpsPath } from '../utils/build-mentor-gps-path'
import { buildMentorMotivationBridge } from '../utils/build-mentor-motivation-bridge'
import { resolveSkillExtremes } from '../utils/resolve-skill-extremes'

const skillLevelMap = (skills: SkillLevelRecord[]): MentorAIContext['skills'] => {
  const byKey = Object.fromEntries(skills.map((skill) => [skill.skillKey, skill.level])) as Record<
    string,
    number
  >
  const extremes = resolveSkillExtremes(skills)

  return {
    vocabulary: byKey.vocabulary ?? 0,
    reading: byKey.reading ?? 0,
    listening: byKey.listening ?? 0,
    speaking: byKey.speaking ?? 0,
    writing: byKey.writing ?? 0,
    grammar: byKey.grammar ?? 0,
    weakest: extremes.weakest,
    strongest: extremes.strongest,
  }
}

const resolveActiveUnitTitle = (curriculum: LearningCurriculumSnapshot | null): string | null => {
  if (!curriculum) return null
  const active = curriculum.units.find(
    (unit) =>
      unit.progress.status === LearningUnitStatus.AVAILABLE ||
      unit.progress.status === LearningUnitStatus.IN_PROGRESS,
  )
  return active?.title ?? null
}

const resolveWeeklyFocus = (intelligence: LearningIntelligenceSnapshot | null): string | null => {
  const today = intelligence?.weeklyPlan.days.find((day) => day.isToday)
  if (!today) return null
  if (today.isSpeakingDay) return 'Conversação'
  if (today.isProjectDay) return intelligence.weeklyPlan.projectTitle
  if (today.isReviewDay) return 'Revisão'
  return today.focusSkills.join(', ')
}

const countFarmMinutesToday = async (dateKey: string): Promise<number> => {
  const sessions = await getRecentFarmSessions(50)
  return sessions
    .filter((session) => session.recordedAt.startsWith(dateKey))
    .reduce((sum, session) => sum + farmAmountToGpsMinutes(session.activityType, session.amount), 0)
}

const countFlashReviewsToday = async (dateKey: string): Promise<number> => {
  const decks = await FlashDeckRepository.listDecks()
  const counts = await Promise.all(decks.map((deck) => FlashDeckRepository.countReviewsOnDate(deck.id, dateKey)))
  return counts.reduce((sum, count) => sum + count, 0)
}

export const AIContextBuilder = {
  async build(input: {
    profile: PlayerLearningProfileRecord
    world: LearningWorldRecord
    skills: SkillLevelRecord[]
    curriculum: LearningCurriculumSnapshot | null
    intelligence: LearningIntelligenceSnapshot | null
    todayRoutines: RoutineTodayItem[]
    mode?: MentorAIModeValue
    dateKey?: string
  }): Promise<MentorAIContext> {
    const dateKey = input.dateKey ?? getTodayKey()
    const mode = input.mode ?? MentorAIMode.PROFESSOR

    const [
      player,
      studyPoints,
      career,
      activeContract,
      analytics,
      goals,
      preferences,
      topics,
      recentErrors,
      farmMinutesToday,
      flashReviewsToday,
      recentFarmSessions,
      worlds,
      dailySpark,
      achievementStats,
    ] = await Promise.all([
      getPlayer(),
      getOrCreateStudyPointsBalance(),
      getCareerProgress(),
      ContractRunRepository.findActive(),
      LearningAnalyticsRepository.getOrCreate(),
      MentorMemoryRepository.listStringValuesByPrefix(MentorMemoryKeyPrefix.GOAL),
      MentorMemoryRepository.listStringValuesByPrefix(MentorMemoryKeyPrefix.PREFERENCE),
      MentorMemoryRepository.listStringValuesByPrefix(MentorMemoryKeyPrefix.TOPIC),
      MentorErrorRepository.listRecent(10),
      countFarmMinutesToday(dateKey),
      countFlashReviewsToday(dateKey),
      getRecentFarmSessions(15),
      LearningGpsRepository.listWorlds(),
      MotivationDailyPickService.getDailySpark(dateKey),
      AchievementStatsRepository.getOrCreate(),
    ])

    const weaknesses = detectSkillWeaknesses(input.skills)
    const prioritySkillKeys = input.intelligence?.prioritySkillKeys ?? getPrioritySkillKeys(weaknesses)
    const totalDuels = analytics.duelWins + analytics.duelLosses
    const duelWinRate = totalDuels > 0 ? Math.round((analytics.duelWins / totalDuels) * 100) : 0

    const contractName =
      activeContract?.status === ContractStatus.ACTIVE
        ? (CONTRACTS_BY_KEY[activeContract.contractKey]?.name ?? activeContract.contractKey)
        : null

    const skillSnapshot = skillLevelMap(input.skills)
    const gpsPath = buildMentorGpsPath({
      world: input.world,
      worlds,
      intelligence: input.intelligence,
    })
    const farmBridge = buildMentorFarmBridge({
      weakestSkill: skillSnapshot.weakest,
      farmMinutesToday,
      recentSessions: recentFarmSessions,
      dateKey,
      isSpeakingDay: gpsPath.isSpeakingDay,
      gpsMissionTitle: gpsPath.topMission?.title ?? null,
    })
    const weakestSkillLabel = LEARNING_SKILL_BY_KEY[skillSnapshot.weakest].label.toLowerCase()
    const motivationBridge = buildMentorMotivationBridge({
      dailySpark,
      openStreak: achievementStats.motivationOpenStreak,
      weakestSkillLabel,
    })

    return {
      generatedAt: new Date().toISOString(),
      player: {
        level: player?.level ?? 1,
        streak: player?.currentStreak ?? 0,
        coins: player?.coins ?? 0,
        studyPoints: studyPoints.balance,
      },
      skills: skillSnapshot,
      learningGps: {
        currentWorld: input.world.name,
        worldCefr: input.world.cefrLevel,
        worldProgress: input.profile.worldProgress,
        activeUnitTitle: resolveActiveUnitTitle(input.curriculum),
        curriculumCompleted: input.curriculum?.completedCount ?? 0,
        curriculumTotal: input.curriculum?.totalCount ?? 0,
        prioritySkills: prioritySkillKeys,
        weeklyFocus: resolveWeeklyFocus(input.intelligence),
        path: gpsPath,
      },
      farm: farmBridge,
      motivation: motivationBridge,
      activity: {
        duelWinRate,
        flashReviewsToday,
        farmMinutesToday,
        routinesDueToday: input.todayRoutines.length,
        routinesCompletedToday: input.todayRoutines.filter((item) => item.completed).length,
      },
      career: {
        englishScore: career?.englishScore ?? null,
        activeContract: contractName,
      },
      memory: {
        goals,
        preferences,
        frequentErrors: recentErrors.map((entry) => entry.original),
        recentTopics: topics,
      },
      mode,
      locale: 'pt-BR',
    }
  },

  async buildFromGps(): Promise<MentorAIContext> {
    const [profile, skills, world, todayRoutines] = await Promise.all([
      LearningGpsRepository.getOrCreateProfile(),
      LearningGpsRepository.listSkillLevels(),
      LearningGpsRepository.getOrCreateProfile().then(async (record) => {
        const resolved = await LearningGpsRepository.findWorldByKey(record.currentWorldKey)
        return resolved!
      }),
      import('@/features/routines/services/routine-service').then((module) =>
        module.RoutineService.getDueTodayItems(),
      ),
    ])

    const { LearningCurriculumService } = await import(
      '@/features/learning-gps/services/learning-curriculum-service'
    )
    const { LearningIntelligenceService } = await import(
      '@/features/learning-gps/services/learning-intelligence-service'
    )

    const curriculum = await LearningCurriculumService.getSnapshot(profile.currentWorldKey)
    const intelligence = await LearningIntelligenceService.buildSnapshot({
      profile,
      world,
      skills,
      curriculum,
      todayRoutines,
    })

    return AIContextBuilder.build({
      profile,
      world,
      skills,
      curriculum,
      intelligence,
      todayRoutines,
    })
  },
}
