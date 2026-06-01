import type { StatisticsDashboard } from '@/types/statistics';

import { formatNumber } from '../utils/formatters';
import { StatMetricGrid } from './StatMetricGrid';

type OverviewSectionProps = {
  overview: StatisticsDashboard['overview'];
};

/** Métricas extras além do hero (detalhamento). */
export const OverviewSection = ({ overview }: OverviewSectionProps) => (
  <StatMetricGrid
    metrics={[
      { label: 'Dias estudados', value: formatNumber(overview.totalStudyDays) },
      { label: 'Tempo total', value: overview.totalStudyTimeLabel },
      { label: 'XP total', value: formatNumber(overview.totalXp), tone: 'primary' },
      { label: 'Moedas ganhas', value: formatNumber(overview.totalCoinsEarned), tone: 'primary' },
    ]}
  />
);
