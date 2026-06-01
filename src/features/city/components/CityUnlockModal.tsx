import { Text, View } from 'react-native';

import { Modal } from '@/components/ui/Modal';
import { CITY_MESSAGES } from '@/features/city/constants/default-buildings';
import { CityService } from '@/features/city/services/city-service';
import { useCityStore } from '@/features/city/store/city-store';
import { useFeedbackStore } from '@/features/feedback/store/feedback-store';
import { TITLES_BY_KEY } from '@/features/titles/constants/default-titles';

export const CityUnlockModal = () => {
  const celebration = useCityStore((state) => state.celebration);
  const clearConfetti = useFeedbackStore((state) => state.clearConfetti);

  const handleClose = () => {
    clearConfetti();
    CityService.dequeueCelebration();
  };

  const linkedTitle = celebration
    ? TITLES_BY_KEY[celebration.building.linkedTitleKey]?.name
    : null;

  return (
    <Modal
      visible={celebration !== null}
      onRequestClose={handleClose}
      title={`🏙️ ${CITY_MESSAGES.cityGrown}`}
      description={CITY_MESSAGES.buildingUnlocked}
      confirmLabel="Explorar!"
      cancelLabel="Fechar"
      onConfirm={handleClose}
      onCancel={handleClose}
      className="border-accent/40">
      {celebration ? (
        <View className="items-center gap-4 py-4">
          <View className="rounded-2xl border-4 border-accent/50 bg-accent/10 px-8 py-5">
            <Text className="text-6xl">{celebration.building.icon}</Text>
          </View>
          <Text className="text-center text-2xl font-black text-accent">
            {celebration.building.name}
          </Text>
          <Text className="text-center text-sm text-foreground-secondary">
            {celebration.building.description}
          </Text>
          {linkedTitle ? (
            <Text className="text-center text-sm font-semibold text-primary">👑 Título: {linkedTitle}</Text>
          ) : null}
          <View className="rounded-xl border border-accent/30 bg-surface-elevated px-4 py-3">
            <Text className="text-center text-sm font-bold text-accent">
              🏗️ Desbloqueado no nível {celebration.levelAtUnlock}
            </Text>
          </View>
        </View>
      ) : null}
    </Modal>
  );
};
