import { Text, View } from 'react-native';

import { Button, Modal } from '@/components';
import { GameCard, StatPill } from '@/components/ui/game';
import { buildRecoveryMessage, PUNISHMENT_MESSAGES } from '@/features/punishments/constants/punishment-messages';
import { usePunishmentStore } from '@/features/punishments/store/punishment-store';

type PunishmentRecoveryModalProps = {
  visible: boolean;
  onClose: () => void;
};

export const PunishmentRecoveryModal = ({ visible, onClose }: PunishmentRecoveryModalProps) => {
  const recovery = usePunishmentStore((state) => state.lastRecovery);

  if (!recovery) return null;

  return (
    <Modal visible={visible} onRequestClose={onClose} title={PUNISHMENT_MESSAGES.recoveryTitle}>
      <View className="gap-4">
        <GameCard variant="reward" glow>
          <Text className="text-center text-5xl">🎉</Text>
          <Text className="mt-3 text-center text-sm leading-relaxed text-foreground-secondary">
            {buildRecoveryMessage(recovery.recoveryDays, recovery.allCleared)}
          </Text>
          <View className="mt-4 flex-row gap-2">
            <StatPill label="Bônus XP" value={`+${recovery.bonusXp}`} emoji="⚡" tone="gold" className="flex-1" />
            <StatPill label="Moedas" value={`+${recovery.bonusCoins}`} emoji="🪙" tone="primary" className="flex-1" />
          </View>
          {recovery.lootBoxChance ? (
            <Text className="mt-3 text-center text-xs text-success">🎁 Chance extra de loot box aplicada!</Text>
          ) : null}
        </GameCard>
        <Button label={PUNISHMENT_MESSAGES.recoveryContinue} onPress={onClose} />
      </View>
    </Modal>
  );
};
