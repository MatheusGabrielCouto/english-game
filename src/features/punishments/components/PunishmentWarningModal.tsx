import { Text, View } from 'react-native';

import { Button, Modal } from '@/components';
import { GameCard } from '@/components/ui/game';
import { PUNISHMENT_MESSAGES } from '@/features/punishments/constants/punishment-messages';
import { usePunishmentStore } from '@/features/punishments/store/punishment-store';

type PunishmentWarningModalProps = {
  visible: boolean;
  onConfirm: () => void;
};

export const PunishmentWarningModal = ({ visible, onConfirm }: PunishmentWarningModalProps) => {
  const warning = usePunishmentStore((state) => state.state?.pendingWarning);

  if (!warning) return null;

  return (
    <Modal visible={visible} onRequestClose={onConfirm} title={PUNISHMENT_MESSAGES.warningTitle}>
      <View className="gap-4">
        <GameCard variant="quest" className="border-warning/30">
          <Text className="text-lg font-black text-foreground">{warning.title}</Text>
          <Text className="mt-2 text-sm leading-relaxed text-foreground-secondary">{warning.message}</Text>
          <Text className="mt-4 text-center text-4xl">🐾</Text>
          <Text className="mt-2 text-center text-sm italic text-warning">{warning.petMessage}</Text>
          <Text className="mt-4 text-xs text-muted">Impacto: {warning.impactPreview}</Text>
        </GameCard>
        <Button label={PUNISHMENT_MESSAGES.warningConfirm} onPress={onConfirm} />
      </View>
    </Modal>
  );
};
