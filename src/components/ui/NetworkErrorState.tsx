import { ActivityIndicator, Text, View } from 'react-native'

import { NETWORK_STATUS_UI } from '@/constants/network-status-ui'
import { theme } from '@/constants'
import { cn } from '@/utils'

import { AppIcon } from './AppIcon'
import { Button } from './Button'
import { GameCard } from './game'

type NetworkErrorStateProps = {
  title?: string
  description?: string
  onRetry: () => void
  isRetrying?: boolean
  variant?: 'network' | 'generic'
  className?: string
}

export const NetworkErrorState = ({
  title = NETWORK_STATUS_UI.errorTitle,
  description,
  onRetry,
  isRetrying = false,
  variant = 'generic',
  className,
}: NetworkErrorStateProps) => {
  const resolvedDescription =
    description ??
    (variant === 'network'
      ? NETWORK_STATUS_UI.errorNetworkDescription
      : NETWORK_STATUS_UI.errorGenericDescription)

  return (
    <GameCard
      variant="default"
      className={cn('items-center gap-4 border-warning/30 bg-surface px-6 py-8', className)}
      accessibilityRole="alert">
      <View className="rounded-2xl border border-warning/35 bg-warning/10 p-4">
        <AppIcon
          name={variant === 'network' ? 'wifi-off' : 'shield-outline'}
          size={36}
          color={theme.colors.warning}
          strokeWidth={2}
        />
      </View>
      <View className="items-center gap-2">
        <Text className="text-center text-base font-bold text-foreground">{title}</Text>
        <Text className="max-w-sm text-center text-sm leading-5 text-foreground-secondary">
          {resolvedDescription}
        </Text>
      </View>
      <View className="w-full max-w-xs">
        {isRetrying ? (
          <View className="flex-row items-center justify-center gap-2 py-3">
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text className="text-sm font-semibold text-primary">Tentando…</Text>
          </View>
        ) : (
          <Button
            label={NETWORK_STATUS_UI.retryLabel}
            variant="secondary"
            onPress={onRetry}
            accessibilityLabel={NETWORK_STATUS_UI.retryLabel}
          />
        )}
      </View>
    </GameCard>
  )
}
