import { useEffect, useMemo, useState } from 'react'
import { Text, View } from 'react-native'

import { EmptyState } from '@/components'
import { ScreenSkeleton } from '@/components/ui/skeleton'
import { EpicQuestsSection } from '@/features/epic-quests/components/EpicQuestsSection'
import { EpicQuestService } from '@/features/epic-quests/services/epic-quest-service'
import { useEpicQuestsStore } from '@/features/epic-quests/store/epic-quests-store'
import { usePlayerStore } from '@/features/player'
import { QUESTS_UI, type QuestsTab } from '@/features/quests/constants/quests-ui'
import { useMissionsStore } from '@/features/quests/store/missions-store'
import { WeeklyQuestsSection } from '@/features/weekly-quests'
import { useWeeklyMissionsStore } from '@/features/weekly-quests/store/weekly-missions-store'

import { MissionCard } from './MissionCard'
import { QuestSectionHeader } from './QuestSectionHeader'
import { QuestsDailySummary } from './QuestsDailySummary'
import { QuestsRoutinesBanner } from './QuestsRoutinesBanner'
import { QuestsTabSwitcher } from './QuestsTabSwitcher'

type QuestsScreenContentProps = {
  embedded?: boolean
}

export const QuestsScreenContent = ({ embedded = false }: QuestsScreenContentProps) => {
  const [activeTab, setActiveTab] = useState<QuestsTab>('today')

  const missions = useMissionsStore((s) => s.missions)
  const isSyncing = useMissionsStore((s) => s.isSyncing)
  const hasHydrated = useMissionsStore((s) => s._hasHydrated)
  const ensureDailyMissions = useMissionsStore((s) => s.ensureDailyMissions)
  const completeMission = useMissionsStore((s) => s.completeMission)
  const currentStreak = usePlayerStore((s) => s.currentStreak)

  const epicMissions = useEpicQuestsStore((state) => state.missions)
  const weeklyMissions = useWeeklyMissionsStore((s) => s.missions)

  useEffect(() => {
    ensureDailyMissions()

    if (epicMissions.length === 0) {
      void EpicQuestService.refresh()
    }
  }, [ensureDailyMissions, epicMissions.length])

  const sortedMissions = useMemo(
    () =>
      [...missions].sort((left, right) => {
        if (left.completed === right.completed) return 0
        return left.completed ? 1 : -1
      }),
    [missions],
  )

  const pendingCount = missions.filter((mission) => !mission.completed).length
  const completedCount = missions.length - pendingCount

  const claimableWeeklyCount = weeklyMissions.filter(
    (mission) => mission.completed && !mission.claimed,
  ).length

  const activeEpicCount = epicMissions.filter((mission) => mission.status === 'active').length

  const tabBadges = useMemo(
    () => ({
      today: pendingCount,
      week: claimableWeeklyCount,
      epic: activeEpicCount,
    }),
    [activeEpicCount, claimableWeeklyCount, pendingCount],
  )

  if (!hasHydrated || isSyncing) {
    return <ScreenSkeleton variant="quest" />
  }

  return (
    <View className={embedded ? 'gap-5' : 'gap-5 pb-4'}>
      <QuestsTabSwitcher activeTab={activeTab} onTabChange={setActiveTab} badges={tabBadges} />

      {activeTab === 'today' ? (
        <View className="gap-5">
          {missions.length === 0 ? (
            <EmptyState
              icon="map-outline"
              title={QUESTS_UI.today.emptyTitle}
              description={QUESTS_UI.today.emptyDescription}
            />
          ) : (
            <>
              {embedded ? null : <QuestsRoutinesBanner />}
              <QuestsDailySummary missions={missions} />

              {currentStreak > 0 ? (
                <View className="flex-row items-center gap-2 rounded-2xl border border-streak/30 bg-streak/5 px-4 py-3">
                  <Text className="text-xl">🔥</Text>
                  <Text className="flex-1 text-sm text-foreground-secondary">
                    Streak de <Text className="font-bold text-streak">{currentStreak} dias</Text> —{' '}
                    {QUESTS_UI.today.streakHint}
                  </Text>
                </View>
              ) : null}

              <View className="gap-3">
                <QuestSectionHeader
                  emoji="📋"
                  title={QUESTS_UI.today.dailyTitle}
                  subtitle={QUESTS_UI.today.dailySubtitle(pendingCount, completedCount)}
                  badge={QUESTS_UI.today.dailyBadge(pendingCount)}
                />

                <View className="gap-3">
                  {sortedMissions.map((mission) => (
                    <MissionCard key={mission.id} mission={mission} onComplete={completeMission} />
                  ))}
                </View>
              </View>
            </>
          )}
        </View>
      ) : null}

      {activeTab === 'week' ? (
        <View className="gap-3">
          <Text className="text-sm leading-5 text-foreground-secondary">{QUESTS_UI.week.subtitle}</Text>
          <WeeklyQuestsSection showHeader={false} />
        </View>
      ) : null}

      {activeTab === 'epic' ? (
        <View className="gap-3">
          <Text className="text-sm leading-5 text-foreground-secondary">{QUESTS_UI.epic.subtitle}</Text>
          <EpicQuestsSection missions={epicMissions} showHeader={false} />
        </View>
      ) : null}
    </View>
  )
}
