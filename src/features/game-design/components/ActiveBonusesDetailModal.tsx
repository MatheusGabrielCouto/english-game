import { Text, View } from 'react-native';

import { Modal } from '@/components';
import { GLOBAL_BONUS_CAP_PERCENT } from '@/features/game-design/constants/balance';
import {
    buildActiveBonusBreakdown,
    formatBonusPercent,
    formatLootBoxChance,
    getContributionSummary,
} from '@/features/game-design/utils/active-bonus-breakdown';

type ActiveBonusesDetailModalProps = {
  visible: boolean;
  onClose: () => void;
};

const BonusTotalRow = ({
  emoji,
  label,
  value,
  capped,
}: {
  emoji: string;
  label: string;
  value: string;
  capped?: boolean;
}) => (
  <View className="flex-row items-center justify-between rounded-xl border border-border bg-surface-elevated px-3 py-2.5">
    <View className="flex-row items-center gap-2">
      <Text className="">{emoji}</Text>
      <Text className="text-sm font-semibold text-foreground">{label}</Text>
    </View>
    <View className="items-end">
      <Text className="text-sm font-black text-foreground">{value}</Text>
      {capped ? (
        <Text className="text-[10px] text-muted">teto {GLOBAL_BONUS_CAP_PERCENT}%</Text>
      ) : null}
    </View>
  </View>
);

export const ActiveBonusesDetailModal = ({ visible, onClose }: ActiveBonusesDetailModalProps) => {
  const breakdown = buildActiveBonusBreakdown();
  const { modifiers, contributions, isCapped } = breakdown;

  const percentContributions = contributions.filter((entry) => entry.lootBoxChance == null);
  const boxExtraContributions = contributions.filter((entry) => entry.lootBoxChance != null);

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      title="Bônus ativos"
      description="De onde vêm seus bônus de recompensa e a chance de loot box extra."
      cancelLabel="Fechar"
      onCancel={onClose}
      scrollable>
      <View className="gap-4">
        <View className="gap-2">
          <Text className="text-xs font-bold uppercase tracking-widest text-muted">Totais aplicados</Text>
          {modifiers.xpPercent > 0 ? (
            <BonusTotalRow
              emoji="⚡"
              label="XP"
              value={formatBonusPercent(modifiers.xpPercent)}
              capped={isCapped.xp}
            />
          ) : null}
          {modifiers.coinPercent > 0 ? (
            <BonusTotalRow
              emoji="🪙"
              label="Moedas"
              value={formatBonusPercent(modifiers.coinPercent)}
              capped={isCapped.coins}
            />
          ) : null}
          {modifiers.lootLuckPercent > 0 ? (
            <BonusTotalRow
              emoji="🎁"
              label="Loot luck"
              value={formatBonusPercent(modifiers.lootLuckPercent)}
              capped={isCapped.loot}
            />
          ) : null}
          {modifiers.lootBoxBonusChance > 0 ? (
            <BonusTotalRow
              emoji="📦"
              label="Box extra"
              value={formatLootBoxChance(modifiers.lootBoxBonusChance)}
            />
          ) : null}
        </View>

        {percentContributions.length > 0 ? (
          <View className="gap-2">
            <Text className="text-xs font-bold uppercase tracking-widest text-muted">
              Origem dos bônus %
            </Text>
            {percentContributions.map((contribution) => (
              <View
                key={contribution.id}
                className="rounded-xl border border-border/80 bg-surface px-3 py-3">
                <View className="flex-row items-start gap-2">
                  <Text className="text-lg">{contribution.emoji}</Text>
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-foreground">{contribution.label}</Text>
                    <Text className="mt-0.5 text-xs font-semibold text-primary">
                      {getContributionSummary(contribution)}
                    </Text>
                    {contribution.detail ? (
                      <Text className="mt-1 text-xs leading-relaxed text-foreground-secondary">
                        {contribution.detail}
                      </Text>
                    ) : null}
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {boxExtraContributions.length > 0 ? (
          <View className="gap-2">
            <Text className="text-xs font-bold uppercase tracking-widest text-muted">
              Box extra
            </Text>
            {boxExtraContributions.map((contribution) => (
              <View
                key={contribution.id}
                className="rounded-xl border border-success/30 bg-success/10 px-3 py-3">
                <View className="flex-row items-start gap-2">
                  <Text className="text-lg">{contribution.emoji}</Text>
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-foreground">{contribution.label}</Text>
                    <Text className="mt-0.5 text-xs font-semibold text-success">
                      Chance {getContributionSummary(contribution)}
                    </Text>
                    {contribution.detail ? (
                      <Text className="mt-1 text-xs leading-relaxed text-foreground-secondary">
                        {contribution.detail}
                      </Text>
                    ) : null}
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        <Text className="text-xs leading-relaxed text-muted">
          Bônus de XP, moedas e loot luck somam relíquias, prestígio, perks RPG e pet (teto de{' '}
          {GLOBAL_BONUS_CAP_PERCENT}%). A box extra é independente e vem da dificuldade escolhida.
        </Text>
      </View>
    </Modal>
  );
};
