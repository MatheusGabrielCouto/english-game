import { View } from 'react-native'

import { cn } from '@/utils'

import { SkeletonBlock } from './SkeletonBlock'
import { StaggeredSkeletonWrapper } from './StaggeredSkeletonWrapper'

type SectionHeaderSkeletonProps = {
  className?: string
  staggerIndex?: number
}

export const SectionHeaderSkeleton = ({
  className,
  staggerIndex = 0,
}: SectionHeaderSkeletonProps) => {
  const blockBase = staggerIndex * 2

  const content = (
    <View className={cn('gap-1 px-1', className)}>
      <SkeletonBlock className="h-4 w-32" staggerIndex={blockBase} />
      <SkeletonBlock className="h-3 w-48" staggerIndex={blockBase + 1} />
    </View>
  )

  return <StaggeredSkeletonWrapper staggerIndex={staggerIndex}>{content}</StaggeredSkeletonWrapper>
}
