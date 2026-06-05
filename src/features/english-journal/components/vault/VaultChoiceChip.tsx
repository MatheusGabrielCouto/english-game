import { Pressable, Text, View } from 'react-native';

import { cn } from '@/utils';

type VaultChoiceChipProps = {
  label: string;
  emoji?: string;
  selected?: boolean;
  onPress: () => void;
  compact?: boolean;
};

export const VaultChoiceChip = ({
  label,
  emoji,
  selected,
  onPress,
  compact,
}: VaultChoiceChipProps) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityState={{ selected }}
    accessibilityLabel={emoji ? `${emoji} ${label}` : label}
    className={cn(
      'shrink-0 rounded-xl border',
      compact ? 'px-2.5 py-1.5' : 'px-3 py-2',
      selected ? 'border-primary bg-primary/15' : 'border-border bg-surface',
    )}>
    <View className="flex-row items-center gap-1.5">
      {emoji ? (
        <Text className={cn(compact ? 'text-xs' : 'text-sm')} style={{ lineHeight: compact ? 16 : 18 }}>
          {emoji}
        </Text>
      ) : null}
      <Text
        className={cn(
          'font-semibold text-foreground',
          compact ? 'text-xs' : 'text-sm',
        )}
        numberOfLines={1}>
        {label}
      </Text>
    </View>
  </Pressable>
);
