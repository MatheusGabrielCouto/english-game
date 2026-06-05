import { type Href, router } from 'expo-router'
import { useEffect, useMemo } from 'react'
import { Text, View } from 'react-native'

import { Card, ProgressBar } from '@/components'
import { routes } from '@/constants'
import { PressableScale } from '@/components/ui/game'
import { HomeCardSkeleton } from '@/features/home/components/HomeCardSkeleton'
import { useMissionsStore } from '@/features/quests/store/missions-store'
import { cn } from '@/utils'
import { toProgressPercent } from '@/utils/progress'

export const DailyMissionsPreview = () => {
  const missions = useMissionsStore((state) => state.missions)
  const hasHydrated = useMissionsStore((state) => state._hasHydrated)
  const isSyncing = useMissionsStore((state) => state.isSyncing)
  const ensureDailyMissions = useMissionsStore((state) => state.ensureDailyMissions)

  const completedCount = missions.filter((mission) => mission.completed).length

  const previewMissions = useMemo(() => {
    return [...missions]
      .sort((left, right) => {
        if (left.completed === right.completed) return 0
        return left.completed ? 1 : -1
      })
      .slice(0, 3)
  }, [missions])

  useEffect(() => {
    ensureDailyMissions()
  }, [ensureDailyMissions])

  if (!hasHydrated || isSyncing) {
    return <HomeCardSkeleton />
  }

  if (missions.length === 0) {
    return (
      <Card accent className="border-primary/25">
        <Text className="text-xs font-bold uppercase tracking-widest text-primary">⚔️ Missões de hoje</Text>
        <Text className="mt-2 text-sm text-foreground-secondary">
          Carregando missões do dia…
        </Text>
      </Card>
    )
  }

  const percentage = toProgressPercent(completedCount, missions.length)
  const allDone = completedCount === missions.length
  const pendingCount = missions.length - completedCount

  return (
    <PressableScale
      onPress={() => router.push(routes.tabs.play as Href)}
      accessibilityRole="button"
      accessibilityLabel="Ver missões do dia">
      <Card accent className="overflow-hidden border-primary/40">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-xs font-bold uppercase tracking-widest text-primary">
              ⚔️ Missões de hoje
            </Text>
            <Text className="mt-1 text-xl font-black text-foreground">
              {completedCount}/{missions.length} concluídas
            </Text>
            {pendingCount > 0 ? (
              <Text className="mt-0.5 text-xs text-muted">
                {pendingCount} pendente{pendingCount > 1 ? 's' : ''}
              </Text>
            ) : null}
          </View>
          <Text className="text-3xl">{allDone ? '🎉' : '🎯'}</Text>
        </View>
        <View className="mt-3">
          <ProgressBar value={percentage} variant="xp" height="lg" animated={false} />
        </View>
        <View className="mt-3 gap-2">
          {previewMissions.map((mission) => (
            <View key={mission.id} className="flex-row items-center gap-2">
              <Text className="text-sm">{mission.completed ? '✅' : '⬜'}</Text>
              <Text
                className={cn(
                  'flex-1 text-sm',
                  mission.completed ? 'text-foreground-secondary line-through' : 'text-foreground',
                )}
                numberOfLines={1}>
                {mission.title}
              </Text>
            </View>
          ))}
        </View>
        <Text className="mt-3 text-xs font-semibold text-primary">Toque para ir às missões →</Text>
      </Card>
    </PressableScale>
  )
}
