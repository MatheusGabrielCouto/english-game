import { Text, View } from 'react-native';

import { Button, Modal } from '@/components';
import { GameCard, StatPill } from '@/components/ui/game';
import type { FocusSessionRewards } from '@/types/focus-mode';

type FocusSessionResultModalProps = {
  visible: boolean;
  rewards: FocusSessionRewards | null;
  onClose: () => void;
};

export const FocusSessionResultModal = ({ visible, rewards, onClose }: FocusSessionResultModalProps) => {
  if (!rewards) return null;

  const focusPercent = Math.round(rewards.focusRatio * 100);
  const completionPercent = Math.round(rewards.completionRatio * 100);
  const endedEarly = rewards.completionRatio < 0.995;

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      title={endedEarly ? 'Sessão encerrada cedo' : 'Sessão concluída!'}
    >
      <View className="gap-4">
        <GameCard variant="reward" glow>
          <Text className="text-center text-lg font-bold text-foreground">Recompensas de foco</Text>
          {endedEarly ? (
            <Text className="mt-2 text-center text-sm text-warning">
              Tempo cumprido: {completionPercent}% — recompensa ajustada ao tempo restante
            </Text>
          ) : null}
          <Text className="mt-1 text-center text-sm text-muted">
            Foco: {focusPercent}% · Bônus ×{rewards.bonusMultiplier.toFixed(2)}
          </Text>

          <View className="mt-4 flex-row flex-wrap justify-center gap-2">
            <StatPill label="XP" value={`+${rewards.xp}`} emoji="⚡" tone="gold" />
            <StatPill label="Moedas" value={`+${rewards.coins}`} emoji="🪙" tone="primary" />
            <StatPill label="Study Pts" value={`+${rewards.studyPoints}`} emoji="📚" tone="success" />
            {rewards.lootBoxRarity ? (
              <StatPill label="Loot Box" value={rewards.lootBoxRarity} emoji="🎁" tone="accent" />
            ) : null}
          </View>

          {rewards.petAffinityGain > 0 ? (
            <Text className="mt-4 text-center text-sm text-success">
              +{rewards.petAffinityGain} afinidade com seu pet 🐾
            </Text>
          ) : null}
        </GameCard>

        <Button label="Continuar" onPress={onClose} />
      </View>
    </Modal>
  );
};
