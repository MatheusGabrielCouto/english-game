import type { StatisticsDashboard } from '@/types/statistics';

import { formatNumber } from '../utils/formatters';
import { StatMetricGrid } from './StatMetricGrid';

type ConsistencySectionProps = {
  consistency: StatisticsDashboard['consistency'];
};

export const ConsistencySection = ({ consistency }: ConsistencySectionProps) => (
  <StatMetricGrid
    metrics={[
      { label: 'Streak atual', value: formatNumber(consistency.currentStreak), tone: 'accent' },
      { label: 'Melhor streak', value: formatNumber(consistency.bestStreak), tone: 'success' },
      { label: 'Dias estudados', value: formatNumber(consistency.totalStudyDays), tone: 'accent' },
      { label: 'Streaks salvas', value: formatNumber(consistency.streaksProtected), tone: 'primary' },
      { label: 'Escudos usados', value: formatNumber(consistency.shieldsConsumed) },
    ]}
  />
);
