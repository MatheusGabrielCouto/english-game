import { type Href, router } from 'expo-router'
import { useEffect, useMemo } from 'react'
import { Text, View } from 'react-native'

import { GameCard, PressableScale } from '@/components/ui/game'
import { routes } from '@/constants'
import { HOME_UI } from '@/features/home/constants/home-ui'
import { HomeCardSkeleton } from '@/features/home/components/HomeCardSkeleton'
import { HomeCardRow } from '@/features/home/components/shared/HomeCardRow'
import { HomeSectionLabel } from '@/features/home/components/shared/HomeSectionLabel'
import { HOME_LAYOUT } from '@/features/home/constants/home-layout'
import { RpgProgressBar } from '@/features/home/components/shared/RpgProgressBar'
import { useMissionsStore } from '@/features/quests/store/missions-store'
import { cn } from '@/utils'
import { toProgressPercent } from '@/utils/progress'

export const HomeDailyQuestsCard = () => {
  const missions = useMissionsStore((s) => s.missions)
  const hasHydrated = useMissionsStore((s) => s._hasHydrated)
  const isSyncing = useMissionsStore((s) => s.isSyncing)
  const ensureDailyMissions = useMissionsStore((s) => s.ensureDailyMissions)

  const completedCount = missions.filter((m) => m.completed).length
  const previewMissions = useMemo(
    () =>
      [...missions]
        .sort((a, b) => {
          if (a.completed === b.completed) return 0
          return a.completed ? 1 : -1
        })
        .slice(0, 3),
    [missions],
  )

  useEffect(() => {
    ensureDailyMissions()
  }, [ensureDailyMissions])

  if (!hasHydrated || isSyncing) {
    return <HomeCardSkeleton />
  }

  if (missions.length === 0) {
    return (
      <GameCard variant="quest" className="border-primary/20">
        <HomeSectionLabel emoji="⚔️" title={HOME_UI.quests.title} tone="primary" />
        <Text className="mt-3 text-sm text-foreground-secondary">{HOME_UI.quests.empty}</Text>
      </GameCard>
    )
  }

  const percent = toProgressPercent(completedCount, missions.length)
  const allDone = completedCount === missions.length

  return (
    <PressableScale
      fill
      onPress={() => router.push(routes.tabs.play as Href)}
      accessibilityRole="button"
      accessibilityLabel={HOME_UI.quests.viewAll}
    >
      <GameCard variant="quest" glow={!allDone} className="border-primary/40">
        <HomeCardRow className="justify-between gap-2">
          <View className={HOME_LAYOUT.growBlock}>
            <HomeSectionLabel emoji="⚔️" title={HOME_UI.quests.title} tone="primary" />
            <Text className="mt-2 text-2xl font-black text-foreground">
              {completedCount}/{missions.length}
            </Text>
            <Text className="text-xs text-foreground-secondary">{HOME_UI.quests.progressLabel}</Text>
          </View>
          <Text className="shrink-0 text-3xl">{allDone ? '🎉' : '🎯'}</Text>
        </HomeCardRow>

        <View className="mt-3">
          <RpgProgressBar value={percent} variant="xp" height="md" animated />
        </View>

        <View className="mt-4 gap-2.5">
          {previewMissions.map((mission) => (
            <View key={mission.id} className="flex-row items-center gap-2.5">
              <Text className="text-base">{mission.completed ? '✅' : '⬜'}</Text>
              <View className="min-w-0 flex-1">
                <Text
                  className={cn(
                    'text-sm font-semibold',
                    mission.completed
                      ? 'text-foreground-secondary line-through'
                      : 'text-foreground',
                  )}
                  numberOfLines={1}
                >
                  {mission.title}
                </Text>
                {!mission.completed ? (
                  <Text className="text-[10px] text-foreground-secondary">
                    +{mission.xpReward} XP · +{mission.coinReward} moedas
                  </Text>
                ) : null}
              </View>
            </View>
          ))}
        </View>

        <Text className="mt-4 text-xs font-bold text-primary">{HOME_UI.quests.viewAll} →</Text>
      </GameCard>
    </PressableScale>
  )
}
