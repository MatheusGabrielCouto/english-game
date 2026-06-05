import { View } from 'react-native'

import { GameCard } from '@/components/ui/game'
import { cn } from '@/utils'

import { SkeletonBlock } from './SkeletonBlock'

export type CardSkeletonVariant = 'hero' | 'card' | 'row' | 'compact'

type CardSkeletonProps = {
  variant?: CardSkeletonVariant
  className?: string
}

export const CardSkeleton = ({ variant = 'card', className }: CardSkeletonProps) => {
  if (variant === 'hero') {
    return (
      <GameCard variant="hero" className={cn('overflow-hidden', className)}>
        <View className="flex-row gap-4">
          <SkeletonBlock className="h-16 w-16 rounded-full" />
          <View className="flex-1 gap-2">
            <SkeletonBlock className="h-3 w-24" />
            <SkeletonBlock className="h-7 w-40" />
            <SkeletonBlock className="h-6 w-28" />
          </View>
          <SkeletonBlock className="h-8 w-16 rounded-lg" />
        </View>
        <View className="mt-5 gap-2">
          <SkeletonBlock className="h-3 w-20" />
          <SkeletonBlock className="h-3 w-full rounded-full" />
        </View>
        <View className="mt-4 flex-row gap-2">
          <SkeletonBlock className="h-10 flex-1 rounded-xl" />
          <SkeletonBlock className="h-10 flex-1 rounded-xl" />
        </View>
        <SkeletonBlock className="mt-4 h-20 rounded-xl" />
      </GameCard>
    )
  }

  if (variant === 'row') {
    return (
      <View className={cn('flex-row items-center gap-3', className)}>
        <SkeletonBlock className="h-8 w-8 rounded-full" />
        <SkeletonBlock className="h-4 flex-1" />
      </View>
    )
  }

  if (variant === 'compact') {
    return (
      <SkeletonBlock
        className={cn('h-[74px] rounded-xl border border-border bg-surface', className)}
      />
    )
  }

  return (
    <View className={cn('rounded-2xl border border-border bg-surface p-4', className)}>
      <SkeletonBlock className="h-3 w-28" />
      <SkeletonBlock className="mt-3 h-6 w-3/4" />
      <SkeletonBlock className="mt-2 h-4 w-1/2" />
      <SkeletonBlock className="mt-4 h-2 w-full rounded-full" />
    </View>
  )
}
