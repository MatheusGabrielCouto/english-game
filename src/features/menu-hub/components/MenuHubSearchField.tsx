import { Platform, Pressable, Text, TextInput, View } from 'react-native'

import { MENU_HUB_UI } from '@/features/menu-hub/constants/menu-hub-ui'

type MenuHubSearchFieldProps = {
  value: string
  onChangeText: (text: string) => void
}

export const MenuHubSearchField = ({ value, onChangeText }: MenuHubSearchFieldProps) => (
  <View>
    <Text className="text-[10px] font-black uppercase tracking-[0.18em] text-foreground-secondary">
      {MENU_HUB_UI.searchLabel}
    </Text>
    <View className="mt-2 flex-row items-center gap-2 rounded-2xl border border-border bg-surface-elevated px-3">
      <Text className="text-lg">🔍</Text>
      <TextInput
        className="h-11 flex-1 text-foreground"
        style={{
          paddingVertical: 0,
          textAlignVertical: 'center',
          ...(Platform.OS === 'android' ? { includeFontPadding: false } : null),
        }}
        value={value}
        onChangeText={onChangeText}
        placeholder={MENU_HUB_UI.searchPlaceholder}
        placeholderTextColor="#71717a"
        autoCapitalize="none"
        autoCorrect={false}
        accessibilityLabel={MENU_HUB_UI.searchPlaceholder}
      />
      {value.length > 0 ? (
        <Pressable
          onPress={() => onChangeText('')}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={MENU_HUB_UI.searchClear}>
          <Text className="text-xs font-bold text-primary">✕</Text>
        </Pressable>
      ) : null}
    </View>
  </View>
)
