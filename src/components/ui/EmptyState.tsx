import { Text, View } from 'react-native';

import { theme } from '@/constants';
import { cn } from '@/utils';

import { AppIcon, type AppIconName } from './AppIcon';
import { Button } from './Button';

type EmptyStateProps = {
  icon?: AppIconName;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
};

export const EmptyState = ({
  icon = 'file-tray-outline',
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) => (
  <View
    className={cn('items-center justify-center px-6 py-12', className)}
    accessibilityRole="text">
    <View className="mb-5 rounded-2xl border border-border bg-surface-elevated p-5">
      <AppIcon name={icon} size={44} color={theme.colors.primary} strokeWidth={1.75} />
    </View>
    <Text className="text-center text-lg font-semibold text-foreground">{title}</Text>
    {description ? (
      <Text className="mt-2 text-center text-base text-foreground-secondary">
        {description}
      </Text>
    ) : null}
    {actionLabel && onAction ? (
      <View className="mt-6 w-full max-w-xs">
        <Button label={actionLabel} variant="secondary" onPress={onAction} />
      </View>
    ) : null}
  </View>
);
