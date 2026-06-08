import { Text, View } from 'react-native';

import { GameCard } from '@/components/ui/game';
import type { StatMetric } from '@/types/statistics';
import { cn } from '@/utils';

type StatMetricGridProps = {
  title?: string;
  metrics: StatMetric[];
  /** Lista vertical — melhor em telas estreitas (padrão). */
  layout?: 'list' | 'grid';
};

const toneClassName: Record<NonNullable<StatMetric['tone']>, string> = {
  default: 'text-foreground',
  success: 'text-success',
  accent: 'text-accent',
  danger: 'text-danger',
  primary: 'text-primary',
};

const MetricList = ({ metrics }: { metrics: StatMetric[] }) => (
  <View className="gap-2">
    {metrics.map((metric) => (
      <View
        key={metric.label}
        className="flex-row items-center gap-3 rounded-xl border border-border bg-surface px-3 py-3">
        <Text className="min-w-0 flex-1 text-sm text-foreground-secondary" numberOfLines={2}>
          {metric.label}
        </Text>
        <Text
          className={cn(
            'max-w-[45%] shrink-0 text-right  font-black',
            toneClassName[metric.tone ?? 'default'],
          )}
          numberOfLines={2}
          adjustsFontSizeToFit
          minimumFontScale={0.85}>
          {metric.value}
        </Text>
      </View>
    ))}
  </View>
);

const MetricGrid = ({ metrics }: { metrics: StatMetric[] }) => (
  <View className="flex-row flex-wrap gap-2">
    {metrics.map((metric) => (
      <View
        key={metric.label}
        className="w-[48%] rounded-xl border border-border bg-surface px-3 py-2.5">
        <Text className="text-xs text-foreground-secondary" numberOfLines={2}>
          {metric.label}
        </Text>
        <Text
          className={cn('mt-1  font-black', toneClassName[metric.tone ?? 'default'])}
          numberOfLines={2}
          adjustsFontSizeToFit
          minimumFontScale={0.8}>
          {metric.value}
        </Text>
      </View>
    ))}
  </View>
);

export const StatMetricGrid = ({ title, metrics, layout = 'list' }: StatMetricGridProps) => {
  const body = layout === 'grid' ? <MetricGrid metrics={metrics} /> : <MetricList metrics={metrics} />;

  if (!title) {
    return body;
  }

  return (
    <View className="gap-2">
      <Text className="text-xs font-bold uppercase tracking-wide text-muted">{title}</Text>
      {body}
    </View>
  );
};

/** Card opcional para métricas isoladas fora de seção colapsável. */
export const StatMetricCard = ({ title, metrics, layout = 'list' }: StatMetricGridProps) => (
  <GameCard variant="default" className="gap-3 p-4">
    <StatMetricGrid title={title} metrics={metrics} layout={layout} />
  </GameCard>
);
