import { FlashList, type ListRenderItemInfo } from '@shopify/flash-list'
import { type ComponentType, type ReactElement, type ReactNode } from 'react'
import { View, type StyleProp, type ViewStyle } from 'react-native'

import {
  VIRTUALIZED_LIST_ESTIMATED_ITEM_SIZE,
  VIRTUALIZED_LIST_THRESHOLD,
} from '@/constants/virtualized-list-ui'
import { cn } from '@/utils'

type VirtualizedListProps<T> = {
  data: readonly T[]
  renderItem: (item: T, index: number) => ReactNode
  keyExtractor: (item: T, index: number) => string
  estimatedItemSize?: number
  threshold?: number
  className?: string
  contentClassName?: string
  ItemSeparatorComponent?: ComponentType | null
  ListHeaderComponent?: ComponentType | ReactElement | null
  ListFooterComponent?: ComponentType | ReactElement | null
  /**
   * @deprecated P-37 — prefer FlashList as root scroll (`scrollable={false}` on screen).
   * Only use for bounded nested lists (e.g. inventory history card).
   */
  nestedInScrollView?: boolean
  /** Always use FlashList even below threshold (root scroll surfaces) */
  forceVirtualized?: boolean
  style?: StyleProp<ViewStyle>
  extraData?: unknown
}

const renderListHeader = (header: VirtualizedListProps<unknown>['ListHeaderComponent']) => {
  if (!header) return null
  if (typeof header === 'function') {
    const Header = header
    return <Header />
  }
  return header
}

export const VirtualizedList = <T,>({
  data,
  renderItem,
  keyExtractor,
  estimatedItemSize = VIRTUALIZED_LIST_ESTIMATED_ITEM_SIZE.journalEntry,
  threshold = VIRTUALIZED_LIST_THRESHOLD,
  className,
  contentClassName,
  ItemSeparatorComponent,
  ListHeaderComponent,
  ListFooterComponent,
  nestedInScrollView = false,
  forceVirtualized = false,
  style,
  extraData,
}: VirtualizedListProps<T>) => {
  const shouldVirtualize = forceVirtualized || data.length > threshold

  if (!shouldVirtualize) {
    return (
      <View className={cn(className, contentClassName)}>
        {renderListHeader(ListHeaderComponent)}
        {data.map((item, index) => (
          <View key={keyExtractor(item, index)}>
            {renderItem(item, index)}
            {ItemSeparatorComponent && index < data.length - 1 ? <ItemSeparatorComponent /> : null}
          </View>
        ))}
        {renderListHeader(ListFooterComponent)}
      </View>
    )
  }

  const flashRenderItem = ({ item, index }: ListRenderItemInfo<T>) => (
    <>{renderItem(item, index)}</>
  )

  return (
    <View className={cn(nestedInScrollView ? undefined : 'flex-1', className)} style={style}>
      <FlashList
        data={data as T[]}
        renderItem={flashRenderItem}
        keyExtractor={keyExtractor}
        estimatedItemSize={estimatedItemSize}
        scrollEnabled={!nestedInScrollView}
        ListHeaderComponent={ListHeaderComponent ?? undefined}
        ListFooterComponent={ListFooterComponent ?? undefined}
        ItemSeparatorComponent={ItemSeparatorComponent ?? undefined}
        contentContainerStyle={{ paddingBottom: 8 }}
        extraData={extraData}
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
}
