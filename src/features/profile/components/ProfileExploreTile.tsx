import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { PressableScale } from '@/components/ui/game';
import { theme } from '@/constants';
import { cn } from '@/utils';

import type { ExploreItemDef } from '../constants/profile-explore-catalog';
import type { ExploreBadge } from '../hooks/use-explore-badges';

type ProfileExploreTileProps = {
  item: ExploreItemDef;
  badge: ExploreBadge;
};

const badgeToneStyles: Record<ExploreBadge['tone'], { container: string; text: string }> = {
  default: { container: 'border-border bg-surface', text: 'text-muted' },
  live: { container: 'border-danger/40 bg-danger/15', text: 'text-danger' },
  reward: { container: 'border-gold/40 bg-gold/15', text: 'text-gold' },
  quest: { container: 'border-primary/35 bg-primary/12', text: 'text-primary' },
  locked: { container: 'border-border bg-surface/80', text: 'text-muted' },
};

const tileBorder: Record<ExploreBadge['tone'], string> = {
  default: 'border-border',
  live: 'border-danger/40',
  reward: 'border-gold/35',
  quest: 'border-primary/30',
  locked: 'border-border',
};

export const ProfileExploreTile = ({ item, badge }: ProfileExploreTileProps) => {
  const tone = badgeToneStyles[badge.tone];
  const isLocked = badge.tone === 'locked';

  const handlePress = () => {
    if (isLocked) return;
    router.push(item.route);
  };

  return (
    <PressableScale
      onPress={handlePress}
      disabled={isLocked}
      accessibilityRole="button"
      accessibilityLabel={`${item.label}, ${badge.label}`}
      accessibilityState={{ disabled: isLocked }}
      className="w-full">
      <View
        className={cn(
          'flex-row items-center gap-3 rounded-xl border bg-surface px-3 py-3.5',
          tileBorder[badge.tone],
          isLocked && 'opacity-60',
        )}>
        <View className="h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-surface-elevated">
          <Text className="text-2xl">{item.emoji}</Text>
          {badge.tone === 'live' ? (
            <View className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-danger" />
          ) : null}
        </View>

        <View className="min-w-0 flex-1">
          <Text className="text-sm font-bold text-foreground" numberOfLines={1}>
            {item.label}
          </Text>
          <Text className="mt-0.5 text-xs text-foreground-secondary" numberOfLines={1}>
            {item.tagline}
          </Text>
        </View>

        <View className="max-w-[38%] shrink-0 items-end gap-1">
          <View className={cn('rounded-lg border px-2 py-1', tone.container)}>
            <Text className={cn('text-center text-[10px] font-bold leading-4', tone.text)} numberOfLines={2}>
              {badge.label}
            </Text>
          </View>
          {!isLocked ? (
            <AppIcon name="chevron-forward" size={16} color={theme.colors.muted} />
          ) : null}
        </View>
      </View>
    </PressableScale>
  );
};
