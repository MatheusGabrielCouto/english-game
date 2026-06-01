import type { StatisticsDashboard } from '@/types/statistics';

import { formatNumber } from '../utils/formatters';
import { StatMetricGrid } from './StatMetricGrid';

type CitySectionProps = {
  city: StatisticsDashboard['city'];
};

export const CitySection = ({ city }: CitySectionProps) => (
  <StatMetricGrid
    title="Cidade"
    metrics={[
      {
        label: 'Marco atual',
        value: `${city.currentBuildingEmoji} ${city.currentBuildingLabel}`,
        tone: 'primary',
      },
      {
        label: 'Construídos',
        value: `${formatNumber(city.totalUnlocked)}/${formatNumber(city.totalBuildings)}`,
        tone: 'success',
      },
      { label: 'Expansão', value: `${city.progressPercentage}%`, tone: 'primary' },
    ]}
  />
);
