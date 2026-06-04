import { type Href, router } from 'expo-router'
import { Text, View } from 'react-native'

import { Avatar } from '@/components/ui/Avatar'
import { GameCard, LevelBadge, PressableScale } from '@/components/ui/game'
import { routes } from '@/constants'
import { useAppStore } from '@/features/app/store/app-store'
import { HomeCardRow } from '@/features/home/components/shared/HomeCardRow'
import { HomePlayerResourceTile } from '@/features/home/components/shared/HomePlayerResourceTile'
import { HOME_LAYOUT } from '@/features/home/constants/home-layout'
import { getEnabledMenuHubItems } from '@/features/menu-hub/constants/menu-hub-catalog'
import { MENU_HUB_UI } from '@/features/menu-hub/constants/menu-hub-ui'
import { MENU_HUB_MAX_PINS, useMenuHubStore } from '@/features/menu-hub/store/menu-hub-store'
import { usePlayerStore } from '@/features/player'

export const MenuHubHero = () => {
  const name = usePlayerStore((s) => s.name)
  const title = usePlayerStore((s) => s.title)
  const level = usePlayerStore((s) => s.level)
  const avatarFrame = useAppStore((s) => s.avatarFrame)
  const avatarBadge = useAppStore((s) => s.avatarBadge)
  const pinnedCount = useMenuHubStore((s) => s.pinnedIds.length)
  const modeCount = getEnabledMenuHubItems().length

  return (
    <GameCard variant="hero" glow className="overflow-hidden border-primary/30">
      <View className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-primary/12" />
      <View className="pointer-events-none absolute -bottom-6 -left-6 h-20 w-20 rounded-full bg-gold/10" />

      <Text className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">
        {MENU_HUB_UI.heroTitle}
      </Text>

      <HomeCardRow className="mt-4 gap-3">
        <PressableScale
          onPress={() => router.push(routes.tabs.profile as Href)}
          accessibilityRole="button"
          accessibilityLabel="Ver perfil">
          <Avatar name={name} size="lg" frameKey={avatarFrame} badgeKey={avatarBadge} ring />
        </PressableScale>

        <View className={HOME_LAYOUT.growBlock}>
          <Text className="text-xl font-black text-foreground" numberOfLines={1}>
            {MENU_HUB_UI.heroGreeting(name)}
          </Text>
          <View className="mt-2 flex-row flex-wrap items-center gap-2">
            <View className="max-w-full rounded-lg border border-gold/30 bg-gold/12 px-2.5 py-1">
              <Text className="text-xs font-bold text-gold" numberOfLines={1}>
                {title}
              </Text>
            </View>
            <LevelBadge level={level} size="sm" />
          </View>
          <Text className="mt-2 text-xs leading-5 text-foreground-secondary">{MENU_HUB_UI.heroBody}</Text>
        </View>
      </HomeCardRow>

      <View className="mt-4 flex-row gap-2">
        <HomePlayerResourceTile
          emoji="🧭"
          label={MENU_HUB_UI.heroModesLabel}
          value={String(modeCount)}
          tone="primary"
          className="flex-1"
        />
        <HomePlayerResourceTile
          emoji="🔖"
          label={MENU_HUB_UI.heroFavoritesLabel}
          value={MENU_HUB_UI.heroFavoritesValue(pinnedCount, MENU_HUB_MAX_PINS)}
          tone="gold"
          className="flex-1"
        />
      </View>

      <View className="mt-3 rounded-xl border border-primary/25 bg-primary/10 px-3 py-2.5">
        <Text className="text-[11px] font-bold leading-4 text-primary">
          {MENU_HUB_UI.heroModesCount(modeCount)}
        </Text>
        <Text className="mt-1 text-[11px] leading-4 text-foreground-secondary">
          {MENU_HUB_UI.heroPinTip(pinnedCount, MENU_HUB_MAX_PINS)}
        </Text>
      </View>
    </GameCard>
  )
}
