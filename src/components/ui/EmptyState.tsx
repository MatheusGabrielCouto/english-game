import { Text, View } from 'react-native'

import { theme } from '@/constants'
import { cn } from '@/utils'

import { AppIcon, type AppIconName } from './AppIcon'
import { Button } from './Button'
import { EmptyStateArt } from './empty-state/EmptyStateArt'
import { GameCard } from './game'

export type EmptyStateVariant = 'game' | 'vault' | 'farm'

type EmptyStateProps = {
  variant?: EmptyStateVariant
  icon?: AppIconName
  /** @deprecated Illustration replaces emoji; kept for accessibility hints. */
  emoji?: string
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
  illustrated?: boolean
}

const EmptyStateCopy = ({
  title,
  description,
  accessibilityHint,
}: {
  title: string
  description?: string
  accessibilityHint?: string
}) => (
  <>
    <Text
      className="text-center text-lg font-semibold text-foreground"
      accessibilityHint={accessibilityHint}>
      {title}
    </Text>
    {description ? (
      <Text className="mt-2 text-center  leading-6 text-foreground-secondary">
        {description}
      </Text>
    ) : null}
  </>
)

const GameEmptyState = ({
  icon = 'file-tray-outline',
  title,
  description,
  actionLabel,
  onAction,
  className,
  illustrated = true,
  emoji,
}: Omit<EmptyStateProps, 'variant'>) => (
  <View
    className={cn('items-center justify-center px-6 py-12', className)}
    accessibilityRole="text">
    {illustrated ? (
      <EmptyStateArt variant="game" />
    ) : (
      <View className="mb-5 rounded-2xl border border-border bg-surface-elevated p-5">
        <AppIcon name={icon} size={44} color={theme.colors.primary} strokeWidth={1.75} />
      </View>
    )}
    <View className={cn('w-full items-center', illustrated ? 'mt-5' : undefined)}>
      <EmptyStateCopy title={title} description={description} accessibilityHint={emoji} />
      {actionLabel && onAction ? (
        <View className="mt-6 w-full max-w-xs">
          <Button label={actionLabel} variant="secondary" onPress={onAction} />
        </View>
      ) : null}
    </View>
  </View>
)

const VaultEmptyStateView = ({
  title,
  description,
  actionLabel,
  onAction,
  className,
  illustrated = true,
  emoji,
}: Omit<EmptyStateProps, 'variant' | 'icon'>) => (
  <GameCard
    variant="hero"
    glow
    className={cn('items-center border-dashed border-primary/30 px-6 py-10', className)}
    accessibilityRole="text">
    {illustrated ? <EmptyStateArt variant="vault" /> : emoji ? (
      <Text className="text-5xl">{emoji}</Text>
    ) : null}
    <View className={cn('w-full items-center', illustrated || emoji ? 'mt-4' : undefined)}>
      <EmptyStateCopy title={title} description={description} accessibilityHint={emoji} />
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
    </View>
  </GameCard>
)

const FarmEmptyStateView = ({
  title,
  description,
  actionLabel,
  onAction,
  className,
  illustrated = true,
  emoji,
}: Omit<EmptyStateProps, 'variant' | 'icon'>) => (
  <View className={cn('items-center gap-2 py-6', className)} accessibilityRole="text">
    {illustrated ? (
      <EmptyStateArt variant="farm" size={128} />
    ) : emoji ? (
      <Text className="text-3xl">{emoji}</Text>
    ) : null}
    <View className={cn('items-center', illustrated || emoji ? 'mt-2' : undefined)}>
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
