import { type Href, router } from 'expo-router'
import { Text, View } from 'react-native'

import { PressableScale } from '@/components/ui/game'
import { routes } from '@/constants'
import { AvatarCustomizer } from '@/features/avatar'
import { InventoryService } from '@/features/inventory/services/inventory-service'

import { PROFILE_UI } from '../constants/profile-ui'
import { ProfileCollapsibleSection } from './ProfileCollapsibleSection'

export const ProfilePersonalizationSection = () => {
  const snapshot = InventoryService.getCachedSnapshot()
  const petName = snapshot?.pet?.name ?? PROFILE_UI.noPetYet

  return (
    <ProfileCollapsibleSection
      title={PROFILE_UI.sections.personalization.title}
      emoji={PROFILE_UI.sections.personalization.emoji}
      subtitle={PROFILE_UI.sections.personalization.subtitle}
      defaultOpen>
      <AvatarCustomizer />

      <View className="gap-2 rounded-xl border border-border bg-surface px-4 py-3">
        <Text className="text-sm font-semibold text-foreground">{PROFILE_UI.equippedTitle}</Text>
        <PressableScale
          onPress={() => router.push(routes.titles as Href)}
          accessibilityRole="button"
          accessibilityLabel={PROFILE_UI.equippedTitle}>
          <Text className="text-sm font-bold text-primary">{PROFILE_UI.changeTitle} →</Text>
        </PressableScale>
      </View>

      <View className="gap-2 rounded-xl border border-border bg-surface px-4 py-3">
        <Text className="text-sm font-semibold text-foreground">{PROFILE_UI.favoritePet}</Text>
        <Text className="text-xs text-foreground-secondary">{petName}</Text>
        <PressableScale
          onPress={() => router.push(routes.pet as Href)}
          accessibilityRole="button"
          accessibilityLabel={PROFILE_UI.viewPet}>
          <Text className="text-sm font-bold text-primary">{PROFILE_UI.viewPet} →</Text>
        </PressableScale>
      </View>

      <View className="rounded-xl border border-border/80 bg-surface px-4 py-3">
        <Text className="text-sm font-semibold text-foreground">{PROFILE_UI.themeLabel}</Text>
        <Text className="mt-1 text-xs text-foreground-secondary">{PROFILE_UI.themeHint}</Text>
      </View>
    </ProfileCollapsibleSection>
  )
}
