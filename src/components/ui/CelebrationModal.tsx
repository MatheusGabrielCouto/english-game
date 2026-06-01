import { Modal, Text, View } from 'react-native';

import { Button } from '@/components';

type CelebrationModalProps = {
  visible: boolean;
  title: string;
  message: string;
  emoji?: string;
  onDismiss: () => void;
};

export const CelebrationModal = ({
  visible,
  title,
  message,
  emoji = '🎉',
  onDismiss,
}: CelebrationModalProps) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
    <View className="flex-1 items-center justify-center bg-black/70 px-6">
      <View className="w-full max-w-sm rounded-3xl border border-primary/40 bg-surface-elevated p-6">
        <Text className="text-center text-5xl">{emoji}</Text>
        <Text className="mt-4 text-center text-2xl font-bold text-foreground">{title}</Text>
        <Text className="mt-2 text-center text-sm text-foreground-secondary">{message}</Text>
        <View className="mt-6">
          <Button label="Continuar" onPress={onDismiss} />
        </View>
      </View>
    </View>
  </Modal>
);
