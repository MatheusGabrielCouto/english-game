import { useEffect, useMemo } from 'react'
import { ActivityIndicator, Text, View } from 'react-native'

import { EmptyState } from '@/components'
import { theme } from '@/constants'
import { EpicQuestsSection } from '@/features/epic-quests/components/EpicQuestsSection'
import { EpicQuestService } from '@/features/epic-quests/services/epic-quest-service'
import { useEpicQuestsStore } from '@/features/epic-quests/store/epic-quests-store'
import { usePlayerStore } from '@/features/player'
import { useMissionsStore } from '@/features/quests/store/missions-store'
import { WeeklyQuestsSection } from '@/features/weekly-quests'

import { MissionCard } from './MissionCard'
import { QuestSectionHeader } from './QuestSectionHeader'
import { QuestsDailySummary } from './QuestsDailySummary'

export const QuestsScreenContent = () => {
  const missions = useMissionsStore((s) => s.missions)
  const isSyncing = useMissionsStore((s) => s.isSyncing)
  const hasHydrated = useMissionsStore((s) => s._hasHydrated)
  const ensureDailyMissions = useMissionsStore((s) => s.ensureDailyMissions)
  const completeMission = useMissionsStore((s) => s.completeMission)
  const currentStreak = usePlayerStore((s) => s.currentStreak)

  const epicMissions = useEpicQuestsStore((state) => state.missions)

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

  if (!hasHydrated || isSyncing) {
    return (
      <View className="items-center justify-center gap-3 py-16">
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text className="text-sm text-foreground-secondary">Preparando missões do dia…</Text>
      </View>
    )
  }

  if (missions.length === 0) {
    return (
      <EmptyState
        icon="map-outline"
        title="Nenhuma missão hoje"
        description="As missões diárias serão geradas automaticamente em instantes."
      />
    )
  }

  return (
    <View className="gap-6 pb-4">
      <QuestsDailySummary missions={missions} />

      {currentStreak > 0 ? (
        <View className="flex-row items-center gap-2 rounded-2xl border border-streak/30 bg-streak/5 px-4 py-3">
          <Text className="text-xl">🔥</Text>
          <Text className="flex-1 text-sm text-foreground-secondary">
            Streak de <Text className="font-bold text-streak">{currentStreak} dias</Text> — complete
            as missões para mantê-la viva.
          </Text>
        </View>
      ) : null}

      <View className="gap-3">
        <QuestSectionHeader
          emoji="📋"
          title="Diárias"
          subtitle={
            pendingCount > 0
              ? `${pendingCount} pendente${pendingCount > 1 ? 's' : ''} · ${completedCount} concluída${completedCount !== 1 ? 's' : ''}`
              : 'Todas concluídas por hoje'
          }
          badge={pendingCount > 0 ? `${pendingCount} restantes` : '✓ Completo'}
        />

        <View className="gap-3">
          {sortedMissions.map((mission) => (
            <MissionCard key={mission.id} mission={mission} onComplete={completeMission} />
          ))}
        </View>
      </View>

      <View className="h-px bg-border" />

      <WeeklyQuestsSection />

      <View className="h-px bg-border" />

      <EpicQuestsSection missions={epicMissions} />
    </View>
  )
}
