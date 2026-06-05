import { Text, View } from 'react-native';

import { AppIcon, type AppIconName } from '@/components/ui/AppIcon';
import { GameDisplayText } from '@/components/ui/game/GameDisplayText';
import { theme } from '@/constants';
import { cn } from '@/utils';

export type StatPillProps = {
  icon?: AppIconName;
  emoji?: string;
  label: string;
  value: string | number;
  tone?: 'primary' | 'accent' | 'gold' | 'warning' | 'success';
  /** stretch = equal width in a row; tile = fixed ~half width for flex-wrap grids */
  layout?: 'stretch' | 'tile';
  className?: string;
};

const layoutStyles: Record<NonNullable<StatPillProps['layout']>, string> = {
  stretch: 'min-w-0 flex-1',
  tile: 'shrink-0 grow-0',
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
  layout = 'stretch',
  className,
}: StatPillProps) => (
  <View
    className={cn('rounded-xl border px-3 py-2.5', layoutStyles[layout], toneContainerStyles[tone], className)}
  >
    <View className="flex-row flex-wrap items-center gap-1.5">
      {emoji ? <Text className="text-sm">{emoji}</Text> : null}
      {icon ? <AppIcon name={icon} size={14} color={iconColors[tone]} /> : null}
      <Text
        className="shrink text-[10px] font-semibold uppercase tracking-wide text-foreground-secondary"
        numberOfLines={2}
      >
        {label}
      </Text>
    </View>
    <GameDisplayText
      variant="value"
      className={cn('mt-1', toneTextStyles[tone])}
      numberOfLines={1}>
      {value}
    </GameDisplayText>
  </View>
);
