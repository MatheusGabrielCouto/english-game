import { Text, View } from 'react-native';

import { Button, Modal } from '@/components';
import { GameCard, StatPill } from '@/components/ui/game';
import { buildImpactMessage } from '@/features/punishments/constants/punishment-messages';
import { PUNISHMENT_MESSAGES } from '@/features/punishments/constants/punishment-messages';
import { usePunishmentStore } from '@/features/punishments/store/punishment-store';

type PunishmentImpactModalProps = {
  visible: boolean;
  onClose: () => void;
};

export const PunishmentImpactModal = ({ visible, onClose }: PunishmentImpactModalProps) => {
  const penalty = usePunishmentStore((state) => state.lastApplied);

  if (!penalty) return null;

  return (
    <Modal visible={visible} onRequestClose={onClose} title={PUNISHMENT_MESSAGES.impactTitle}>
      <View className="gap-4">
        <GameCard variant="reward" className="border-warning/25">
          <Text className="text-center text-4xl">⚠️</Text>
          <Text className="mt-3 text-center text-sm leading-relaxed text-foreground-secondary">
            {buildImpactMessage(penalty.trigger)}
          </Text>
          <View className="mt-4 flex-row flex-wrap gap-2">
            <StatPill label="XP" value={`-${penalty.xpDecayPercent}%`} emoji="⚡" tone="warning" className="flex-1" />
            <StatPill label="Moedas" value={`-${penalty.coinDecayPercent}%`} emoji="🪙" tone="warning" className="flex-1" />
          </View>
          <Text className="mt-4 text-center text-xs text-muted">
            Estude hoje para iniciar a recuperação. Nenhum progresso permanente foi perdido.
          </Text>
        </GameCard>
        <Button label={PUNISHMENT_MESSAGES.impactContinue} onPress={onClose} />
      </View>
    </Modal>
  );
};
