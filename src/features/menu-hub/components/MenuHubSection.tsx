import { type ReactNode, useState } from 'react'
import { Pressable, Text, View } from 'react-native'

import { AppIcon } from '@/components/ui/AppIcon'
import { theme } from '@/constants'
import type { MenuHubCategoryId } from '@/features/menu-hub/constants/menu-hub-catalog'
import { MENU_CATEGORY_ACCENT, MENU_HUB_UI } from '@/features/menu-hub/constants/menu-hub-ui'
import { cn } from '@/utils'

type MenuHubSectionProps = {
  category: MenuHubCategoryId
  children: ReactNode
  trailing?: string
  defaultExpanded?: boolean
}

export const MenuHubSection = ({
  category,
  children,
  trailing,
  defaultExpanded = true,
}: MenuHubSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const meta = MENU_HUB_UI.categories[category]
  const accent = MENU_CATEGORY_ACCENT[category]

  const handleToggle = () => setIsExpanded((current) => !current)

  return (
    <View className="gap-3">
      <Pressable
        onPress={handleToggle}
        accessibilityRole="button"
        accessibilityState={{ expanded: isExpanded }}
        accessibilityLabel={
          isExpanded ? MENU_HUB_UI.sectionCollapse(meta.title) : MENU_HUB_UI.sectionExpand(meta.title)
        }
        className={cn(
          'flex-row items-center gap-3 rounded-2xl border px-3 py-2.5',
          accent.border,
          accent.bg,
        )}>
        <Text className="text-2xl">{meta.emoji}</Text>
        <View className="min-w-0 flex-1">
          <Text className={cn('text-sm font-black', accent.label)}>{meta.title}</Text>
          <Text className="text-xs text-foreground-secondary">{meta.subtitle}</Text>
        </View>
        {trailing ? (
          <View className="rounded-full border border-border bg-background px-2.5 py-1">
            <Text className="text-xs font-bold text-foreground-secondary">{trailing}</Text>
          </View>
        ) : null}
        <AppIcon
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={theme.colors.muted}
        />
      </Pressable>
      {isExpanded ? (
        <View className="flex-row flex-wrap items-stretch gap-2">{children}</View>
      ) : null}
    </View>
  )
}
