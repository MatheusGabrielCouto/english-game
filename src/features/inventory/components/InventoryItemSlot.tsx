import { Text, View } from 'react-native';

import { PressableScale } from '@/components/ui/game';
import { cn } from '@/utils';

type InventoryItemSlotProps = {
  emoji: string;
  label: string;
  sublabel?: string;
  quantity?: number;
  borderClass?: string;
  onPress?: () => void;
  accessibilityLabel?: string;
  size?: 'sm' | 'md' | 'lg';
  highlighted?: boolean;
};

const sizeStyles = {
  sm: { container: 'p-2.5', emoji: 'text-2xl', label: 'text-[10px]' },
  md: { container: 'p-3', emoji: 'text-3xl', label: 'text-xs' },
  lg: { container: 'p-4', emoji: 'text-4xl', label: 'text-sm' },
};

export const InventoryItemSlot = ({
  emoji,
  label,
  sublabel,
  quantity,
  borderClass = 'border-border bg-surface',
  onPress,
  accessibilityLabel,
  size = 'md',
  highlighted = false,
}: InventoryItemSlotProps) => {
  const styles = sizeStyles[size];

  const content = (
    <View
      className={cn(
        'relative aspect-square items-center justify-center rounded-xl border-2',
        borderClass,
        highlighted && 'border-gold/50 bg-gold/5',
      )}>
      <Text className={styles.emoji}>{emoji}</Text>
      <Text className={cn('mt-1 text-center font-bold text-foreground', styles.label)} numberOfLines={1}>
        {label}
      </Text>
      {sublabel ? (
        <Text className="mt-0.5 text-center text-[10px] text-muted" numberOfLines={1}>
          {sublabel}
        </Text>
      ) : null}
      {quantity !== undefined && quantity > 0 ? (
        <View className="absolute -bottom-1.5 -right-1.5 min-w-[22px] rounded-full border border-gold/50 bg-gold px-1.5 py-0.5">
          <Text className="text-center text-[10px] font-black text-background">×{quantity}</Text>
        </View>
      ) : null}
    </View>
  );

  if (!onPress) return content;

  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}>
      {content}
    </PressableScale>
  );
};
