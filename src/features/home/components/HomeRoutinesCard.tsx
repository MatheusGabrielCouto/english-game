import { type Href, router } from 'expo-router'
import { useMemo } from 'react'
import { Text, View } from 'react-native'

import { GameCard, PressableScale } from '@/components/ui/game'
import { routes } from '@/constants'
import { HOME_UI } from '@/features/home/constants/home-ui'
import { HomeCardSkeleton } from '@/features/home/components/HomeCardSkeleton'
import { HomeCardRow } from '@/features/home/components/shared/HomeCardRow'
import { HomeSectionLabel } from '@/features/home/components/shared/HomeSectionLabel'
import { HOME_LAYOUT } from '@/features/home/constants/home-layout'
import { RpgProgressBar } from '@/features/home/components/shared/RpgProgressBar'
import { ROUTINE_UI } from '@/features/routines/constants/routine-ui'
import { useRoutinesStore } from '@/features/routines/store/routines-store'
import { cn } from '@/utils'
import { toProgressPercent } from '@/utils/progress'

export const HomeRoutinesCard = () => {
  const dueToday = useRoutinesStore((s) => s.dueToday)
  const completedToday = useRoutinesStore((s) => s.completedToday)
  const isLoading = useRoutinesStore((s) => s.isLoading)

  const previewItems = useMemo(
    () =>
      [...dueToday]
        .sort((a, b) => {
          if (a.completed === b.completed) return 0
          return a.completed ? 1 : -1
        })
        .slice(0, 4),
    [dueToday],
  )

  if (isLoading) {
    return <HomeCardSkeleton />
  }

  if (dueToday.length === 0) {
    return (
      <PressableScale fill onPress={() => router.push(routes.routines as Href)} accessibilityLabel={ROUTINE_UI.emptyToday}>
        <GameCard variant="default" className="border-accent/30 bg-accent/5">
          <HomeSectionLabel emoji="📋" title={HOME_UI.routines.title} tone="accent" />
          <Text className="mt-3 text-sm text-foreground-secondary">{ROUTINE_UI.emptyToday}</Text>
          <Text className="mt-2 text-xs font-bold text-accent">{HOME_UI.routines.viewAll} →</Text>
        </GameCard>
      </PressableScale>
    )
  }

  const completedCount = completedToday.length
  const total = dueToday.length
  const percent = toProgressPercent(completedCount, total)
  const allDone = completedCount === total

  return (
    <PressableScale
      fill
      onPress={() => router.push(routes.routines as Href)}
      accessibilityRole="button"
      accessibilityLabel={HOME_UI.routines.viewAll}
    >
      <GameCard variant="default" className="border-accent/40 bg-accent/5">
        <HomeCardRow className="justify-between gap-2">
          <View className={HOME_LAYOUT.growBlock}>
            <HomeSectionLabel emoji="📋" title={HOME_UI.routines.title} tone="accent" />
            <Text className="mt-2 text-2xl font-black text-foreground">
              {completedCount}/{total}
            </Text>
            <Text className="text-xs text-foreground-secondary">{ROUTINE_UI.todayHint}</Text>
          </View>
          <Text className="shrink-0 text-3xl">{allDone ? '🌟' : '📋'}</Text>
        </HomeCardRow>

        <View className="mt-3">
          <RpgProgressBar value={percent} variant="default" height="md" animated />
        </View>

        <View className="mt-4 gap-2">
          {previewItems.map((item) => (
            <View key={item.routine.id} className="flex-row flex-wrap items-center gap-2">
              <Text className="shrink-0 text-sm font-bold text-accent">{item.completed ? '✓' : '□'}</Text>
              <Text
                className={cn(
                  'min-w-0 flex-1 text-sm',
                  item.completed ? 'text-foreground-secondary line-through' : 'font-medium text-foreground',
                )}
                numberOfLines={2}
              >
                {item.routine.name}
              </Text>
            </View>
          ))}
        </View>

        <Text className="mt-3 text-xs font-bold text-accent">{HOME_UI.routines.viewAll} →</Text>
      </GameCard>
    </PressableScale>
  )
}
