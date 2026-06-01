import { Text, View } from 'react-native';

import { ProgressBar } from '@/components';
import { GameCard } from '@/components/ui/game';
import type { ContractRunViewModel } from '@/types/contract';

type ActiveContractCardProps = {
  contract: ContractRunViewModel;
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <View className="flex-row items-center gap-3 rounded-xl border border-border bg-surface px-3 py-3">
    <Text className="min-w-0 flex-1 text-sm text-foreground-secondary">{label}</Text>
    <Text className="shrink-0 text-base font-black text-foreground">{value}</Text>
  </View>
);

export const ActiveContractCard = ({ contract }: ActiveContractCardProps) => (
  <GameCard variant="quest" className="gap-4 p-4">
    <Text className="text-xs font-bold uppercase tracking-widest text-accent">Contrato ativo</Text>

    <View className="flex-row items-center gap-3">
      <Text className="text-3xl">{contract.icon}</Text>
      <View className="min-w-0 flex-1">
        <Text className="text-lg font-black text-foreground" numberOfLines={2}>
          {contract.name}
        </Text>
        <Text className="mt-1 text-sm leading-5 text-foreground-secondary" numberOfLines={3}>
          {contract.objective}
        </Text>
      </View>
    </View>

    <View className="gap-1.5">
      <View className="flex-row items-center justify-between gap-2">
        <Text className="text-xs font-semibold text-muted">Dias cumpridos</Text>
        <Text className="shrink-0 text-sm font-bold text-primary">
          {contract.progressDays} / {contract.targetDays}
        </Text>
      </View>
      <ProgressBar value={contract.progressDays} max={contract.targetDays} variant="xp" height="md" />
    </View>

    <View className="gap-2">
      <DetailRow
        label="Emissor"
        value={`${contract.issuerPoiIcon} ${contract.issuerPoiName}`}
      />
      <DetailRow label="Aposta em jogo" value={`${contract.stakeAmount} 🪙`} />
      <DetailRow label="Dias restantes" value={String(contract.daysRemaining)} />
    </View>
  </GameCard>
);
