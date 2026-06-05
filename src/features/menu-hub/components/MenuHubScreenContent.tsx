import { useEffect, useMemo, useState } from 'react'
import { Text, View } from 'react-native'

import { GameCard } from '@/components/ui/game'
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
import { MENU_HUB_UI } from '@/features/menu-hub/constants/menu-hub-ui'
import { useMenuHubStore } from '@/features/menu-hub/store/menu-hub-store'
import { isMenuHubItemUnlocked } from '@/features/menu-hub/utils/menu-hub-unlock'
import { usePlayerStore } from '@/features/player'

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

  return (
    <View className="gap-6 pb-8">
      <MenuHubHero />
      <MenuHubSearchField value={search} onChangeText={setSearch} />
      <MenuHubFavoritesRow items={pinnedItems} />
      <MenuHubQuickActions />

      {filtered.length === 0 ? (
        <GameCard className="items-center gap-2 border-border/80 py-10">
          <Text className="text-4xl">🔎</Text>
          <Text className="text-center text-sm font-semibold text-foreground">{MENU_HUB_UI.searchEmpty}</Text>
        </GameCard>
      ) : (
        sections.map((section) => (
          <MenuHubSection
            key={section.category}
            category={section.category}
            trailing={String(section.items.length)}>
            {section.items.map((item) => (
              <MenuHubCard key={`${item.id}-${String(item.route)}`} item={item} />
            ))}
          </MenuHubSection>
        ))
      )}
    </View>
  )
}
