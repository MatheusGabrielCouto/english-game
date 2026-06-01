import { Text, View } from 'react-native';

import { AppIcon, type AppIconName } from '@/components/ui/AppIcon';
import { theme } from '@/constants';
import { cn } from '@/utils';

type StatPillProps = {
  icon?: AppIconName;
  emoji?: string;
  label: string;
  value: string | number;
  tone?: 'primary' | 'accent' | 'gold' | 'warning' | 'success';
  className?: string;
};

const toneContainerStyles = {
  primary: 'border-primary/30 bg-primary/15',
  accent: 'border-accent/30 bg-accent/15',
  gold: 'border-gold/30 bg-gold/15',
  warning: 'border-warning/30 bg-warning/15',
  success: 'border-success/30 bg-success/15',
};

const toneTextStyles = {
  primary: 'text-primary',
  accent: 'text-accent',
  gold: 'text-gold',
  warning: 'text-warning',
  success: 'text-success',
};

const iconColors = {
  primary: theme.colors.primary,
  accent: theme.colors.accent,
  gold: theme.colors.gold,
  warning: theme.colors.warning,
  success: theme.colors.success,
};

export const StatPill = ({
  icon,
  emoji,
  label,
  value,
  tone = 'primary',
  className,
}: StatPillProps) => (
  <View className={cn('flex-1 rounded-xl border px-3 py-2.5', toneContainerStyles[tone], className)}>
    <View className="flex-row items-center gap-1.5">
      {emoji ? <Text className="text-sm">{emoji}</Text> : null}
      {icon ? <AppIcon name={icon} size={14} color={iconColors[tone]} /> : null}
      <Text className="text-[10px] font-semibold uppercase tracking-wide text-foreground-secondary">
        {label}
      </Text>
    </View>
    <Text className={cn('mt-1 text-lg font-black', toneTextStyles[tone])}>{value}</Text>
  </View>
);
