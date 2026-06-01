import { ActivityIndicator, Text, View } from 'react-native';

import { theme } from '@/constants';

import { STATISTICS_MESSAGES } from '../constants/default-statistics';
import { STATISTICS_UI } from '../constants/statistics-ui';
import type { UseStatisticsReturn } from '../hooks/use-statistics';
import { AchievementsSection } from './AchievementsSection';
import { CitySection } from './CitySection';
import { ConsistencySection } from './ConsistencySection';
import { ContractsSection } from './ContractsSection';
import { LootBoxesSection } from './LootBoxesSection';
import { OverviewSection } from './OverviewSection';
import { PetSection } from './PetSection';
import { QuestsSection } from './QuestsSection';
import { StatisticsCollapsibleSection } from './StatisticsCollapsibleSection';
import { StatisticsHeroCard } from './StatisticsHeroCard';
import { StatisticsInsightsCard } from './StatisticsInsightsCard';
import { StatisticsMilestoneList } from './StatisticsMilestoneList';

type StatisticsScreenContentProps = {
  statistics: UseStatisticsReturn;
};

export const StatisticsScreenContent = ({ statistics }: StatisticsScreenContentProps) => {
  const { dashboard, isLoading } = statistics;

  if (isLoading || !dashboard) {
    return (
      <View className="items-center justify-center py-20">
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text className="mt-3 text-sm text-foreground-secondary">{STATISTICS_MESSAGES.loading}</Text>
      </View>
    );
  }

  return (
    <View className="gap-3 pb-4">
      <StatisticsHeroCard dashboard={dashboard} />
      <StatisticsInsightsCard insights={dashboard.insights} />

      <StatisticsCollapsibleSection
        title={STATISTICS_UI.sections.consistency.title}
        emoji={STATISTICS_UI.sections.consistency.emoji}
        subtitle={STATISTICS_UI.sections.consistency.subtitle}
        defaultOpen>
        <ConsistencySection consistency={dashboard.consistency} />
        <OverviewSection overview={dashboard.overview} />
      </StatisticsCollapsibleSection>

      <StatisticsCollapsibleSection
        title={STATISTICS_UI.sections.quests.title}
        emoji={STATISTICS_UI.sections.quests.emoji}
        subtitle={STATISTICS_UI.sections.quests.subtitle}>
        <QuestsSection quests={dashboard.quests} />
      </StatisticsCollapsibleSection>

      <StatisticsCollapsibleSection
        title={STATISTICS_UI.sections.collection.title}
        emoji={STATISTICS_UI.sections.collection.emoji}
        subtitle={STATISTICS_UI.sections.collection.subtitle}>
        <PetSection pet={dashboard.pet} />
        <LootBoxesSection lootBoxes={dashboard.lootBoxes} />
        <AchievementsSection achievements={dashboard.achievements} />
      </StatisticsCollapsibleSection>

      <StatisticsCollapsibleSection
        title={STATISTICS_UI.sections.world.title}
        emoji={STATISTICS_UI.sections.world.emoji}
        subtitle={STATISTICS_UI.sections.world.subtitle}>
        <ContractsSection contracts={dashboard.contracts} />
        <CitySection city={dashboard.city} />
      </StatisticsCollapsibleSection>

      <StatisticsCollapsibleSection
        title={STATISTICS_UI.sections.history.title}
        emoji={STATISTICS_UI.sections.history.emoji}
        subtitle={STATISTICS_UI.sections.history.subtitle}>
        <StatisticsMilestoneList milestones={dashboard.milestones} />
      </StatisticsCollapsibleSection>
    </View>
  );
};
