import { Text, View } from 'react-native'

import { theme } from '@/constants'
import { cn } from '@/utils'

import { AppIcon, type AppIconName } from './AppIcon'
import { Button } from './Button'
import { GameCard } from './game'

export type EmptyStateVariant = 'game' | 'vault' | 'farm'

type EmptyStateProps = {
  variant?: EmptyStateVariant
  icon?: AppIconName
  emoji?: string
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

const GameEmptyState = ({
  icon = 'file-tray-outline',
  title,
  description,
  actionLabel,
  onAction,
  className,
}: Omit<EmptyStateProps, 'variant' | 'emoji'>) => (
  <View
    className={cn('items-center justify-center px-6 py-12', className)}
    accessibilityRole="text">
    <View className="mb-5 rounded-2xl border border-border bg-surface-elevated p-5">
      <AppIcon name={icon} size={44} color={theme.colors.primary} strokeWidth={1.75} />
    </View>
    <Text className="text-center text-lg font-semibold text-foreground">{title}</Text>
    {description ? (
      <Text className="mt-2 text-center text-base text-foreground-secondary">{description}</Text>
    ) : null}
    {actionLabel && onAction ? (
      <View className="mt-6 w-full max-w-xs">
        <Button label={actionLabel} variant="secondary" onPress={onAction} />
      </View>
    ) : null}
  </View>
)

const VaultEmptyStateView = ({
  emoji = '📓',
  title,
  description,
  actionLabel,
  onAction,
  className,
}: Omit<EmptyStateProps, 'variant' | 'icon'>) => (
  <GameCard
    variant="hero"
    glow
    className={cn('items-center border-dashed border-primary/30 px-6 py-10', className)}
    accessibilityRole="text">
    <Text className="text-5xl">{emoji}</Text>
    <Text className="mt-4 text-center text-lg font-bold text-foreground">{title}</Text>
    {description ? (
      <Text className="mt-2 max-w-sm text-center text-base leading-6 text-foreground-secondary">
        {description}
      </Text>
    ) : null}
    {actionLabel && onAction ? (
      <View className="mt-6 w-full">
        <Button
          label={actionLabel}
          size="lg"
          onPress={onAction}
          accessibilityLabel={actionLabel}
        />
      </View>
    ) : null}
  </GameCard>
)

const FarmEmptyStateView = ({
  emoji = '🐾',
  title,
  description,
  actionLabel,
  onAction,
  className,
}: Omit<EmptyStateProps, 'variant' | 'icon'>) => (
  <View className={cn('items-center gap-2 py-6', className)} accessibilityRole="text">
    <Text className="text-3xl">{emoji}</Text>
    <Text className="text-center text-sm font-bold text-foreground">{title}</Text>
    {description ? (
      <Text className="max-w-[260px] text-center text-xs leading-relaxed text-muted">
        {description}
      </Text>
    ) : null}
    {actionLabel && onAction ? (
      <View className="mt-3 w-full max-w-xs">
        <Button label={actionLabel} size="sm" variant="secondary" onPress={onAction} />
      </View>
    ) : null}
  </View>
)

export const EmptyState = ({ variant = 'game', ...props }: EmptyStateProps) => {
  if (variant === 'vault') {
    return <VaultEmptyStateView {...props} />
  }

  if (variant === 'farm') {
    return <FarmEmptyStateView {...props} />
  }

  return <GameEmptyState {...props} />
}
