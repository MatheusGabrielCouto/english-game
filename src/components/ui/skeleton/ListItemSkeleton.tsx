import { View } from 'react-native'

import { cn } from '@/utils'

import { SkeletonBlock } from './SkeletonBlock'
import { StaggeredSkeletonWrapper } from './StaggeredSkeletonWrapper'

type ListItemSkeletonProps = {
  className?: string
  staggerIndex?: number
}

export const ListItemSkeleton = ({ className, staggerIndex = 0 }: ListItemSkeletonProps) => {
  const blockBase = staggerIndex * 3

  return (
    <StaggeredSkeletonWrapper staggerIndex={staggerIndex}>
      <View className={cn('gap-2 rounded-2xl border border-border bg-surface p-4', className)}>
        <SkeletonBlock className="h-4 w-2/3" staggerIndex={blockBase} />
        <SkeletonBlock className="h-3 w-1/2" staggerIndex={blockBase + 1} />
        <SkeletonBlock className="h-2 w-full rounded-full" staggerIndex={blockBase + 2} />
      </View>
    </StaggeredSkeletonWrapper>
  )
}
