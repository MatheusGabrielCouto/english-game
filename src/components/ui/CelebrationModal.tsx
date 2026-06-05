import { Text, View } from 'react-native'

import { Button } from '@/components'
import { GameDisplayText } from '@/components/ui/game'

import { Modal } from './Modal'

type CelebrationModalProps = {
  visible: boolean
  title: string
  message: string
  emoji?: string
  onDismiss: () => void
}

export const CelebrationModal = ({
  visible,
  title,
  message,
  emoji = '🎉',
  onDismiss,
}: CelebrationModalProps) => (
  <Modal
    visible={visible}
    onRequestClose={onDismiss}
    title=""
    confirmLabel="Continuar"
    footerMode="single"
    onConfirm={onDismiss}
    className="border-primary/40 bg-surface-elevated"
    scrollable={false}>
    <View className="items-center">
      <Text className="text-center text-5xl">{emoji}</Text>
      <GameDisplayText variant="hero" className="mt-4 text-center">
        {title}
      </GameDisplayText>
      <Text className="mt-2 text-center text-sm text-foreground-secondary">{message}</Text>
    </View>
  </Modal>
)
