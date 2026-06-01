import { Text, View } from 'react-native';

import { GameCard } from '@/components/ui/game';
import type { ContractAnalyticsSummary, ContractRunViewModel } from '@/types/contract';

import { CONTRACTS_UI } from '../constants/contracts-ui';

type ContractsHeroCardProps = {
  activeContract: ContractRunViewModel | null;
  analytics: ContractAnalyticsSummary;
};

const HeroStatRow = ({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: string;
  tone?: 'default' | 'primary' | 'accent';
}) => {
  const valueClass =
    tone === 'primary' ? 'text-primary' : tone === 'accent' ? 'text-accent' : 'text-foreground';

  return (
    <View className="flex-row items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2.5">
      <Text className="min-w-0 flex-1 text-sm text-foreground-secondary">{label}</Text>
      <Text className={`max-w-[55%] shrink-0 text-right text-sm font-black ${valueClass}`} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
};

export const ContractsHeroCard = ({ activeContract, analytics }: ContractsHeroCardProps) => (
  <GameCard variant="hero" glow className="gap-4 p-4">
    <Text className="text-xs font-bold uppercase tracking-widest text-primary">
      📜 {CONTRACTS_UI.heroTitle}
    </Text>

    <Text className="text-sm leading-5 text-foreground-secondary">
      {activeContract ? CONTRACTS_UI.heroSubtitleActive : CONTRACTS_UI.heroSubtitleIdle}
    </Text>

    {activeContract ? (
      <View className="flex-row items-center gap-3 rounded-xl border border-accent/30 bg-accent/10 px-3 py-3">
        <Text className="text-2xl">{activeContract.icon}</Text>
        <View className="min-w-0 flex-1">
          <Text className="text-sm font-bold text-foreground" numberOfLines={2}>
            {activeContract.name}
          </Text>
          <Text className="mt-0.5 text-xs text-foreground-secondary">
            {activeContract.progressDays}/{activeContract.targetDays} dias · {activeContract.daysRemaining} restantes
          </Text>
        </View>
      </View>
    ) : null}

    <View className="gap-2">
      <HeroStatRow label="Taxa de sucesso" value={`${analytics.successRate}%`} tone="primary" />
      <HeroStatRow
        label="Concluídos"
        value={`${analytics.totalCompleted} / ${analytics.totalAccepted}`}
      />
      <HeroStatRow
        label="Moedas ganhas"
        value={`${analytics.totalCoinsWon.toLocaleString('pt-BR')} 🪙`}
        tone="accent"
      />
    </View>
  </GameCard>
);
