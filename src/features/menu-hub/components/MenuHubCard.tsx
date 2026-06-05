import { router } from 'expo-router'
import { memo } from 'react'
import { Alert, Pressable, Text, View } from 'react-native'

import { PressableScale } from '@/components/ui/game'
import { theme } from '@/constants'
import type { MenuHubItemDef } from '@/features/menu-hub/constants/menu-hub-catalog'
import {
    MENU_HUB_CARD_HEIGHT,
    MENU_HUB_FEATURED_WIDTH,
    MENU_HUB_TILE_WIDTH,
} from '@/features/menu-hub/constants/menu-hub-layout'
import { MENU_HUB_UI } from '@/features/menu-hub/constants/menu-hub-ui'
import { useMenuHubBadge } from '@/features/menu-hub/hooks/use-menu-hub-badge'
import { useMenuHubStore } from '@/features/menu-hub/store/menu-hub-store'
import { cn } from '@/utils'
import { Bookmark } from 'lucide-react-native'

type MenuHubCardProps = {
  item: MenuHubItemDef
  variant?: 'grid' | 'featured'
  showPin?: boolean
}

const badgeToneStyles = {
  default: 'border-border/80 bg-background/90',
  live: 'border-danger/40 bg-danger/15',
  reward: 'border-gold/40 bg-gold/15',
  quest: 'border-primary/35 bg-primary/12',
  locked: 'border-border bg-surface/90',
} as const

const badgeTextStyles = {
  default: 'text-foreground-secondary',
  live: 'text-danger',
  reward: 'text-gold',
  quest: 'text-primary',
  locked: 'text-muted',
} as const

const cardBorderByTone = {
  default: 'border-border/90',
  live: 'border-danger/35',
  reward: 'border-gold/30',
  quest: 'border-primary/25',
  locked: 'border-border',
} as const

const MenuHubCardComponent = ({ item, variant = 'grid', showPin = true }: MenuHubCardProps) => {
  const badge = useMenuHubBadge(item)
  const isPinned = useMenuHubStore((s) => s.pinnedIds.includes(item.id))
  const togglePin = useMenuHubStore((s) => s.togglePin)
  const isLocked = badge.tone === 'locked'
  const showPinControl = showPin && item.pinnable !== false && !isLocked

  const handleOpen = () => {
    if (isLocked) return
    router.push(item.route)
  }

  const handlePin = () => {
    if (isLocked) return
    const ok = togglePin(item.id)
    if (!ok) {
      Alert.alert(MENU_HUB_UI.favoritesTitle, MENU_HUB_UI.favoritesMax)
    }
  }

  const isFeatured = variant === 'featured'

  return (
    <PressableScale
      onPress={handleOpen}
      disabled={isLocked}
      accessibilityRole="button"
      accessibilityLabel={
        isLocked && item.requiredLevel != null
          ? MENU_HUB_UI.lockedAccessibility(item.label, item.requiredLevel)
          : `${item.label}. ${item.hint}`
      }
      accessibilityState={{ disabled: isLocked }}
      className={cn(
        isFeatured ? MENU_HUB_FEATURED_WIDTH : MENU_HUB_TILE_WIDTH,
        MENU_HUB_CARD_HEIGHT,
      )}>
      <View
        className={cn(
          'w-full flex-col rounded-2xl border bg-surface px-2.5 py-2.5',
          MENU_HUB_CARD_HEIGHT,
          cardBorderByTone[badge.tone],
          isLocked && 'opacity-55',
        )}>
        <View className="h-6 flex-row items-start justify-between gap-1">
          {badge.label ? (
            <View
              className={cn(
                'max-w-[72px] shrink rounded-md border px-1.5 py-0.5',
                badgeToneStyles[badge.tone],
              )}>
              <Text
                className={cn('text-center text-[8px] font-bold leading-3', badgeTextStyles[badge.tone])}
                numberOfLines={1}>
                {badge.label}
              </Text>
            </View>
          ) : (
            <View className="h-6 min-w-0 flex-1" />
          )}

          {showPinControl ? (
            <Pressable
              onPress={handlePin}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={isPinned ? MENU_HUB_UI.favoritesUnpin : MENU_HUB_UI.favoritesPin}
              className="h-6 w-6 shrink-0 items-center justify-center">
              <Bookmark
                size={15}
                strokeWidth={isPinned ? 2.25 : 2}
                color={isPinned ? theme.colors.gold : theme.colors.muted}
                fill={isPinned ? theme.colors.gold : 'transparent'}
              />
            </Pressable>
          ) : (
            <View className="h-6 w-6 shrink-0" />
          )}
        </View>

        <Text className="mt-0.5 text-xl leading-6">{item.emoji}</Text>
        <Text className="mt-1 text-xs font-bold leading-4 text-foreground" numberOfLines={1}>
          {item.label}
        </Text>
        <Text
          className="mt-0.5 min-h-[28px] text-[10px] leading-3.5 text-foreground-secondary"
          numberOfLines={2}>
          {isLocked && item.requiredLevel != null
            ? MENU_HUB_UI.lockedHint(item.requiredLevel)
            : item.hint}
        </Text>
      </View>
    </PressableScale>
  )
}

export const MenuHubCard = memo(
  MenuHubCardComponent,
  (prev, next) =>
    prev.item.id === next.item.id &&
    prev.variant === next.variant &&
    prev.showPin === next.showPin,
)
