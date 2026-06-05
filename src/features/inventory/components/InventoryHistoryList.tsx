import { useMemo } from 'react'
import { Text, View } from 'react-native'

import { EmptyState } from '@/components'
import { VirtualizedList } from '@/components/ui'
import { GameCard } from '@/components/ui/game'
import {
  VIRTUALIZED_LIST_ESTIMATED_ITEM_SIZE,
  VIRTUALIZED_LIST_THRESHOLD,
} from '@/constants'
import type { AcquisitionHistoryRecord } from '@/types/inventory'
import { InventoryCategory } from '@/types/inventory'

import { getCategoryLabel } from '../utils/inventory'
import { InventorySectionHeader } from './InventorySectionHeader'

type InventoryHistoryListProps = {
  history: AcquisitionHistoryRecord[]
  hideHeader?: boolean
}

const CATEGORY_EMOJI: Record<string, string> = {
  [InventoryCategory.SHIELD]: '🛡️',
  [InventoryCategory.LOOT_BOX]: '📦',
  [InventoryCategory.PET]: '🐾',
  [InventoryCategory.SPECIAL]: '✨',
}

const INVENTORY_HISTORY_LIST_MAX_HEIGHT = 420

const formatRelativeDate = (isoDate: string): string => {
  const date = new Date(isoDate)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Hoje'
  if (diffDays === 1) return 'Ontem'
  if (diffDays < 7) return `${diffDays}d atrás`
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

const HistoryRow = ({
  entry,
  isLast,
}: {
  entry: AcquisitionHistoryRecord
  isLast: boolean
}) => {
  const emoji = CATEGORY_EMOJI[entry.category] ?? '📌'

  return (
    <View className={`flex-row gap-3 px-4 py-3 ${isLast ? '' : 'border-b border-border/60'}`}>
      <View className="items-center">
        <View className="h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface">
          <Text className="text-base">{emoji}</Text>
        </View>
        {!isLast ? <View className="mt-1 w-px flex-1 bg-border/60" /> : null}
      </View>

      <View className="min-w-0 flex-1 pb-1">
        <View className="flex-row items-center justify-between gap-2">
          <Text className="text-[10px] font-bold uppercase tracking-wide text-primary">
            {getCategoryLabel(entry.category)}
          </Text>
          <Text className="text-[10px] text-muted">{formatRelativeDate(entry.acquiredAt)}</Text>
        </View>
        <Text className="mt-0.5 text-sm font-semibold text-foreground">{entry.message}</Text>
        {entry.quantity !== 0 ? (
          <Text className="mt-0.5 text-xs font-bold text-gold">
            {entry.quantity > 0 ? `+${entry.quantity}` : entry.quantity}
          </Text>
        ) : null}
      </View>
    </View>
  )
}

export const InventoryHistoryList = ({ history, hideHeader = false }: InventoryHistoryListProps) => {
  const shouldVirtualize = history.length > VIRTUALIZED_LIST_THRESHOLD

  const listHeight = useMemo(() => {
    if (!shouldVirtualize) return undefined
    return Math.min(
      history.length * VIRTUALIZED_LIST_ESTIMATED_ITEM_SIZE.inventoryHistory,
      INVENTORY_HISTORY_LIST_MAX_HEIGHT,
    )
  }, [history.length, shouldVirtualize])

  if (history.length === 0) {
    return (
      <EmptyState
        icon="time-outline"
        title="Nenhuma aquisição ainda"
        description="Complete missões, abra loot boxes e visite a loja para ver seu histórico aqui."
      />
    )
  }

  const listBody = (
    <VirtualizedList
      data={history}
      forceVirtualized={shouldVirtualize}
      estimatedItemSize={VIRTUALIZED_LIST_ESTIMATED_ITEM_SIZE.inventoryHistory}
      keyExtractor={(entry) => entry.id}
      style={shouldVirtualize ? { height: listHeight } : undefined}
      renderItem={(entry, index) => (
        <HistoryRow entry={entry} isLast={index === history.length - 1} />
      )}
    />
  )

  return (
    <View className={hideHeader ? 'gap-0' : 'gap-3'}>
      {hideHeader ? null : (
        <InventorySectionHeader
          emoji="📜"
          title="Registro de Loot"
          subtitle="Últimas aquisições da sua aventura"
          badge={`${history.length} entradas`}
        />
      )}

      <GameCard variant="default" className="gap-0 overflow-hidden p-0">
        {listBody}
      </GameCard>
    </View>
  )
}
