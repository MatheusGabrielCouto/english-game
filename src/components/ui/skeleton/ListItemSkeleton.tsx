import { View } from 'react-native'

import { cn } from '@/utils'

import { SkeletonBlock } from './SkeletonBlock'

type ListItemSkeletonProps = {
  className?: string
}

export const ListItemSkeleton = ({ className }: ListItemSkeletonProps) => (
  <View className={cn('gap-2 rounded-2xl border border-border bg-surface p-4', className)}>
    <SkeletonBlock className="h-4 w-2/3" />
    <SkeletonBlock className="h-3 w-1/2" />
    <SkeletonBlock className="h-2 w-full rounded-full" />
  </View>
)
