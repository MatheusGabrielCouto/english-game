import { useEffect } from 'react'
import { Text, View } from 'react-native'
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated'

import { AppIcon } from '@/components/ui/AppIcon'
import { GameDisplayText } from '@/components/ui/game'
import { theme } from '@/constants'
import { cn } from '@/utils'

import {
  REWARD_BURST_COPY,
  resolveRewardBurstBorder,
  resolveRewardBurstEmoji,
} from '../constants/reward-burst-ui'
import { useCelebrationBlocked } from '../hooks/useCelebrationBlocked'
import { useFeedbackStore, type MissionRewardBurst } from '../store/feedback-store'
import { MissionSuccessLottie } from './MissionSuccessLottie'

type RewardBurstItemProps = {
  burst: MissionRewardBurst
  onDone: (id: string) => void
}

const RewardBurstItem = ({ burst, onDone }: RewardBurstItemProps) => {
  const translateY = useSharedValue(40)
  const opacity = useSharedValue(0)
  const scale = useSharedValue(0.85)
  const emoji = resolveRewardBurstEmoji(burst.source)
  const borderClass = resolveRewardBurstBorder(burst.source)
  const batchCount = burst.batchCount ?? 1

  useEffect(() => {
    const lifetimeMs = 2200
    let removed = false

    const finishBurst = () => {
      if (removed) return
      removed = true
      onDone(burst.id)
    }

    opacity.value = withTiming(1, { duration: 200 })
    translateY.value = withSpring(0, { damping: 18, stiffness: 220 })
    scale.value = withSpring(1, { damping: 16, stiffness: 240 })

    const fadeTimeout = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 300 }, (finished) => {
        if (finished) {
          runOnJS(finishBurst)()
        }
      })
      translateY.value = withTiming(-30, { duration: 300 })
    }, lifetimeMs)

    const fallbackTimeout = setTimeout(finishBurst, lifetimeMs + 500)

    return () => {
      removed = true
      clearTimeout(fadeTimeout)
      clearTimeout(fallbackTimeout)
    }
  }, [burst.id, onDone, opacity, scale, translateY])

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }))

  const hasRewards = burst.xp > 0 || burst.coins > 0 || (burst.studyPoints ?? 0) > 0

  return (
    <Animated.View style={style}>
      <View
        className={cn(
          'relative flex-row items-center gap-3 rounded-2xl border bg-surface-elevated px-4 py-3 shadow-lg',
          borderClass,
        )}>
        <MissionSuccessLottie active />
        <Text className="text-2xl">{emoji}</Text>
        <View className="flex-1">
          <GameDisplayText variant="title" numberOfLines={2}>
            {burst.title}
          </GameDisplayText>
          {batchCount > 1 ? (
            <Text className="mt-0.5 text-xs text-foreground-secondary">
              {REWARD_BURST_COPY.multipleActivities(batchCount)}
            </Text>
          ) : null}
          {hasRewards ? (
            <View className="mt-1 flex-row flex-wrap gap-3">
              {burst.xp > 0 ? (
                <View className="flex-row items-center gap-1">
                  <AppIcon name="flash" size={12} color={theme.colors.xp} />
                  <Text className="text-xs font-bold text-xp">+{burst.xp} XP</Text>
                </View>
              ) : null}
              {burst.coins > 0 ? (
                <View className="flex-row items-center gap-1">
                  <AppIcon name="logo-bitcoin" size={12} color={theme.colors.coin} />
                  <Text className="text-xs font-bold text-coin">+{burst.coins}</Text>
                </View>
              ) : null}
              {(burst.studyPoints ?? 0) > 0 ? (
                <View className="flex-row items-center gap-1">
                  <Text className="text-xs">⚡</Text>
                  <Text className="text-xs font-bold text-accent">+{burst.studyPoints} SP</Text>
                </View>
              ) : null}
            </View>
          ) : null}
        </View>
      </View>
    </Animated.View>
  )
}

export const RewardBurstOverlay = () => {
  const burst = useFeedbackStore((state) => state.activeRewardBurst)
  const completeRewardBurst = useFeedbackStore((state) => state.completeRewardBurst)
  const isBlocked = useCelebrationBlocked()

  if (!burst || isBlocked) return null

  return (
    <View
      className="absolute left-0 right-0 top-16 z-50 px-5"
      pointerEvents="none"
      accessibilityLiveRegion="polite">
      <RewardBurstItem burst={burst} onDone={completeRewardBurst} />
    </View>
  )
}
