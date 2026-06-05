import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { routes, TOUCH_TARGET_CHIP_CLASS, TOUCH_TARGET_MIN_CLASS, vaultSearchHref } from '@/constants';
import { cn } from '@/utils';

import { VAULT_UI, type VaultHubKey } from '../constants/vault-ui';

type VaultHubNavProps = {
  active: VaultHubKey;
  /** tab = aba Knowledge (push nas sub-rotas); stack = fluxo english-journal com replace */
  linkMode?: 'tab' | 'stack';
};

const HUB_ITEMS: { key: VaultHubKey; label: string; emoji: string; path: string }[] = [
  { key: 'library', label: VAULT_UI.hubLibrary, emoji: '🏠', path: routes.vault.library },
  { key: 'spaces', label: VAULT_UI.hubSpaces, emoji: '🗂️', path: routes.vault.spaces },
  {
    key: 'collections',
    label: VAULT_UI.hubCollections,
    emoji: '📁',
    path: routes.vault.collections,
  },
  { key: 'map', label: VAULT_UI.hubMap, emoji: '🧠', path: routes.vault.map },
  {
    key: 'dashboard',
    label: VAULT_UI.hubDashboard,
    emoji: '📊',
    path: routes.vault.dashboard,
  },
];

export const VaultHubNav = ({ active, linkMode = 'tab' }: VaultHubNavProps) => {
  const router = useRouter();

  const handleTab = (item: (typeof HUB_ITEMS)[number]) => {
    if (item.key === active) return;
    if (linkMode === 'tab') {
      router.push(item.path as never);
      return;
    }
    router.replace(item.path as never);
  };

  const handleOpenSearch = () => {
    router.push(vaultSearchHref() as never);
  };

  return (
    <View className="flex-row items-center gap-2">
      <View className="min-w-0 flex-1 rounded-2xl border border-border bg-surface p-1">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ flexDirection: 'row', gap: 4, paddingHorizontal: 2 }}>
          {HUB_ITEMS.map((item) => {
            const selected = item.key === active;
            return (
              <Pressable
                key={item.key}
                onPress={() => handleTab(item)}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                accessibilityLabel={item.label}
                className={cn(
                  'min-w-[72px] flex-row gap-1.5 rounded-xl px-3',
                  TOUCH_TARGET_CHIP_CLASS,
                  selected ? 'bg-primary' : 'bg-transparent',
                )}>
                <Text className="text-sm">{item.emoji}</Text>
                <Text
                  className={cn('text-xs font-bold', selected ? 'text-white' : 'text-foreground')}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
      <Pressable
        onPress={handleOpenSearch}
        accessibilityRole="button"
        accessibilityLabel={VAULT_UI.globalSearchOpen}
        className={cn(
          TOUCH_TARGET_MIN_CLASS,
          'items-center justify-center rounded-2xl border border-border bg-surface',
        )}>
        <Text className="text-base">🔍</Text>
      </Pressable>
    </View>
  );
};
