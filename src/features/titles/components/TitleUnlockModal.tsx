import { Text, View } from 'react-native';

import { Modal } from '@/components/ui/Modal';
import { useFeedbackStore } from '@/features/feedback/store/feedback-store';
import { TITLE_MESSAGES } from '@/features/titles/constants/default-titles';
import { TitleService } from '@/features/titles/services/title-service';
import { useTitlesStore } from '@/features/titles/store/titles-store';

export const TitleUnlockModal = () => {
  const celebration = useTitlesStore((state) => state.celebration);
  const clearConfetti = useFeedbackStore((state) => state.clearConfetti);

  const handleClose = () => {
    clearConfetti();
    TitleService.dequeueCelebration();
  };

  return (
    <Modal
      visible={celebration !== null}
      onRequestClose={handleClose}
      title={`👑 ${TITLE_MESSAGES.promotion}`}
      description={TITLE_MESSAGES.newTitle}
      confirmLabel="Épico!"
      cancelLabel="Fechar"
      onConfirm={handleClose}
      onCancel={handleClose}
      className="border-primary/40">
      {celebration ? (
        <View className="items-center gap-4 py-4">
          <View className="rounded-full border-4 border-primary/50 bg-primary/10 p-5">
            <Text className="text-6xl">{celebration.title.icon}</Text>
          </View>
          <Text className="px-2 text-center text-xl font-black text-primary" numberOfLines={2}>
            {celebration.title.name}
          </Text>
          <Text className="px-2 text-center text-sm leading-5 text-foreground-secondary">
            {celebration.title.description}
          </Text>
          <View className="w-full rounded-xl border border-gold/30 bg-gold/10 px-4 py-3">
            <Text className="text-center text-sm font-bold leading-5 text-gold">
              ⬆️ Promovido no nível {celebration.levelAtUnlock}
            </Text>
          </View>
        </View>
      ) : null}
    </Modal>
  );
};
