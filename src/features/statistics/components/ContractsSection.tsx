import type { StatisticsDashboard } from '@/types/statistics';

import { formatNumber } from '../utils/formatters';
import { StatMetricGrid } from './StatMetricGrid';

type ContractsSectionProps = {
  contracts: StatisticsDashboard['contracts'];
};

export const ContractsSection = ({ contracts }: ContractsSectionProps) => (
  <StatMetricGrid
    title="Contratos"
    metrics={[
      { label: 'Aceitos', value: formatNumber(contracts.totalAccepted) },
      { label: 'Concluídos', value: formatNumber(contracts.totalCompleted), tone: 'success' },
      { label: 'Sucesso', value: `${contracts.successRate}%`, tone: 'primary' },
      { label: 'Maior desafio', value: contracts.largestCompletedLabel ?? '—', tone: 'accent' },
    ]}
  />
);
