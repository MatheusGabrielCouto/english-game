import { Text, View } from 'react-native';

import { Button } from '@/components';
import { GameCard } from '@/components/ui/game';
import { LOOT_BOX_RARITY_LABELS } from '@/features/loot-boxes/constants';
import { getPrestigeLootBoxRarity } from '@/features/prestige/constants/prestige-catalog';
import type { PrestigeTierDefinition } from '@/types/prestige';

import { PRESTIGE_UI } from '../constants/prestige-ui';

type PrestigeNextMilestoneCardProps = {
  nextTier: PrestigeTierDefinition;
  playerLevel: number;
  canClaim: boolean;
  onClaim: () => void;
};

export const PrestigeNextMilestoneCard = ({
  nextTier,
  playerLevel,
  canClaim,
  onClaim,
}: PrestigeNextMilestoneCardProps) => {
  const levelsRemaining = Math.max(0, nextTier.requiredPlayerLevel - playerLevel);
  const lootLabel = LOOT_BOX_RARITY_LABELS[getPrestigeLootBoxRarity(nextTier.level)];

  return (
    <GameCard variant="reward" glow className="border-gold/25">
      <Text className="text-xs font-bold uppercase tracking-widest text-gold">
        {PRESTIGE_UI.nextMilestoneTitle}
      </Text>
      <Text className="mt-2 text-xl font-black text-foreground">
        Prestígio {nextTier.roman} — {nextTier.name}
      </Text>
      <Text className="mt-1 text-sm leading-5 text-foreground-secondary">{nextTier.subtitle}</Text>

      <View className="mt-4 rounded-xl border border-border/80 bg-surface-elevated/80 px-3 py-3">
        <Text className="text-[10px] font-bold uppercase text-muted">Requisito</Text>
        <Text className="mt-1 text-sm text-foreground">
          Nível {nextTier.requiredPlayerLevel}
          {levelsRemaining > 0 ? ` · faltam ${levelsRemaining} níveis` : ' · você já pode reivindicar!'}
        </Text>
      </View>

      <Text className="mt-4 text-xs font-bold uppercase tracking-widest text-muted">Pacote ao reivindicar</Text>
      <View className="mt-2 gap-1.5">
        {nextTier.rewards.map((reward) => (
          <Text key={reward} className="text-sm text-foreground-secondary">
            • {reward}
          </Text>
        ))}
        <Text className="text-sm text-foreground-secondary">• Loot box {lootLabel} no inventário</Text>
      </View>

      {nextTier.permanentBonuses.length > 0 ? (
        <View className="mt-4">
          <Text className="text-xs font-bold uppercase tracking-widest text-primary">Bônus permanentes deste tier</Text>
          <View className="mt-2 flex-row flex-wrap gap-2">
            {nextTier.permanentBonuses.map((bonus) => (
              <View
                key={bonus.label}
                className="rounded-lg border border-primary/25 bg-primary/10 px-2.5 py-1.5">
                <Text className="text-[10px] text-muted">{bonus.label}</Text>
                <Text className="text-xs font-bold text-primary">{bonus.value}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {canClaim ? (
        <View className="mt-4">
          <Button label={`Reivindicar Prestígio ${nextTier.roman}`} onPress={onClaim} />
        </View>
      ) : null}
    </GameCard>
  );
};
