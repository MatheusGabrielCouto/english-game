import { View } from 'react-native'

import { cn } from '@/utils'

import { SkeletonBlock } from './SkeletonBlock'

type SectionHeaderSkeletonProps = {
  className?: string
}

export const SectionHeaderSkeleton = ({ className }: SectionHeaderSkeletonProps) => (
  <View className={cn('gap-1 px-1', className)}>
    <SkeletonBlock className="h-4 w-32" />
    <SkeletonBlock className="h-3 w-48" />
  </View>
)
