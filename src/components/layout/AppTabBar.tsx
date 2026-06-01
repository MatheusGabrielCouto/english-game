import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon, type AppIconName } from '@/components/ui/AppIcon';
import { theme } from '@/constants';
import { AudioDirector } from '@/services/audio';
import { haptics } from '@/utils/haptics';

type TabRouteName = 'index' | 'quests' | 'inventory' | 'shop' | 'profile';

type TabRoute = {
  key: string;
  name: string;
};

type TabNavigation = {
  navigate: (name: TabRouteName) => void;
};

type AppTabBarProps = {
  state: { index: number; routes: TabRoute[] };
  navigation: TabNavigation;
};

type TabConfig = {
  icon: AppIconName;
  label: string;
  emoji: string;
};

const TAB_CONFIG: Record<TabRouteName, TabConfig> = {
  index: { icon: 'home-outline', label: 'Base', emoji: '🏠' },
  quests: { icon: 'map-outline', label: 'Missões', emoji: '⚔️' },
  inventory: { icon: 'briefcase-outline', label: 'Itens', emoji: '🎒' },
  shop: { icon: 'cart-outline', label: 'Loja', emoji: '🛒' },
  profile: { icon: 'person-outline', label: 'Perfil', emoji: '👤' },
};

export const AppTabBar = ({ state, navigation }: AppTabBarProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Math.max(insets.bottom, 10),
        },
      ]}>
      <View style={styles.row}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const config = TAB_CONFIG[route.name as TabRouteName];

          if (!config) return null;

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={config.label}
              activeOpacity={0.75}
              style={styles.tab}
              onPress={() => {
                if (isFocused) return;
                haptics.selection();
                AudioDirector.playUI('ui_tab_switch');
                navigation.navigate(route.name as TabRouteName);
              }}>
              <View style={[styles.tabInner, isFocused && styles.tabInnerFocused]}>
                {isFocused ? (
                  <Text style={styles.emoji}>{config.emoji}</Text>
                ) : (
                  <AppIcon name={config.icon} size={22} color={theme.colors.muted} />
                )}
                <Text
                  numberOfLines={1}
                  style={[styles.label, isFocused ? styles.labelFocused : styles.labelMuted]}>
                  {config.label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceElevated,
    paddingTop: 10,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    columnGap: 4,
  },
  tab: {
    minWidth: 60,
    flex: 1,
    maxWidth: 76,
    alignItems: 'center',
  },
  tabInner: {
    width: '100%',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 6,
    paddingVertical: 8,
  },
  tabInnerFocused: {
    backgroundColor: 'rgba(139, 92, 246, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.35)',
  },
  emoji: {
    fontSize: 22,
    lineHeight: 26,
  },
  label: {
    marginTop: 4,
    textAlign: 'center',
    fontSize: 10,
    lineHeight: 12,
  },
  labelFocused: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  labelMuted: {
    color: theme.colors.muted,
    fontWeight: '500',
  },
});
