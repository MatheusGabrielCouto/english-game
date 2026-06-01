import { Text, View } from 'react-native';

import { GameCard } from '@/components/ui/game';
import { ContractStatus, type ContractRunRecord } from '@/types/contract';
import { cn } from '@/utils';

import { CONTRACTS_BY_KEY } from '../constants/default-contracts';
import { CONTRACTS_UI } from '../constants/contracts-ui';
import { getStatusLabel } from '../utils/progress';

type ContractHistoryListProps = {
  history: ContractRunRecord[];
};

const formatDate = (value: string | null): string => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const ContractHistoryList = ({ history }: ContractHistoryListProps) => {
  const completedOrFailed = history.filter((entry) => entry.status !== ContractStatus.ACTIVE);

  if (completedOrFailed.length === 0) {
    return (
      <GameCard variant="default" className="gap-2 p-4">
        <Text className="text-sm font-black text-foreground">{CONTRACTS_UI.historyTitle}</Text>
        <Text className="text-sm leading-5 text-foreground-secondary">
          Nenhum contrato concluído ou falhado ainda.
        </Text>
      </GameCard>
    );
  }

  return (
    <View className="gap-3">
      <Text className="text-sm font-black text-foreground">{CONTRACTS_UI.historyTitle}</Text>

      {completedOrFailed.map((entry) => {
        const definition = CONTRACTS_BY_KEY[entry.contractKey];
        const statusLabel = getStatusLabel(entry.status);
        const isCompleted = entry.status === ContractStatus.COMPLETED;

        return (
          <GameCard key={entry.id} variant="default" className="gap-3 p-4">
            <View className="flex-row items-start gap-3">
              <Text className="text-2xl">{definition?.icon ?? '📜'}</Text>
              <View className="min-w-0 flex-1 gap-1">
                <Text className="text-base font-bold text-foreground" numberOfLines={2}>
                  {definition?.name ?? entry.contractKey}
                </Text>
                <Text className="text-sm text-foreground-secondary">
                  {entry.progressDays} / {entry.targetDays} dias
                </Text>
                <Text className="text-sm font-semibold text-accent">Aposta: {entry.stakeAmount} 🪙</Text>
                <Text className="text-xs text-muted" numberOfLines={2}>
                  {formatDate(entry.startedAt)} → {formatDate(entry.endedAt)}
                </Text>
              </View>
            </View>

            <View
              className={cn(
                'self-start rounded-lg px-2.5 py-1',
                isCompleted ? 'bg-success/20' : 'bg-danger/20',
              )}>
              <Text
                className={cn('text-xs font-bold', isCompleted ? 'text-success' : 'text-danger')}>
                {statusLabel}
              </Text>
            </View>
          </GameCard>
        );
      })}
    </View>
  );
};
