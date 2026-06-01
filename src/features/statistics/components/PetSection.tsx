import type { StatisticsDashboard } from '@/types/statistics';

import { formatNumber } from '../utils/formatters';
import { StatMetricGrid } from './StatMetricGrid';

type PetSectionProps = {
  pet: StatisticsDashboard['pet'];
};

export const PetSection = ({ pet }: PetSectionProps) => (
  <StatMetricGrid
    title="Pet"
    metrics={[
      { label: 'Estágio', value: `${pet.stageEmoji} ${pet.stageLabel}`, tone: 'primary' },
      { label: 'Nível', value: String(pet.level), tone: 'accent' },
      { label: 'Evoluções', value: formatNumber(pet.totalEvolutions), tone: 'success' },
      { label: 'Humor médio', value: pet.averageMoodLabel },
    ]}
  />
);
