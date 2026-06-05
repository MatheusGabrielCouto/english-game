import type { ReactNode } from 'react'
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native'

import { cn } from '@/utils'

import { Button } from './Button'
import { GameDisplayText } from './game/GameDisplayText'
import { AppModalShell } from './modal/AppModalShell'

type AppModalProps = {
  visible: boolean
  onRequestClose: () => void
  title?: string
  description?: string
  children?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  onConfirm?: () => void
  onCancel?: () => void
  className?: string
  scrollable?: boolean
  footerMode?: 'dual' | 'single' | 'none'
  /** When false, renders only the spring panel + children (no title/footer chrome). */
  chrome?: boolean
}

export const Modal = ({
  visible,
  onRequestClose,
  title = '',
  description,
  children,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  className,
  scrollable = true,
  footerMode = 'dual',
  chrome = true,
}: AppModalProps) => {
  const { height: windowHeight } = useWindowDimensions()
  const maxBodyHeight = Math.min(windowHeight * 0.55, 420)

  const handleClose = () => {
    onRequestClose()
  }

  const handleCancel = () => {
    onCancel?.()
    handleClose()
  }

  const handleConfirm = () => {
    onConfirm?.()
  }

  const body = children ? (
    scrollable ? (
      <ScrollView
        style={{ maxHeight: maxBodyHeight }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        keyboardDismissMode="on-drag"
        bounces={false}>
        {children}
      </ScrollView>
    ) : (
      <View>{children}</View>
    )
  ) : null

  const panel = chrome ? (
    <View
      className={cn(
        'w-full rounded-2xl border border-border bg-surface p-6',
        className,
      )}>
      {title ? (
        <GameDisplayText variant="hero" accessibilityRole="header" numberOfLines={3}>
          {title}
        </GameDisplayText>
      ) : null}
      {description ? (
        <Text className="mt-2 text-base text-foreground-secondary">{description}</Text>
      ) : null}
      {body ? <View className="mt-4">{body}</View> : null}
      {footerMode === 'none' ? null : (
        <View className="mt-6 flex-row gap-3">
          {footerMode === 'dual' ? (
            <View className="flex-1">
              <Button label={cancelLabel} variant="secondary" onPress={handleCancel} />
            </View>
          ) : null}
          {onConfirm ? (
            <View className="flex-1">
              <Button label={confirmLabel} onPress={handleConfirm} />
            </View>
          ) : null}
        </View>
      )}
    </View>
  ) : (
    <View className={cn('w-full rounded-2xl border border-border bg-surface p-6', className)}>
      {children}
    </View>
  )

  return (
    <AppModalShell visible={visible} onClose={handleCancel} presentation="center">
      {panel}
    </AppModalShell>
  )
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 4,
  },
})
