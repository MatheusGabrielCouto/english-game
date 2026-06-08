import { LearningGpsService } from '@/features/learning-gps/services/learning-gps-service'
import { MentorChatRepository } from '@/storage/repositories/mentor-chat-repository'
import { MentorErrorRepository } from '@/storage/repositories/mentor-error-repository'
import type { MentorDashboardSnapshot } from '@/types/mentor-ai'

import { useMentorAiStore } from '../store/mentor-ai-store'
import { buildMentorGreeting } from '../utils/build-greeting'
import { AIContextBuilder } from './ai-context-builder'
import { LocalLLMRuntime } from './local-llm-runtime'
import { MentorRecommendationService } from './mentor-recommendation-service'

const syncSnapshot = (snapshot: MentorDashboardSnapshot) => {
  useMentorAiStore.setState({
    snapshot,
    hasHydrated: true,
  })
}

const buildDashboardSnapshot = async (): Promise<MentorDashboardSnapshot> => {
  const gpsSnapshot = await LearningGpsService.refresh()
  const context = await AIContextBuilder.build({
    profile: gpsSnapshot.profile,
    world: gpsSnapshot.world,
    skills: gpsSnapshot.skills,
    curriculum: gpsSnapshot.curriculum,
    intelligence: gpsSnapshot.intelligence,
    todayRoutines: gpsSnapshot.todayRoutines,
  })

  const recommendation = MentorRecommendationService.build(
    gpsSnapshot.intelligence.weaknesses,
    context.memory,
    context,
  )
  const llmStatus = LocalLLMRuntime.getStatus()

  const weeklyGoal = gpsSnapshot.intelligence.weeklyPlan.projectTitle
  const monthlyGoal =
    gpsSnapshot.intelligence.monthlyReport.goals[0] ??
    gpsSnapshot.intelligence.monthlyReport.summary ??
    null

  const [recentSession, recentError] = await Promise.all([
    MentorChatRepository.listRecent(1),
    MentorErrorRepository.listRecent(1),
  ])

  const lastAssistant = recentSession[0]?.messages
    .slice()
    .reverse()
    .find((message) => message.role === 'assistant')

  const lastFeedback =
    recentError[0]?.corrected ??
    lastAssistant?.content?.slice(0, 120) ??
    null

  const greeting = buildMentorGreeting({
    streak: context.player.streak,
    weakestSkill: context.skills.weakest,
    worldName: context.learningGps.currentWorld,
    worldCefr: context.learningGps.worldCefr,
    worldsUntilAdvanced: context.learningGps.path.worldsUntilAdvanced,
    advancedTargetWorld: context.learningGps.path.advancedTargetWorld,
    topMissionTitle: context.learningGps.path.topMission?.title ?? null,
    motivation: context.motivation,
  })

  return {
    context,
    recommendation,
    llmStatus,
    weeklyGoal,
    monthlyGoal,
    lastFeedback,
    greeting,
    integratedPathSummary: context.learningGps.path.pathSummary,
  }
}

export const MentorAIService = {
  async hydrate(): Promise<MentorDashboardSnapshot> {
    useMentorAiStore.setState({ isSyncing: true })
    try {
      const snapshot = await buildDashboardSnapshot()
      syncSnapshot(snapshot)
      return snapshot
    } finally {
      useMentorAiStore.setState({ isSyncing: false })
    }
  },

  async refresh(): Promise<MentorDashboardSnapshot> {
    const snapshot = await buildDashboardSnapshot()
    syncSnapshot(snapshot)
    return snapshot
  },
}
