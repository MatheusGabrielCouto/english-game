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
    className={cn(
      'rounded-xl border',
      compact ? 'px-2.5 py-1.5' : 'px-3 py-2',
      selected ? 'border-primary bg-primary' : 'border-border bg-background',
    )}>
    <Text
      className={cn(
        'font-semibold',
        compact ? 'text-xs' : 'text-sm',
        selected ? 'text-white' : 'text-foreground',
      )}>
      {label}
    </Text>
  </Pressable>
);
