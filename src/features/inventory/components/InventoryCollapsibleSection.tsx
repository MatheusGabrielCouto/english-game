import { type ReactNode, useState } from 'react'
import { Pressable, Text, View } from 'react-native'

import { AppIcon } from '@/components/ui/AppIcon'
import { GameCard } from '@/components/ui/game'
import { theme } from '@/constants'
import { cn } from '@/utils'

type InventoryCollapsibleSectionProps = {
  title: string
  emoji: string
  subtitle?: string
  badge?: string
  badgeTone?: 'default' | 'reward'
  defaultOpen?: boolean
  children: ReactNode
}

const BADGE_TONE_CLASS = {
  default: 'border-primary/30 bg-primary/10',
  reward: 'border-warning/40 bg-warning/15',
} as const

const BADGE_TEXT_TONE_CLASS = {
  default: 'text-primary',
  reward: 'text-warning',
} as const

export const InventoryCollapsibleSection = ({
  title,
  emoji,
  subtitle,
  badge,
  badgeTone = 'default',
  defaultOpen = false,
  children,
}: InventoryCollapsibleSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <GameCard variant="default" className="overflow-hidden p-0">
      <Pressable
        onPress={() => setIsOpen((current) => !current)}
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}
        accessibilityLabel={`${title}, ${isOpen ? 'recolher' : 'expandir'}`}
        className="flex-row items-center gap-3 px-4 py-3.5">
        <Text className="text-xl">{emoji}</Text>
        <View className="min-w-0 flex-1">
          <Text className="text-sm font-black text-foreground">{title}</Text>
          {subtitle ? (
            <Text className="mt-0.5 text-xs leading-4 text-foreground-secondary" numberOfLines={2}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {badge ? (
          <View className={cn('rounded-full border px-2.5 py-1', BADGE_TONE_CLASS[badgeTone])}>
            <Text className={cn('text-[10px] font-bold', BADGE_TEXT_TONE_CLASS[badgeTone])}>
              {badge}
            </Text>
          </View>
        ) : null}
        <AppIcon
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={theme.colors.muted}
        />
      </Pressable>

      {isOpen ? (
        <View className={cn('gap-3 border-t border-border px-4 pb-4 pt-3')}>{children}</View>
      ) : null}
    </GameCard>
  )
}
