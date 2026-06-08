import { type Href, router } from 'expo-router'
import { Text, View } from 'react-native'

import { GameCard, PressableScale } from '@/components/ui/game'
import { routes } from '@/constants'
import { HomeCardRow } from '@/features/home/components/shared/HomeCardRow'
import { HomeSectionLabel } from '@/features/home/components/shared/HomeSectionLabel'
import { RpgProgressBar } from '@/features/home/components/shared/RpgProgressBar'
import { HOME_LAYOUT } from '@/features/home/constants/home-layout'
import { HomeCardSkeleton } from '@/features/home/components/HomeCardSkeleton'
import { toProgressPercent } from '@/utils/progress'

import { LEARNING_GPS_UI } from '../constants/learning-gps-ui'
import { useLearningGps } from '../hooks/use-learning-gps'
import { countTodayPending, resolveNextStep } from '../utils/resolve-next-step'

export const HomeLearningGpsCard = () => {
  const { snapshot, hasHydrated, isSyncing } = useLearningGps()

  const handleOpenTrail = () => {
    router.push(routes.learningGps as Href)
  }

  if (!hasHydrated || isSyncing || !snapshot) {
    return <HomeCardSkeleton />
  }

  const {
    world,
    profile,
    todayBlocks,
    completedBlocksCount,
    totalBlocksCount,
    completedRoutinesCount,
    totalRoutinesCount,
    curriculum,
    intelligence,
  } = snapshot

  const pendingToday = countTodayPending({
    todayBlocks,
    completedRoutinesCount,
    totalRoutinesCount,
  })
  const todayPercent = toProgressPercent(
    completedBlocksCount + completedRoutinesCount,
    totalBlocksCount + totalRoutinesCount,
  )
  const allDoneToday = pendingToday === 0 && totalBlocksCount + totalRoutinesCount > 0
  const nextStep = resolveNextStep({
    intelligence,
    curriculum,
    todayBlocks,
  })

  return (
    <PressableScale
      fill
      onPress={handleOpenTrail}
      accessibilityRole="button"
      accessibilityLabel={LEARNING_GPS_UI.home.openGps}>
      <GameCard variant="default" className="border-accent/40 bg-accent/5">
        <HomeCardRow className="justify-between gap-2">
          <View className={HOME_LAYOUT.growBlock}>
            <HomeSectionLabel
              emoji={LEARNING_GPS_UI.screen.emoji}
              title={LEARNING_GPS_UI.home.cardTitle}
              subtitle={LEARNING_GPS_UI.home.cardSubtitle}
              tone="accent"
            />
          </View>
          <Text className="shrink-0 text-3xl">{world.emoji}</Text>
        </HomeCardRow>

        <View className="mt-3 flex-row flex-wrap items-center gap-2">
          <Text className="text-lg font-black text-foreground">{world.name}</Text>
          <View className="rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5">
            <Text className="text-[10px] font-black uppercase tracking-widest text-accent">
              {world.cefrLevel}
            </Text>
          </View>
        </View>

        <View className="mt-3">
          <View className="mb-1.5 flex-row items-center justify-between">
            <Text className="text-xs font-semibold text-muted">
              {LEARNING_GPS_UI.home.worldProgress(profile.worldProgress)}
            </Text>
            {curriculum ? (
              <Text className="text-xs font-semibold text-muted">
                {LEARNING_GPS_UI.screen.curriculumSubtitle(
                  curriculum.completedCount,
                  curriculum.totalCount,
                )}
              </Text>
            ) : null}
          </View>
          <RpgProgressBar value={profile.worldProgress} max={100} height="sm" variant="gold" animated />
        </View>

        <View className="mt-3 rounded-xl border border-border/60 bg-background/50 px-3 py-2.5">
          <View className="flex-row items-center justify-between gap-2">
            <Text className="text-xs font-semibold text-foreground-secondary">
              {LEARNING_GPS_UI.home.todayTitle}
            </Text>
            <Text className="text-xs font-bold text-accent">
              {allDoneToday
                ? LEARNING_GPS_UI.home.todayDone
                : pendingToday > 0
                  ? LEARNING_GPS_UI.home.todayPending(pendingToday)
                  : LEARNING_GPS_UI.home.blocksProgress(completedBlocksCount, totalBlocksCount)}
            </Text>
          </View>
          {totalBlocksCount + totalRoutinesCount > 0 ? (
            <View className="mt-2">
              <RpgProgressBar value={todayPercent} height="sm" animated />
            </View>
          ) : null}
        </View>

        <View className="mt-3 flex-row items-start gap-2">
          <Text className="text-base">{nextStep.emoji}</Text>
          <Text className="min-w-0 flex-1 text-sm leading-5 text-foreground-secondary" numberOfLines={2}>
            {nextStep.kind === 'done'
              ? LEARNING_GPS_UI.home.todayDone
              : LEARNING_GPS_UI.home.nextStepPreview(nextStep.title)}
          </Text>
        </View>

        <Text className="mt-3 text-xs font-bold text-accent">{LEARNING_GPS_UI.home.openGps} →</Text>
      </GameCard>
    </PressableScale>
  )
}
