import { type Href, router } from 'expo-router'
import { Text, View } from 'react-native'
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import { useEffect } from 'react'

import { GameCard, PressableScale, StreakFlame } from '@/components/ui/game'
import { HomeCardRow } from '@/features/home/components/shared/HomeCardRow'
import { HomeStatGrid } from '@/features/home/components/shared/HomeStatGrid'
import { HomeStatPill } from '@/features/home/components/shared/HomeStatPill'
import { HOME_LAYOUT } from '@/features/home/constants/home-layout'
import { HOME_UI } from '@/features/home/constants/home-ui'
import { useHomeInfiniteAnimationsActive } from '@/features/home/hooks/use-home-infinite-animations-active'
import { getStreakGlowIntensity } from '@/features/home/utils/home-dashboard'
import { usePlayerStore } from '@/features/player'
import { cn } from '@/utils'

export const HomeStreakCard = () => {
  const currentStreak = usePlayerStore((s) => s.currentStreak)
  const bestStreak = usePlayerStore((s) => s.bestStreak)
  const shields = usePlayerStore((s) => s.shields)
  const animationsActive = useHomeInfiniteAnimationsActive()
  const glow = getStreakGlowIntensity(currentStreak)
  const pulse = useSharedValue(1)

  useEffect(() => {
    if (!animationsActive || currentStreak <= 0) {
      cancelAnimation(pulse)
      pulse.value = 1
      return
    }

    const scale = glow === 'high' ? 1.08 : glow === 'mid' ? 1.05 : 1.03
    pulse.value = withRepeat(
      withSequence(withTiming(scale, { duration: 700 }), withTiming(1, { duration: 700 })),
      -1,
      false,
    )
  }, [animationsActive, currentStreak, glow, pulse])

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow === 'off' ? 0.35 : glow === 'low' ? 0.55 : glow === 'mid' ? 0.75 : 1,
    transform: [{ scale: pulse.value }],
  }))

  const hint = currentStreak > 0 ? HOME_UI.streak.hintActive : HOME_UI.streak.hintIdle

  return (
    <PressableScale
      fill
      onPress={() => router.push('/statistics' as Href)}
      accessibilityRole="button"
      accessibilityLabel={`${HOME_UI.streak.title}. ${currentStreak} dias`}
    >
      <GameCard
        variant="reward"
        glow={currentStreak >= 7}
        className={cn(
          'border-warning/35',
          glow === 'high' && 'border-streak/50',
        )}
      >
        <HomeCardRow className="justify-between gap-3">
          <View className={HOME_LAYOUT.growBlock}>
            <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-warning">
              {HOME_UI.streak.title}
            </Text>
            <View className="mt-2 flex-row flex-wrap items-center gap-2">
              <Animated.View style={glowStyle}>
                <StreakFlame streak={currentStreak} size={32} showLabel animate={animationsActive} />
              </Animated.View>
            </View>
            <Text className="mt-2 text-sm leading-5 text-foreground-secondary">{hint}</Text>
          </View>
          <Text className="shrink-0 text-4xl">
            {currentStreak >= 30 ? '🔥' : currentStreak > 0 ? '✨' : '💤'}
          </Text>
        </HomeCardRow>

        <HomeStatGrid className="mt-4">
          <HomeStatPill emoji="🏆" label={HOME_UI.streak.best} value={bestStreak} tone="gold" />
          <HomeStatPill emoji="🛡️" label={HOME_UI.streak.shields} value={shields} tone="accent" />
        </HomeStatGrid>
      </GameCard>
    </PressableScale>
  )
}
