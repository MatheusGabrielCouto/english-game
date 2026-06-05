import { type ReactNode } from 'react'
import { View } from 'react-native'

import { GameCard } from '@/components/ui/game'
import { cn } from '@/utils'

import { SkeletonBlock } from './SkeletonBlock'
import { StaggeredSkeletonWrapper } from './StaggeredSkeletonWrapper'

export type CardSkeletonVariant = 'hero' | 'card' | 'row' | 'compact'

type CardSkeletonProps = {
  variant?: CardSkeletonVariant
  className?: string
  staggerIndex?: number
}

export const CardSkeleton = ({
  variant = 'card',
  className,
  staggerIndex = 0,
}: CardSkeletonProps) => {
  const blockBase = staggerIndex * 6

  const wrap = (node: ReactNode) => (
    <StaggeredSkeletonWrapper staggerIndex={staggerIndex}>{node}</StaggeredSkeletonWrapper>
  )

  if (variant === 'hero') {
    return wrap(
      <GameCard variant="hero" className={cn('overflow-hidden', className)}>
        <View className="flex-row gap-4">
          <SkeletonBlock className="h-16 w-16 rounded-full" staggerIndex={blockBase} />
          <View className="flex-1 gap-2">
            <SkeletonBlock className="h-3 w-24" staggerIndex={blockBase + 1} />
            <SkeletonBlock className="h-7 w-40" staggerIndex={blockBase + 2} />
            <SkeletonBlock className="h-6 w-28" staggerIndex={blockBase + 3} />
          </View>
          <SkeletonBlock className="h-8 w-16 rounded-lg" staggerIndex={blockBase + 4} />
        </View>
        <View className="mt-5 gap-2">
          <SkeletonBlock className="h-3 w-20" staggerIndex={blockBase + 5} />
          <SkeletonBlock className="h-3 w-full rounded-full" staggerIndex={blockBase + 6} />
        </View>
        <View className="mt-4 flex-row gap-2">
          <SkeletonBlock className="h-10 flex-1 rounded-xl" staggerIndex={blockBase + 7} />
          <SkeletonBlock className="h-10 flex-1 rounded-xl" staggerIndex={blockBase + 8} />
        </View>
        <SkeletonBlock className="mt-4 h-20 rounded-xl" staggerIndex={blockBase + 9} />
      </GameCard>,
    )
  }

  if (variant === 'row') {
    return wrap(
      <View className={cn('flex-row items-center gap-3', className)}>
        <SkeletonBlock className="h-8 w-8 rounded-full" staggerIndex={blockBase} />
        <SkeletonBlock className="h-4 flex-1" staggerIndex={blockBase + 1} />
      </View>,
    )
  }

  if (variant === 'compact') {
    return wrap(
      <SkeletonBlock
        className={cn('h-[74px] rounded-xl border border-border bg-surface', className)}
        staggerIndex={blockBase}
      />,
    )
  }

  return wrap(
    <View className={cn('rounded-2xl border border-border bg-surface p-4', className)}>
      <SkeletonBlock className="h-3 w-28" staggerIndex={blockBase} />
      <SkeletonBlock className="mt-3 h-6 w-3/4" staggerIndex={blockBase + 1} />
      <SkeletonBlock className="mt-2 h-4 w-1/2" staggerIndex={blockBase + 2} />
      <SkeletonBlock className="mt-4 h-2 w-full rounded-full" staggerIndex={blockBase + 3} />
    </View>,
  )
}
