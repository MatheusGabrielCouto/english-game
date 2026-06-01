import { View } from 'react-native'

import { GameCard } from '@/components/ui/game'
import { cn } from '@/utils'

type HomeCardSkeletonProps = {
  variant?: 'hero' | 'card' | 'row' | 'compact'
  className?: string
}

export const HomeCardSkeleton = ({ variant = 'card', className }: HomeCardSkeletonProps) => {
  if (variant === 'hero') {
    return (
      <GameCard variant="hero" className={cn('overflow-hidden', className)}>
        <View className="flex-row gap-4">
          <View className="h-16 w-16 rounded-full bg-surface-elevated" />
          <View className="flex-1 gap-2">
            <View className="h-3 w-24 rounded bg-surface-elevated" />
            <View className="h-7 w-40 rounded bg-surface-elevated" />
            <View className="h-6 w-28 rounded bg-surface-elevated" />
          </View>
          <View className="h-8 w-16 rounded-lg bg-surface-elevated" />
        </View>
        <View className="mt-5 gap-2">
          <View className="h-3 w-20 rounded bg-surface-elevated" />
          <View className="h-3 w-full rounded-full bg-surface-elevated" />
        </View>
        <View className="mt-4 flex-row gap-2">
          <View className="h-10 flex-1 rounded-xl bg-surface-elevated" />
          <View className="h-10 flex-1 rounded-xl bg-surface-elevated" />
        </View>
        <View className="mt-4 h-20 rounded-xl bg-surface-elevated" />
      </GameCard>
    )
  }

  if (variant === 'row') {
    return (
      <View className={cn('flex-row items-center gap-3', className)}>
        <View className="h-8 w-8 rounded-full bg-surface-elevated" />
        <View className="h-4 flex-1 rounded bg-surface-elevated" />
      </View>
    )
  }

  if (variant === 'compact') {
    return (
      <View className={cn('h-[74px] rounded-xl border border-border bg-surface', className)} />
    )
  }

  return (
    <View className={cn('rounded-2xl border border-border bg-surface p-4', className)}>
      <View className="h-3 w-28 rounded bg-surface-elevated" />
      <View className="mt-3 h-6 w-3/4 rounded bg-surface-elevated" />
      <View className="mt-2 h-4 w-1/2 rounded bg-surface-elevated" />
      <View className="mt-4 h-2 w-full rounded-full bg-surface-elevated" />
    </View>
  )
}
