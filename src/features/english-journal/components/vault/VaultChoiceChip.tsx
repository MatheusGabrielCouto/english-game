import { Pressable, Text } from 'react-native';

import { cn } from '@/utils';

type VaultChoiceChipProps = {
  label: string;
  selected?: boolean;
  onPress: () => void;
  compact?: boolean;
};

export const VaultChoiceChip = ({ label, selected, onPress, compact }: VaultChoiceChipProps) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityState={{ selected }}
    accessibilityLabel={label}
    className={cn(
      'rounded-xl border',
      compact ? 'px-2.5 py-1.5' : 'px-3 py-2',
      selected ? 'border-primary bg-primary/15' : 'border-border bg-surface',
    )}>
    <Text
      className={cn(
        'font-semibold',
        compact ? 'text-xs' : 'text-sm',
        selected ? 'text-primary' : 'text-foreground',
      )}>
      {label}
    </Text>
  </Pressable>
);
