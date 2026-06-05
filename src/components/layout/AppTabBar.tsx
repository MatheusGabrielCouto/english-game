import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon, type AppIconName } from '@/components/ui/AppIcon';
import { MIN_TOUCH_TARGET_PT, theme } from '@/constants';
import { CoachMarkTarget } from '@/features/tutorial';
import { AudioDirector } from '@/services/audio';
import { haptics } from '@/utils/haptics';

type TabRouteName = 'index' | 'play' | 'knowledge' | 'menu' | 'profile';

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
  index: { icon: 'home-outline', label: 'Home', emoji: '🏠' },
  play: { icon: 'flash', label: 'Jogar', emoji: '🎯' },
  knowledge: { icon: 'file-tray-outline', label: 'Vault', emoji: '📓' },
  menu: { icon: 'cube-outline', label: 'Menu', emoji: '📋' },
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

          const tabInner = (
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
          );

          const handlePress = () => {
            if (isFocused) return;
            haptics.tab();
            AudioDirector.playUI('ui_tab_switch');
            navigation.navigate(route.name as TabRouteName);
          };

          if (route.name === 'menu') {
            return (
              <CoachMarkTarget key={route.key} coachKey="tab-menu" style={styles.tab}>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityState={isFocused ? { selected: true } : {}}
                  accessibilityLabel={config.label}
                  activeOpacity={0.75}
                  style={styles.tabPressable}
                  onPress={handlePress}>
                  {tabInner}
                </TouchableOpacity>
              </CoachMarkTarget>
            );
          }

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={config.label}
              activeOpacity={0.75}
              style={styles.tab}
              onPress={handlePress}>
              {tabInner}
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
    paddingHorizontal: 6,
    columnGap: 2,
  },
  tab: {
    minWidth: MIN_TOUCH_TARGET_PT,
    minHeight: MIN_TOUCH_TARGET_PT,
    flex: 1,
    maxWidth: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabPressable: {
    width: '100%',
    minHeight: MIN_TOUCH_TARGET_PT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabInner: {
    width: '100%',
    minHeight: MIN_TOUCH_TARGET_PT,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingHorizontal: 4,
    paddingVertical: 6,
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
    fontSize: 9,
    lineHeight: 11,
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
