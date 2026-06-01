import type { StatisticsDashboard } from '@/types/statistics';

import { formatNumber } from '../utils/formatters';
import { StatMetricGrid } from './StatMetricGrid';

type LootBoxesSectionProps = {
  lootBoxes: StatisticsDashboard['lootBoxes'];
};

export const LootBoxesSection = ({ lootBoxes }: LootBoxesSectionProps) => (
  <StatMetricGrid
    title="Loot boxes"
    metrics={[
      { label: 'Recebidas', value: formatNumber(lootBoxes.totalReceived) },
      { label: 'Abertas', value: formatNumber(lootBoxes.totalOpened), tone: 'success' },
      { label: 'Melhor drop', value: lootBoxes.bestRewardLabel, tone: 'accent' },
      { label: 'Raridade máx.', value: lootBoxes.highestRarityLabel ?? '—', tone: 'primary' },
    ]}
  />
);
