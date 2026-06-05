import { useEffect } from 'react'
import { Text, View } from 'react-native'
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated'

import { theme } from '@/constants'
import { cn } from '@/utils'

type ProgressBarProps = {
  value: number
  max?: number
  label?: string
  showLabel?: boolean
  className?: string
  trackClassName?: string
  accessibilityLabel?: string
  variant?: 'default' | 'xp' | 'streak' | 'gold'
  height?: 'sm' | 'md' | 'lg'
  animated?: boolean
}

const fillColors = {
  default: theme.colors.primary,
  xp: theme.colors.xp,
  streak: theme.colors.streak,
  gold: theme.colors.gold,
}

const heightStyles = {
  sm: 'h-2',
  md: 'h-2.5',
  lg: 'h-3.5',
}

const clampPercent = (value: number, max: number): number => {
  if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) return 0
  const clamped = Math.min(Math.max(value, 0), max)
  return Math.min(100, Math.max(0, (clamped / max) * 100))
}

export const ProgressBar = ({
  value,
  max = 100,
  label,
  showLabel = false,
  className,
  trackClassName,
  accessibilityLabel,
  variant = 'default',
  height = 'md',
  animated = true,
}: ProgressBarProps) => {
  const percentage = clampPercent(value, max)
  const progress = useSharedValue(percentage)

  useEffect(() => {
    const next = clampPercent(value, max)
    progress.value = animated ? withTiming(next, { duration: 280 }) : next
  }, [animated, max, progress, value])

  const fillStyle = useAnimatedStyle(() => ({
    width: `${Math.min(100, Math.max(0, progress.value))}%`,
  }))

  const clamped = Number.isFinite(value) ? Math.min(Math.max(value, 0), max) : 0

  return (
    <View className={cn('w-full', className)} accessibilityRole="progressbar">
      {(showLabel || label) && (
        <View className="mb-3 flex-row items-center justify-between">
          {label ? <Text className="text-sm font-medium text-foreground-secondary">{label}</Text> : null}
          {showLabel ? (
            <Text className="text-sm font-semibold text-accent">{Math.round(percentage)}%</Text>
          ) : null}
        </View>
      )}
      <View
        className={cn(
          'w-full overflow-hidden rounded-full bg-background/80',
          heightStyles[height],
          trackClassName,
        )}
        accessibilityLabel={accessibilityLabel ?? label ?? `Progresso ${Math.round(percentage)}%`}
        accessibilityValue={{ min: 0, max, now: clamped }}>
        <Animated.View
          className="h-full rounded-full"
          style={[
            fillStyle,
            {
              backgroundColor: fillColors[variant],
              shadowColor: fillColors[variant],
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.55,
              shadowRadius: 8,
            },
          ]}
        />
      </View>
    </View>
  )
}
