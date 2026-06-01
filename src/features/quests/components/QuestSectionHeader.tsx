import { Text, View } from 'react-native';

import { cn } from '@/utils';

type QuestSectionHeaderProps = {
  emoji: string;
  title: string;
  subtitle: string;
  badge?: string;
  className?: string;
};

export const QuestSectionHeader = ({
  emoji,
  title,
  subtitle,
  badge,
  className,
}: QuestSectionHeaderProps) => (
  <View className={cn('flex-row items-start justify-between gap-3 px-0.5', className)}>
    <View className="flex-1">
      <View className="flex-row items-center gap-2">
        <Text className="text-lg">{emoji}</Text>
        <Text className="text-lg font-black text-foreground">{title}</Text>
      </View>
      <Text className="mt-0.5 text-sm text-foreground-secondary">{subtitle}</Text>
    </View>
    {badge ? (
      <View className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1">
        <Text className="text-xs font-bold text-accent">{badge}</Text>
      </View>
    ) : null}
  </View>
);
