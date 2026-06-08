import { Text, View } from 'react-native';

import { ProgressBar } from '@/components';
import { PressableScale } from '@/components/ui/game';
import type { CollectionCategoryDetail } from '@/types/metagame';
import { cn } from '@/utils';

type CollectionCategoryCardProps = {
  category: CollectionCategoryDetail;
  selected?: boolean;
  onPress?: () => void;
};

const toneStyles = {
  primary: {
    container: 'border-primary/35 bg-primary/10',
    badgeBg: 'bg-primary/20',
    badgeText: 'text-primary',
    ring: 'border-primary/50',
  },
  accent: {
    container: 'border-accent/35 bg-accent/10',
    badgeBg: 'bg-accent/20',
    badgeText: 'text-accent',
    ring: 'border-accent/50',
  },
  gold: {
    container: 'border-gold/35 bg-gold/10',
    badgeBg: 'bg-gold/20',
    badgeText: 'text-gold',
    ring: 'border-gold/50',
  },
  success: {
    container: 'border-success/35 bg-success/10',
    badgeBg: 'bg-success/20',
    badgeText: 'text-success',
    ring: 'border-success/50',
  },
  warning: {
    container: 'border-warning/35 bg-warning/10',
    badgeBg: 'bg-warning/20',
    badgeText: 'text-warning',
    ring: 'border-warning/50',
  },
};

const progressVariant = {
  primary: 'default',
  accent: 'default',
  gold: 'gold',
  success: 'streak',
  warning: 'default',
} as const;

export const CollectionCategoryCard = ({
  category,
  selected = false,
  onPress,
}: CollectionCategoryCardProps) => {
  const tone = toneStyles[category.tone];
  const isComplete = category.percentage >= 100;

  return (
    <PressableScale
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={`Coleção ${category.label}, ${category.discovered} de ${category.total}`}
      className={cn(
        'rounded-2xl border p-4',
        tone.container,
        selected && 'border-2',
        selected && tone.ring,
      )}>
      <View className="flex-row items-start justify-between">
        <View className="h-11 w-11 items-center justify-center rounded-2xl bg-surface/80">
          <Text className="text-2xl">{category.emoji}</Text>
        </View>
        <View className={cn('rounded-full px-2.5 py-1', tone.badgeBg)}>
          <Text className={cn('text-xs font-black', tone.badgeText)}>
            {category.percentage}%
          </Text>
        </View>
      </View>

      <Text className="mt-3  font-black text-foreground">{category.label}</Text>
      <Text className="mt-0.5 text-xs text-foreground-secondary">{category.description}</Text>

      <View className="mt-3 flex-row items-end justify-between">
        <Text className="text-2xl font-black text-foreground">
          {category.discovered}
          <Text className="text-sm font-semibold text-muted"> / {category.total}</Text>
        </Text>
        {isComplete ? <Text className="text-xs font-bold text-success">Completo ✓</Text> : null}
      </View>

      <View className="mt-3">
        <ProgressBar value={category.percentage} variant={progressVariant[category.tone]} height="sm" />
      </View>

      <View className="mt-3 flex-row flex-wrap gap-1.5">
        {category.preview.map((icon, index) => (
          <View
            key={`${category.key}-preview-${index}`}
            className="h-8 w-8 items-center justify-center rounded-lg bg-surface/90">
            <Text className="">{icon}</Text>
          </View>
        ))}
        {category.discovered > category.preview.length ? (
          <View className="h-8 min-w-8 items-center justify-center rounded-lg bg-surface/70 px-2">
            <Text className="text-[10px] font-bold text-muted">+{category.discovered - category.preview.length}</Text>
          </View>
        ) : null}
      </View>
    </PressableScale>
  );
};
