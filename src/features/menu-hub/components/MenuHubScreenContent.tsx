import { useEffect, useMemo, useState } from 'react'
import { Text, View } from 'react-native'

import { VirtualizedList } from '@/components/ui'
import { GameCard } from '@/components/ui/game'
import { VIRTUALIZED_LIST_ESTIMATED_ITEM_SIZE } from '@/constants'
import { MenuHubCard } from '@/features/menu-hub/components/MenuHubCard'
import { MenuHubFavoritesRow } from '@/features/menu-hub/components/MenuHubFavoritesRow'
import { MenuHubHero } from '@/features/menu-hub/components/MenuHubHero'
import { MenuHubQuickActions } from '@/features/menu-hub/components/MenuHubQuickActions'
import { MenuHubSearchField } from '@/features/menu-hub/components/MenuHubSearchField'
import { MenuHubSection } from '@/features/menu-hub/components/MenuHubSection'
import {
  getEnabledMenuHubItems,
  type MenuHubCategoryId,
  type MenuHubItemDef,
} from '@/features/menu-hub/constants/menu-hub-catalog'
import { MENU_CATEGORY_ACCENT, MENU_HUB_UI } from '@/features/menu-hub/constants/menu-hub-ui'
import { useMenuHubStore } from '@/features/menu-hub/store/menu-hub-store'
import { isMenuHubItemUnlocked } from '@/features/menu-hub/utils/menu-hub-unlock'
import { usePlayerStore } from '@/features/player'
import { cn } from '@/utils'

const CATEGORY_ORDER: MenuHubCategoryId[] = [
  'progression',
  'knowledge',
  'productivity',
  'collection',
  'meta',
]

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()

const matchesQuery = (item: MenuHubItemDef, query: string) => {
  if (!query) return true
  const haystack = [item.label, item.hint, ...item.searchKeywords].join(' ').toLowerCase()
  return haystack.includes(query)
}

type MenuHubListRow =
  | { kind: 'section'; key: string; category: MenuHubCategoryId; count: number }
  | { kind: 'item'; key: string; item: MenuHubItemDef }

const MenuHubCategoryHeader = ({
  category,
  count,
}: {
  category: MenuHubCategoryId
  count: number
}) => {
  const meta = MENU_HUB_UI.categories[category]
  const accent = MENU_CATEGORY_ACCENT[category]

  return (
    <View
      className={cn(
        'mb-2 mt-4 flex-row items-center gap-3 rounded-2xl border px-3 py-2.5',
        accent.border,
        accent.bg,
      )}>
      <Text className="text-2xl">{meta.emoji}</Text>
      <View className="min-w-0 flex-1">
        <Text className={cn('text-sm font-black', accent.label)}>{meta.title}</Text>
        <Text className="text-xs text-foreground-secondary">{meta.subtitle}</Text>
      </View>
      <View className="rounded-full border border-border bg-background px-2.5 py-1">
        <Text className="text-xs font-bold text-foreground-secondary">{count}</Text>
      </View>
    </View>
  )
}

const MenuHubListHeader = ({
  search,
  onSearchChange,
  pinnedItems,
}: {
  search: string
  onSearchChange: (value: string) => void
  pinnedItems: MenuHubItemDef[]
}) => (
  <View className="gap-6 pb-2">
    <MenuHubHero />
    <MenuHubSearchField value={search} onChangeText={onSearchChange} />
    <MenuHubFavoritesRow items={pinnedItems} />
    <MenuHubQuickActions />
  </View>
)

export const MenuHubScreenContent = () => {
  const [search, setSearch] = useState('')
  const hydrate = useMenuHubStore((s) => s.hydrate)
  const pinnedIds = useMenuHubStore((s) => s.pinnedIds)
  const playerLevel = usePlayerStore((s) => s.level)

  useEffect(() => {
    void hydrate()
  }, [hydrate])

  const items = useMemo(() => getEnabledMenuHubItems(), [])
  const query = normalize(search.trim())

  const filtered = useMemo(
    () => items.filter((item) => matchesQuery(item, query)),
    [items, query],
  )

  const pinnedItems = useMemo(
    () =>
      pinnedIds
        .map((id) => items.find((item) => item.id === id))
        .filter((item): item is MenuHubItemDef => Boolean(item))
        .filter((item) => matchesQuery(item, query)),
    [items, pinnedIds, query],
  )

  const pinnedSet = useMemo(() => new Set(pinnedIds), [pinnedIds])

  const sections = useMemo(
    () =>
      CATEGORY_ORDER.map((category) => ({
        category,
        items: filtered
          .filter((item) => item.category === category && !pinnedSet.has(item.id))
          .sort((left, right) => {
            const leftLocked = !isMenuHubItemUnlocked(left, playerLevel)
            const rightLocked = !isMenuHubItemUnlocked(right, playerLevel)
            if (leftLocked === rightLocked) return 0
            return leftLocked ? 1 : -1
          }),
      })).filter((section) => section.items.length > 0),
    [filtered, pinnedSet, playerLevel],
  )

  const listRows = useMemo(() => {
    const rows: MenuHubListRow[] = []
    for (const section of sections) {
      rows.push({
        kind: 'section',
        key: `section-${section.category}`,
        category: section.category,
        count: section.items.length,
      })
      for (const item of section.items) {
        rows.push({ kind: 'item', key: `${item.id}-${String(item.route)}`, item })
      }
    }
    return rows
  }, [sections])

  const listHeader = (
    <MenuHubListHeader search={search} onSearchChange={setSearch} pinnedItems={pinnedItems} />
  )

  if (filtered.length === 0) {
    return (
      <View className="gap-6 pb-8">
        {listHeader}
        <GameCard className="items-center gap-2 border-border/80 py-10">
          <Text className="text-4xl">🔎</Text>
          <Text className="text-center text-sm font-semibold text-foreground">{MENU_HUB_UI.searchEmpty}</Text>
        </GameCard>
      </View>
    )
  }

  const itemCount = listRows.filter((row) => row.kind === 'item').length

  if (itemCount <= 20) {
    return (
      <View className="gap-6 pb-8">
        {listHeader}
        {sections.map((section) => (
          <MenuHubSection
            key={section.category}
            category={section.category}
            trailing={String(section.items.length)}>
            {section.items.map((item) => (
              <MenuHubCard key={`${item.id}-${String(item.route)}`} item={item} />
            ))}
          </MenuHubSection>
        ))}
      </View>
    )
  }

  return (
    <VirtualizedList
      className="flex-1"
      data={listRows}
      estimatedItemSize={VIRTUALIZED_LIST_ESTIMATED_ITEM_SIZE.menuHubRow}
      keyExtractor={(row) => row.key}
      ListHeaderComponent={listHeader}
      ListFooterComponent={<View className="h-8" />}
      renderItem={(row) =>
        row.kind === 'section' ? (
          <MenuHubCategoryHeader category={row.category} count={row.count} />
        ) : (
          <View className="mb-2">
            <MenuHubCard item={row.item} />
          </View>
        )
      }
      extraData={playerLevel}
    />
  )
}
