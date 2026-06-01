import { Text, View } from 'react-native';

import { Modal } from '@/components/ui/Modal';

import { useFeedbackStore } from '../store/feedback-store';

export const PetEvolutionModal = () => {
  const celebration = useFeedbackStore((state) => state.petEvolution);
  const setPetEvolution = useFeedbackStore((state) => state.setPetEvolution);
  const clearConfetti = useFeedbackStore((state) => state.clearConfetti);

  const handleClose = () => {
    setPetEvolution(null);
    clearConfetti();
  };

  return (
    <Modal
      visible={celebration !== null}
      onRequestClose={handleClose}
      title="Evolução!"
      description="Seu pet evoluiu para uma nova forma!"
      confirmLabel="Incrível!"
      cancelLabel="Fechar"
      onConfirm={handleClose}
      onCancel={handleClose}
      className="border-legendary/40 bg-surface">
      {celebration ? (
        <View className="items-center gap-4 py-4">
          <View className="rounded-full border-4 border-legendary/50 bg-legendary/10 p-6">
            <Text className="text-7xl">{celebration.emoji}</Text>
          </View>
          <Text className="text-center text-2xl font-black text-legendary">
            {celebration.label}
          </Text>
          <Text className="text-center text-sm text-foreground-secondary">
            Continue estudando para desbloquear formas ainda mais raras!
          </Text>
        </View>
      ) : null}
    </Modal>
  );
};
