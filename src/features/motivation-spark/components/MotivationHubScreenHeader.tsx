import { type Href, router } from 'expo-router'
import { Text, TouchableOpacity, View } from 'react-native'

import { AppIcon } from '@/components/ui/AppIcon'
import { GameDisplayText } from '@/components/ui/game'
import { routes, theme } from '@/constants'
import { cn } from '@/utils'

import { MOTIVATION_UI } from '../constants/motivation-ui'

type MotivationHubScreenHeaderProps = {
  className?: string
}

const handleBack = () => {
  if (router.canGoBack()) {
    router.back()
    return
  }

  router.replace('/(tabs)' as Href)
}

export const MotivationHubScreenHeader = ({ className }: MotivationHubScreenHeaderProps) => {
  const handleOpenSettings = () => {
    router.push(routes.motivation.settings as Href)
  }

  return (
    <View className={cn('mb-6 pt-2', className)}>
      <View className="flex-row items-center gap-3">
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          className="rounded-xl border border-border bg-surface-elevated p-2"
        >
          <AppIcon name="arrow-back" size={22} color={theme.colors.foreground} />
        </TouchableOpacity>

        <View className="min-w-0 flex-1">
          <GameDisplayText variant="hero" accessibilityRole="header" numberOfLines={2}>
            {MOTIVATION_UI.hub.emoji} {MOTIVATION_UI.hub.title}
          </GameDisplayText>
          <Text className="mt-1 text-sm leading-relaxed text-foreground-secondary">
            {MOTIVATION_UI.hub.subtitle}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleOpenSettings}
          accessibilityRole="button"
          accessibilityLabel={MOTIVATION_UI.settings.title}
          className="rounded-xl border border-orange-500/30 bg-orange-500/10 px-3 py-2"
        >
          <Text className="text-lg">{MOTIVATION_UI.settings.emoji}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
