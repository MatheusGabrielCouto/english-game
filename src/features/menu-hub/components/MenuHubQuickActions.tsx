import { router } from 'expo-router'
import { ScrollView, Text, View } from 'react-native'

import { PressableScale } from '@/components/ui/game'
import { MENU_HUB_QUICK_ACTIONS } from '@/features/menu-hub/constants/menu-hub-catalog'
import { MENU_HUB_UI } from '@/features/menu-hub/constants/menu-hub-ui'
import { HomeSectionLabel } from '@/features/home/components/shared/HomeSectionLabel'

export const MenuHubQuickActions = () => {
  const actions = MENU_HUB_QUICK_ACTIONS.filter((action) => action.isEnabled?.() ?? true)

  return (
    <View className="gap-3">
      <HomeSectionLabel
        emoji="⚡"
        title={MENU_HUB_UI.quickActionsTitle}
        subtitle={MENU_HUB_UI.quickActionsHint}
        tone="accent"
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 10, paddingRight: 4 }}>
        {actions.map((action) => (
          <PressableScale
            key={action.id}
            onPress={() => router.push(action.route)}
            accessibilityRole="button"
            accessibilityLabel={action.label}>
            <View className="min-w-[132px] flex-row items-center gap-3 rounded-2xl border border-accent/35 bg-accent/10 px-4 py-3.5">
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-accent/20">
                <Text className="text-xl">{action.emoji}</Text>
              </View>
              <Text className="text-sm font-bold text-foreground">{action.label}</Text>
            </View>
          </PressableScale>
        ))}
      </ScrollView>
    </View>
  )
}
