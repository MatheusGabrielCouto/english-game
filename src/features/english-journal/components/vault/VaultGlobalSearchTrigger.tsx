import { type Href, router } from 'expo-router'
import { Pressable, Text, View } from 'react-native'

import { vaultSearchHref } from '@/constants/routes'

import { VAULT_UI } from '../../constants/vault-ui'

type VaultGlobalSearchTriggerProps = {
  query?: string
}

export const VaultGlobalSearchTrigger = ({ query }: VaultGlobalSearchTriggerProps) => {
  const handlePress = () => {
    router.push(vaultSearchHref(query) as Href)
  }

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={VAULT_UI.globalSearchOpen}
      className="flex-row items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3">
      <Text className="">🔍</Text>
      <View className="min-w-0 flex-1">
        <Text className="text-sm font-semibold text-foreground">
          {query?.trim() ? query.trim() : VAULT_UI.globalSearchTrigger}
        </Text>
        <Text className="mt-0.5 text-xs text-foreground-secondary">
          {VAULT_UI.globalSearchTriggerHint}
        </Text>
      </View>
    </Pressable>
  )
}
