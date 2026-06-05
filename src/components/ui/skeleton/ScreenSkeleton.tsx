import { View } from 'react-native'

import { cn } from '@/utils'

import { CardSkeleton } from './CardSkeleton'
import { ListItemSkeleton } from './ListItemSkeleton'
import { SectionHeaderSkeleton } from './SectionHeaderSkeleton'
import { SkeletonBlock } from './SkeletonBlock'

export type ScreenSkeletonVariant =
  | 'hero-list'
  | 'home'
  | 'quest'
  | 'pet'
  | 'city'
  | 'shop'
  | 'focus'
  | 'learning'
  | 'map'
  | 'vault'
  | 'session'

type ScreenSkeletonProps = {
  variant?: ScreenSkeletonVariant
  listCount?: number
  className?: string
}

const HeroListSkeleton = ({ listCount }: { listCount: number }) => (
  <>
    <CardSkeleton variant="hero" />
    <CardSkeleton />
    <SectionHeaderSkeleton />
    {Array.from({ length: listCount }, (_, index) => (
      <ListItemSkeleton key={index} />
    ))}
  </>
)

const HomeSkeleton = () => (
  <>
    <CardSkeleton variant="hero" />
    <CardSkeleton />
    <CardSkeleton />
    <CardSkeleton />
    <CardSkeleton />
    <CardSkeleton />
    <CardSkeleton variant="row" />
    <CardSkeleton />
    <CardSkeleton />
    <CardSkeleton />
    <CardSkeleton />
  </>
)

const QuestSkeleton = () => (
  <>
    <CardSkeleton />
    <CardSkeleton />
    <SectionHeaderSkeleton />
    <ListItemSkeleton />
    <ListItemSkeleton />
    <ListItemSkeleton />
    <SkeletonBlock className="h-px w-full" />
    <SectionHeaderSkeleton />
    <ListItemSkeleton />
    <ListItemSkeleton />
  </>
)

const PetSkeleton = () => (
  <>
    <SkeletonBlock className="h-14 rounded-2xl border border-border" />
    <View className="items-center gap-4 rounded-2xl border border-border bg-surface p-6">
      <SkeletonBlock className="h-32 w-32 rounded-full" />
      <SkeletonBlock className="h-4 w-40" />
      <SkeletonBlock className="h-16 w-full rounded-xl" />
    </View>
    <View className="flex-row gap-2">
      <SkeletonBlock className="h-16 flex-1 rounded-xl" />
      <SkeletonBlock className="h-16 flex-1 rounded-xl" />
      <SkeletonBlock className="h-16 flex-1 rounded-xl" />
    </View>
    <View className="flex-row flex-wrap gap-2">
      {Array.from({ length: 4 }, (_, index) => (
        <SkeletonBlock key={index} className="h-20 min-w-[47%] flex-1 rounded-2xl" />
      ))}
    </View>
    <CardSkeleton />
    <SectionHeaderSkeleton />
    <View className="flex-row flex-wrap gap-2">
      {Array.from({ length: 6 }, (_, index) => (
        <SkeletonBlock key={index} className="h-24 w-[30%] min-w-[100px] rounded-2xl" />
      ))}
    </View>
  </>
)

const CitySkeleton = () => (
  <>
    <CardSkeleton variant="hero" />
    <CardSkeleton />
    <CardSkeleton />
    <SectionHeaderSkeleton />
    <SkeletonBlock className="h-40 rounded-2xl" />
    <SectionHeaderSkeleton />
    <ListItemSkeleton />
    <ListItemSkeleton />
    <ListItemSkeleton />
    <ListItemSkeleton />
  </>
)

const ShopSkeleton = () => (
  <>
    <CardSkeleton variant="hero" />
    <CardSkeleton />
    <View className="flex-row flex-wrap gap-2">
      <SkeletonBlock className="h-28 min-w-[47%] flex-1 rounded-2xl" />
      <SkeletonBlock className="h-28 min-w-[47%] flex-1 rounded-2xl" />
    </View>
    <SectionHeaderSkeleton />
    <ListItemSkeleton />
    <ListItemSkeleton />
    <SectionHeaderSkeleton />
    <View className="flex-row flex-wrap gap-2">
      {Array.from({ length: 4 }, (_, index) => (
        <SkeletonBlock key={index} className="h-24 min-w-[47%] flex-1 rounded-2xl" />
      ))}
    </View>
  </>
)

const FocusSkeleton = () => (
  <>
    <CardSkeleton />
    <View className="gap-3 rounded-2xl border border-border bg-surface p-4">
      <SkeletonBlock className="h-4 w-32" />
      <View className="flex-row flex-wrap gap-2">
        {Array.from({ length: 4 }, (_, index) => (
          <SkeletonBlock key={index} className="h-12 min-w-[30%] flex-1 rounded-xl" />
        ))}
      </View>
      <SkeletonBlock className="h-12 w-full rounded-xl" />
      <SkeletonBlock className="h-14 w-full rounded-xl" />
    </View>
  </>
)

const LearningSkeleton = () => (
  <>
    <CardSkeleton variant="hero" />
    <SectionHeaderSkeleton />
    <View className="flex-row flex-wrap gap-2">
      <SkeletonBlock className="h-24 min-w-[47%] flex-1 rounded-2xl" />
      <SkeletonBlock className="h-24 min-w-[47%] flex-1 rounded-2xl" />
    </View>
    <SectionHeaderSkeleton />
    <ListItemSkeleton />
    <ListItemSkeleton />
    <ListItemSkeleton />
  </>
)

const MapSkeleton = () => (
  <>
    <SkeletonBlock className="h-10 rounded-xl" />
    <SkeletonBlock className="h-72 rounded-2xl" />
    <View className="flex-row gap-2">
      <SkeletonBlock className="h-12 flex-1 rounded-xl" />
      <SkeletonBlock className="h-12 flex-1 rounded-xl" />
      <SkeletonBlock className="h-12 flex-1 rounded-xl" />
    </View>
  </>
)

const VaultSkeleton = () => (
  <>
    <SkeletonBlock className="h-14 rounded-2xl border border-border" />
    <CardSkeleton variant="hero" />
    <View className="flex-row flex-wrap gap-2">
      <SkeletonBlock className="h-24 min-w-[47%] flex-1 rounded-2xl" />
      <SkeletonBlock className="h-24 min-w-[47%] flex-1 rounded-2xl" />
    </View>
    <CardSkeleton />
    <ListItemSkeleton />
    <ListItemSkeleton />
    <ListItemSkeleton />
  </>
)

const SessionSkeleton = () => (
  <View className="items-center gap-4 py-8">
    <SkeletonBlock className="h-48 w-full max-w-sm rounded-2xl" />
    <SkeletonBlock className="h-12 w-full max-w-sm rounded-xl" />
    <View className="flex-row gap-2">
      <SkeletonBlock className="h-12 flex-1 rounded-xl" />
      <SkeletonBlock className="h-12 flex-1 rounded-xl" />
    </View>
  </View>
)

export const ScreenSkeleton = ({
  variant = 'hero-list',
  listCount = 3,
  className,
}: ScreenSkeletonProps) => {
  const content = (() => {
    switch (variant) {
      case 'home':
        return <HomeSkeleton />
      case 'quest':
        return <QuestSkeleton />
      case 'pet':
        return <PetSkeleton />
      case 'city':
        return <CitySkeleton />
      case 'shop':
        return <ShopSkeleton />
      case 'focus':
        return <FocusSkeleton />
      case 'learning':
        return <LearningSkeleton />
      case 'map':
        return <MapSkeleton />
      case 'vault':
        return <VaultSkeleton />
      case 'session':
        return <SessionSkeleton />
      case 'hero-list':
      default:
        return <HeroListSkeleton listCount={listCount} />
    }
  })()

  return <View className={cn('gap-4 pb-4', className)}>{content}</View>
}
