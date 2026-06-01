import type { StatisticsDashboard } from '@/types/statistics';

import { formatNumber } from '../utils/formatters';
import { StatMetricGrid } from './StatMetricGrid';

type AchievementsSectionProps = {
  achievements: StatisticsDashboard['achievements'];
};

export const AchievementsSection = ({ achievements }: AchievementsSectionProps) => (
  <StatMetricGrid
    title="Conquistas"
    metrics={[
      {
        label: 'Desbloqueadas',
        value: `${formatNumber(achievements.unlocked)}/${formatNumber(achievements.total)}`,
        tone: 'success',
      },
      { label: 'Progresso', value: `${achievements.completionRate}%`, tone: 'primary' },
      { label: 'Top categoria', value: achievements.topCategoryLabel ?? '—', tone: 'accent' },
    ]}
  />
);
