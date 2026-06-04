import { Pressable, Text, View } from 'react-native';

import { cn } from '@/utils';

type VaultQuickActionProps = {
  emoji: string;
  label: string;
  hint: string;
  onPress: () => void;
  accent?: boolean;
};

export const VaultQuickAction = ({ emoji, label, hint, onPress, accent }: VaultQuickActionProps) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={`${label}. ${hint}`}
    className="min-w-[47%] flex-grow">
    <View
      className={cn(
        'min-h-[88px] rounded-2xl border px-3 py-3',
        accent ? 'border-primary bg-primary/12' : 'border-border bg-surface',
      )}>
      <Text className="text-2xl">{emoji}</Text>
      <Text className={cn('mt-2 text-sm font-bold', accent ? 'text-primary' : 'text-foreground')}>
        {label}
      </Text>
      <Text className="mt-0.5 text-[11px] leading-4 text-foreground-secondary">{hint}</Text>
    </View>
  </Pressable>
);
