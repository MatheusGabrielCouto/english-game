import { View } from 'react-native'

import { SkeletonBlock } from './SkeletonBlock'
import { StaggeredSkeletonWrapper } from './StaggeredSkeletonWrapper'

type AchievementItemSkeletonProps = {
  staggerIndex: number
}

export const AchievementItemSkeleton = ({ staggerIndex }: AchievementItemSkeletonProps) => {
  const blockBase = staggerIndex * 4

  return (
    <StaggeredSkeletonWrapper staggerIndex={staggerIndex}>
      <View className="flex-row items-start gap-3 rounded-2xl border border-border bg-surface p-4">
        <SkeletonBlock className="h-12 w-12 rounded-xl" staggerIndex={blockBase} />
        <View className="min-w-0 flex-1 gap-2">
          <SkeletonBlock className="h-4 w-3/4" staggerIndex={blockBase + 1} />
          <SkeletonBlock className="h-3 w-1/3" staggerIndex={blockBase + 2} />
          <SkeletonBlock className="h-2 w-full rounded-full" staggerIndex={blockBase + 3} />
        </View>
      </View>
    </StaggeredSkeletonWrapper>
  )
}
