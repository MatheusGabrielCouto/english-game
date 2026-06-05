import { View } from 'react-native'

import { cn } from '@/utils'

import { AchievementItemSkeleton } from './AchievementItemSkeleton'
import { CardSkeleton } from './CardSkeleton'
import { ListItemSkeleton } from './ListItemSkeleton'
import { SectionHeaderSkeleton } from './SectionHeaderSkeleton'
import { SkeletonBlock } from './SkeletonBlock'
import { StaggeredSkeletonWrapper } from './StaggeredSkeletonWrapper'

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
  | 'inventory'
  | 'achievements'
  | 'session'

type ScreenSkeletonProps = {
  variant?: ScreenSkeletonVariant
  listCount?: number
  className?: string
}

const StaggeredListItems = ({
  count,
  startIndex = 0,
}: {
  count: number
  startIndex?: number
}) =>
  Array.from({ length: count }, (_, index) => (
    <ListItemSkeleton key={`list-${startIndex + index}`} staggerIndex={startIndex + index} />
  ))

const StaggeredAchievementItems = ({
  count,
  startIndex = 0,
}: {
  count: number
  startIndex?: number
}) =>
  Array.from({ length: count }, (_, index) => (
    <AchievementItemSkeleton
      key={`achievement-${startIndex + index}`}
      staggerIndex={startIndex + index}
    />
  ))

const HeroListSkeleton = ({ listCount }: { listCount: number }) => (
  <>
    <CardSkeleton variant="hero" staggerIndex={0} />
    <CardSkeleton staggerIndex={1} />
    <SectionHeaderSkeleton staggerIndex={2} />
    <StaggeredListItems count={listCount} startIndex={3} />
  </>
)

const HomeSkeleton = () => (
  <>
    <CardSkeleton variant="hero" staggerIndex={0} />
    <CardSkeleton staggerIndex={1} />
    <CardSkeleton staggerIndex={2} />
    <CardSkeleton staggerIndex={3} />
    <CardSkeleton staggerIndex={4} />
    <CardSkeleton staggerIndex={5} />
    <CardSkeleton variant="row" staggerIndex={6} />
    <CardSkeleton staggerIndex={7} />
    <CardSkeleton staggerIndex={8} />
    <CardSkeleton staggerIndex={9} />
    <CardSkeleton staggerIndex={10} />
  </>
)

const QuestSkeleton = () => (
  <>
    <CardSkeleton staggerIndex={0} />
    <CardSkeleton staggerIndex={1} />
    <SectionHeaderSkeleton staggerIndex={2} />
    <StaggeredListItems count={3} startIndex={3} />
    <StaggeredSkeletonWrapper staggerIndex={6}>
      <SkeletonBlock className="h-px w-full" staggerIndex={18} />
    </StaggeredSkeletonWrapper>
    <SectionHeaderSkeleton staggerIndex={7} />
    <StaggeredListItems count={2} startIndex={8} />
  </>
)

const PetSkeleton = () => (
  <>
    <StaggeredSkeletonWrapper staggerIndex={0}>
      <SkeletonBlock className="h-14 rounded-2xl border border-border" staggerIndex={0} />
    </StaggeredSkeletonWrapper>
    <StaggeredSkeletonWrapper staggerIndex={1}>
      <View className="items-center gap-4 rounded-2xl border border-border bg-surface p-6">
        <SkeletonBlock className="h-32 w-32 rounded-full" staggerIndex={3} />
        <SkeletonBlock className="h-4 w-40" staggerIndex={4} />
        <SkeletonBlock className="h-16 w-full rounded-xl" staggerIndex={5} />
      </View>
    </StaggeredSkeletonWrapper>
    <StaggeredSkeletonWrapper staggerIndex={2}>
      <View className="flex-row gap-2">
        <SkeletonBlock className="h-16 flex-1 rounded-xl" staggerIndex={6} />
        <SkeletonBlock className="h-16 flex-1 rounded-xl" staggerIndex={7} />
        <SkeletonBlock className="h-16 flex-1 rounded-xl" staggerIndex={8} />
      </View>
    </StaggeredSkeletonWrapper>
    <StaggeredSkeletonWrapper staggerIndex={3}>
      <View className="flex-row flex-wrap gap-2">
        {Array.from({ length: 4 }, (_, index) => (
          <SkeletonBlock
            key={index}
            className="h-20 min-w-[47%] flex-1 rounded-2xl"
            staggerIndex={9 + index}
          />
        ))}
      </View>
    </StaggeredSkeletonWrapper>
    <CardSkeleton staggerIndex={4} />
    <SectionHeaderSkeleton staggerIndex={5} />
    <StaggeredSkeletonWrapper staggerIndex={6}>
      <View className="flex-row flex-wrap gap-2">
        {Array.from({ length: 6 }, (_, index) => (
          <SkeletonBlock
            key={index}
            className="h-24 w-[30%] min-w-[100px] rounded-2xl"
            staggerIndex={14 + index}
          />
        ))}
      </View>
    </StaggeredSkeletonWrapper>
  </>
)

const CitySkeleton = () => (
  <>
    <CardSkeleton variant="hero" staggerIndex={0} />
    <CardSkeleton staggerIndex={1} />
    <CardSkeleton staggerIndex={2} />
    <SectionHeaderSkeleton staggerIndex={3} />
    <StaggeredSkeletonWrapper staggerIndex={4}>
      <SkeletonBlock className="h-40 rounded-2xl" staggerIndex={12} />
    </StaggeredSkeletonWrapper>
    <SectionHeaderSkeleton staggerIndex={5} />
    <StaggeredListItems count={4} startIndex={6} />
  </>
)

const ShopSkeleton = () => (
  <>
    <CardSkeleton variant="hero" staggerIndex={0} />
    <CardSkeleton staggerIndex={1} />
    <StaggeredSkeletonWrapper staggerIndex={2}>
      <View className="flex-row flex-wrap gap-2">
        <SkeletonBlock className="h-28 min-w-[47%] flex-1 rounded-2xl" staggerIndex={6} />
        <SkeletonBlock className="h-28 min-w-[47%] flex-1 rounded-2xl" staggerIndex={7} />
      </View>
    </StaggeredSkeletonWrapper>
    <SectionHeaderSkeleton staggerIndex={3} />
    <StaggeredListItems count={2} startIndex={4} />
    <SectionHeaderSkeleton staggerIndex={6} />
    <StaggeredSkeletonWrapper staggerIndex={7}>
      <View className="flex-row flex-wrap gap-2">
        {Array.from({ length: 4 }, (_, index) => (
          <SkeletonBlock
            key={index}
            className="h-24 min-w-[47%] flex-1 rounded-2xl"
            staggerIndex={16 + index}
          />
        ))}
      </View>
    </StaggeredSkeletonWrapper>
  </>
)

const FocusSkeleton = () => (
  <>
    <CardSkeleton staggerIndex={0} />
    <StaggeredSkeletonWrapper staggerIndex={1}>
      <View className="gap-3 rounded-2xl border border-border bg-surface p-4">
        <SkeletonBlock className="h-4 w-32" staggerIndex={4} />
        <View className="flex-row flex-wrap gap-2">
          {Array.from({ length: 4 }, (_, index) => (
            <SkeletonBlock
              key={index}
              className="h-12 min-w-[30%] flex-1 rounded-xl"
              staggerIndex={5 + index}
            />
          ))}
        </View>
        <SkeletonBlock className="h-12 w-full rounded-xl" staggerIndex={9} />
        <SkeletonBlock className="h-14 w-full rounded-xl" staggerIndex={10} />
      </View>
    </StaggeredSkeletonWrapper>
  </>
)

const LearningSkeleton = () => (
  <>
    <CardSkeleton variant="hero" staggerIndex={0} />
    <SectionHeaderSkeleton staggerIndex={1} />
    <StaggeredSkeletonWrapper staggerIndex={2}>
      <View className="flex-row flex-wrap gap-2">
        <SkeletonBlock className="h-24 min-w-[47%] flex-1 rounded-2xl" staggerIndex={6} />
        <SkeletonBlock className="h-24 min-w-[47%] flex-1 rounded-2xl" staggerIndex={7} />
      </View>
    </StaggeredSkeletonWrapper>
    <SectionHeaderSkeleton staggerIndex={3} />
    <StaggeredListItems count={3} startIndex={4} />
  </>
)

const MapSkeleton = () => (
  <>
    <StaggeredSkeletonWrapper staggerIndex={0}>
      <SkeletonBlock className="h-10 rounded-xl" staggerIndex={0} />
    </StaggeredSkeletonWrapper>
    <StaggeredSkeletonWrapper staggerIndex={1}>
      <SkeletonBlock className="h-72 rounded-2xl" staggerIndex={2} />
    </StaggeredSkeletonWrapper>
    <StaggeredSkeletonWrapper staggerIndex={2}>
      <View className="flex-row gap-2">
        <SkeletonBlock className="h-12 flex-1 rounded-xl" staggerIndex={4} />
        <SkeletonBlock className="h-12 flex-1 rounded-xl" staggerIndex={5} />
        <SkeletonBlock className="h-12 flex-1 rounded-xl" staggerIndex={6} />
      </View>
    </StaggeredSkeletonWrapper>
  </>
)

const VaultSkeleton = ({ listCount }: { listCount: number }) => (
  <>
    <StaggeredSkeletonWrapper staggerIndex={0}>
      <SkeletonBlock className="h-14 rounded-2xl border border-border" staggerIndex={0} />
    </StaggeredSkeletonWrapper>
    <CardSkeleton variant="hero" staggerIndex={1} />
    <StaggeredSkeletonWrapper staggerIndex={2}>
      <View className="flex-row flex-wrap gap-2">
        <SkeletonBlock className="h-24 min-w-[47%] flex-1 rounded-2xl" staggerIndex={8} />
        <SkeletonBlock className="h-24 min-w-[47%] flex-1 rounded-2xl" staggerIndex={9} />
      </View>
    </StaggeredSkeletonWrapper>
    <CardSkeleton staggerIndex={3} />
    <StaggeredListItems count={listCount} startIndex={4} />
  </>
)

const InventorySkeleton = ({ listCount }: { listCount: number }) => (
  <>
    <CardSkeleton variant="hero" staggerIndex={0} />
    <SectionHeaderSkeleton staggerIndex={1} />
    <CardSkeleton staggerIndex={2} />
    <SectionHeaderSkeleton staggerIndex={3} />
    <StaggeredListItems count={listCount} startIndex={4} />
    <SectionHeaderSkeleton staggerIndex={4 + listCount} />
    <StaggeredListItems count={2} startIndex={5 + listCount} />
  </>
)

const AchievementsSkeleton = ({ listCount }: { listCount: number }) => (
  <>
    <CardSkeleton variant="hero" staggerIndex={0} />
    <CardSkeleton staggerIndex={1} />
    <SectionHeaderSkeleton staggerIndex={2} />
    <StaggeredAchievementItems count={listCount} startIndex={3} />
    <SectionHeaderSkeleton staggerIndex={3 + listCount} />
    <StaggeredAchievementItems count={3} startIndex={4 + listCount} />
  </>
)

const SessionSkeleton = () => (
  <StaggeredSkeletonWrapper staggerIndex={0}>
    <View className="items-center gap-4 py-8">
      <SkeletonBlock className="h-48 w-full max-w-sm rounded-2xl" staggerIndex={0} />
      <SkeletonBlock className="h-12 w-full max-w-sm rounded-xl" staggerIndex={1} />
      <View className="flex-row gap-2">
        <SkeletonBlock className="h-12 flex-1 rounded-xl" staggerIndex={2} />
        <SkeletonBlock className="h-12 flex-1 rounded-xl" staggerIndex={3} />
      </View>
    </View>
  </StaggeredSkeletonWrapper>
)

export const ScreenSkeleton = ({
  variant = 'hero-list',
  listCount = 5,
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
        return <VaultSkeleton listCount={listCount} />
      case 'inventory':
        return <InventorySkeleton listCount={listCount} />
      case 'achievements':
        return <AchievementsSkeleton listCount={listCount} />
      case 'session':
        return <SessionSkeleton />
      case 'hero-list':
      default:
        return <HeroListSkeleton listCount={listCount} />
    }
  })()

  return <View className={cn('gap-4 pb-4', className)}>{content}</View>
}
