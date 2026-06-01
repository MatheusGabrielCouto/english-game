import { Text, View } from 'react-native';

import { GameCard } from '@/components/ui/game';
import type { ContractAnalyticsSummary } from '@/types/contract';
import { cn } from '@/utils';

import { CONTRACTS_UI } from '../constants/contracts-ui';

type ContractStatsCardProps = {
  analytics: ContractAnalyticsSummary;
};

type StatRowProps = {
  label: string;
  value: string;
  tone?: 'default' | 'success' | 'danger' | 'primary' | 'accent';
};

const toneClass = {
  default: 'text-foreground',
  success: 'text-success',
  danger: 'text-danger',
  primary: 'text-primary',
  accent: 'text-accent',
};

const StatRow = ({ label, value, tone = 'default' }: StatRowProps) => (
  <View className="flex-row items-center gap-3 rounded-xl border border-border bg-surface px-3 py-3">
    <Text className="min-w-0 flex-1 text-sm text-foreground-secondary">{label}</Text>
    <Text
      className={cn('max-w-[50%] shrink-0 text-right text-base font-black', toneClass[tone])}
      numberOfLines={2}
      adjustsFontSizeToFit
      minimumFontScale={0.85}>
      {value}
    </Text>
  </View>
);

export const ContractStatsCard = ({ analytics }: ContractStatsCardProps) => (
  <GameCard variant="default" className="gap-3 p-4">
    <Text className="text-sm font-black text-foreground">{CONTRACTS_UI.statsTitle}</Text>

    <View className="gap-2">
      <StatRow label="Contratos aceitos" value={String(analytics.totalAccepted)} />
      <StatRow label="Concluídos" value={String(analytics.totalCompleted)} tone="success" />
      <StatRow label="Falhados" value={String(analytics.totalFailed)} tone="danger" />
      <StatRow label="Taxa de sucesso" value={`${analytics.successRate}%`} tone="primary" />
      <StatRow
        label="Moedas apostadas"
        value={`${analytics.totalCoinsStaked.toLocaleString('pt-BR')} 🪙`}
      />
      <StatRow
        label="Moedas ganhas"
        value={`${analytics.totalCoinsWon.toLocaleString('pt-BR')} 🪙`}
        tone="accent"
      />
    </View>
  </GameCard>
);
