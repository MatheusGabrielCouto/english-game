import { Text, View } from 'react-native';

import { Button } from '@/components';
import { GameCard } from '@/components/ui/game';
import type { ContractDefinition } from '@/types/contract';
import { getIssuerPoiLabel } from '../utils/eligibility';

type AvailableContractCardProps = {
  definition: ContractDefinition;
  canAfford: boolean;
  onAccept: (definition: ContractDefinition) => void;
  compact?: boolean;
  showIssuer?: boolean;
};

export const AvailableContractCard = ({
  definition,
  canAfford,
  onAccept,
  compact = false,
  showIssuer = !compact,
}: AvailableContractCardProps) => {
  const issuer = getIssuerPoiLabel(definition.issuerPoiKey);

  return (
  <GameCard variant="default" className={`gap-4 ${compact ? 'p-3' : 'p-4'}`}>
    <View className="flex-row items-start gap-3">
      <Text className="text-3xl">{definition.icon}</Text>
      <View className="min-w-0 flex-1 gap-1">
        <Text className=" font-bold text-foreground" numberOfLines={2}>
          {definition.name}
        </Text>
        <Text className="text-sm leading-5 text-foreground-secondary" numberOfLines={3}>
          {definition.description}
        </Text>
        {showIssuer ? (
          <Text className="text-xs text-muted">
            {issuer.icon} {issuer.name} · Nv. local {definition.minLocalLevel}+
          </Text>
        ) : null}
      </View>
    </View>

    <View className="rounded-xl border border-primary/25 bg-primary/10 px-3 py-2.5">
      <Text className="text-xs font-bold uppercase text-primary">Objetivo</Text>
      <Text className="mt-1 text-sm font-semibold leading-5 text-foreground">{definition.objective}</Text>
      <Text className="mt-1 text-xs text-muted">{definition.targetDays} dias consecutivos</Text>
    </View>

    {!compact ? (
      <View className="gap-2">
        <Text className="text-xs font-bold uppercase text-muted">Recompensas</Text>
        {definition.rewards.map((reward) => (
          <View
            key={reward.label}
            className="flex-row items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5">
            <Text className="text-accent">✦</Text>
            <Text className="min-w-0 flex-1 text-sm text-foreground" numberOfLines={2}>
              {reward.label}
            </Text>
          </View>
        ))}
        <Text className="text-xs text-primary">
          +{definition.baseLocalXpReward} XP local ao concluir
        </Text>
      </View>
    ) : (
      <Text className="text-xs text-primary">
        +{definition.baseLocalXpReward} XP local · {definition.rewards.length} recompensa(s)
      </Text>
    )}

    <View className="flex-row items-center gap-3 rounded-xl border border-border bg-surface-elevated px-3 py-3">
      <Text className="min-w-0 flex-1 text-sm text-foreground-secondary">Aposta necessária</Text>
      <Text className="shrink-0  font-black text-accent">{definition.stakeAmount} 🪙</Text>
    </View>

    <Button
      label="Aceitar contrato"
      variant={canAfford ? 'primary' : 'secondary'}
      disabled={!canAfford}
      onPress={() => onAccept(definition)}
      accessibilityLabel={`Aceitar contrato ${definition.name}`}
    />

    {!canAfford ? (
      <Text className="text-center text-sm text-foreground-secondary">
        Moedas insuficientes para esta aposta.
      </Text>
    ) : null}
  </GameCard>
  );
};
