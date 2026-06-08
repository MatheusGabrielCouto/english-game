import { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, View } from 'react-native'

import type { LearningWorldRecord } from '@/types/learning-gps'

import { LEARNING_GPS_UI } from '../constants/learning-gps-ui'
import { useLearningGps } from '../hooks/use-learning-gps'
import { LearningGpsService } from '../services/learning-gps-service'
import { countTodayPending, resolveNextStep } from '../utils/resolve-next-step'
import { LearningGpsHeroSummary } from './LearningGpsHeroSummary'
import { LearningGpsInsightsTab } from './LearningGpsInsightsTab'
import { LearningGpsNextStepCard } from './LearningGpsNextStepCard'
import { LearningGpsTabSwitcher, type LearningGpsTab } from './LearningGpsTabSwitcher'
import { LearningGpsTodayTab } from './LearningGpsTodayTab'
import { LearningGpsTrailTab } from './LearningGpsTrailTab'

export const LearningGpsScreenContent = () => {
  const { snapshot, hasHydrated, isSyncing, refresh } = useLearningGps()
  const [worlds, setWorlds] = useState<LearningWorldRecord[]>([])
  const [worldsLoading, setWorldsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<LearningGpsTab>('today')

  useEffect(() => {
    void LearningGpsService.listWorlds()
      .then(setWorlds)
      .finally(() => setWorldsLoading(false))
  }, [])

  const tabBadges = useMemo(() => {
    if (!snapshot) return { today: 0, insights: 0 }
    return {
      today: countTodayPending({
        todayBlocks: snapshot.todayBlocks,
        completedRoutinesCount: snapshot.completedRoutinesCount,
        totalRoutinesCount: snapshot.totalRoutinesCount,
      }),
      insights: snapshot.intelligence.weaknesses.filter((w) => w.priority === 'high').length,
    }
  }, [snapshot])

  if (!hasHydrated || isSyncing || !snapshot || worldsLoading) {
    return (
      <View className="items-center justify-center py-16">
        <ActivityIndicator size="large" color="#fb923c" />
      </View>
    )
  }

  const {
    world,
    profile,
    skills,
    todayBlocks,
    todayRoutines,
    targetMinutes,
    completedBlocksCount,
    totalBlocksCount,
    completedRoutinesCount,
    totalRoutinesCount,
    curriculum,
    unlockedWorldKeys,
    completedWorldKeys,
    intelligence,
    prioritySkillKeys,
  } = snapshot

  const nextStep = resolveNextStep({ intelligence, curriculum, todayBlocks })
  const todaySummary = LEARNING_GPS_UI.screen.todayProgress(
    completedBlocksCount,
    totalBlocksCount,
    completedRoutinesCount,
    totalRoutinesCount,
  )

  return (
    <View className="gap-5">
      <LearningGpsHeroSummary world={world} profile={profile} todaySummary={todaySummary} />

      <LearningGpsNextStepCard nextStep={nextStep} />

      <LearningGpsTabSwitcher
        activeTab={activeTab}
        onTabChange={setActiveTab}
        todayBadge={tabBadges.today}
        insightsBadge={tabBadges.insights}
      />

      {activeTab === 'today' ? (
        <LearningGpsTodayTab
          todayBlocks={todayBlocks}
          todayRoutines={todayRoutines}
          completedBlocksCount={completedBlocksCount}
          totalBlocksCount={totalBlocksCount}
          completedRoutinesCount={completedRoutinesCount}
          totalRoutinesCount={totalRoutinesCount}
          targetMinutes={targetMinutes}
          prioritySkillKeys={prioritySkillKeys}
          onUpdated={refresh}
        />
      ) : null}

      {activeTab === 'trail' ? (
        <LearningGpsTrailTab
          curriculum={curriculum}
          worldName={world.name}
          worldEmoji={world.emoji}
          worlds={worlds}
          currentWorld={world}
          profile={profile}
          unlockedWorldKeys={unlockedWorldKeys}
          completedWorldKeys={completedWorldKeys}
          onUpdated={refresh}
        />
      ) : null}

      {activeTab === 'insights' ? (
        <LearningGpsInsightsTab skills={skills} intelligence={intelligence} />
      ) : null}
    </View>
  )
}
