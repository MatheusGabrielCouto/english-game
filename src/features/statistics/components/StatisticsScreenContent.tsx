import { View } from 'react-native'

import { ScreenSkeleton } from '@/components/ui/skeleton'
import { STATISTICS_UI } from '../constants/statistics-ui'
import type { UseStatisticsReturn } from '../hooks/use-statistics'
import { AchievementsSection } from './AchievementsSection'
import { CitySection } from './CitySection'
import { ConsistencySection } from './ConsistencySection'
import { ContractsSection } from './ContractsSection'
import { LootBoxesSection } from './LootBoxesSection'
import { OverviewSection } from './OverviewSection'
import { PetSection } from './PetSection'
import { QuestsSection } from './QuestsSection'
import { StatisticsCollapsibleSection } from './StatisticsCollapsibleSection'
import { StatisticsHeroCard } from './StatisticsHeroCard'
import { StatisticsInsightsFeed } from './StatisticsInsightsFeed'
import { StatisticsMilestoneList } from './StatisticsMilestoneList'

type StatisticsScreenContentProps = {
  statistics: UseStatisticsReturn
}

export const StatisticsScreenContent = ({ statistics }: StatisticsScreenContentProps) => {
  const { dashboard, isLoading, handleDetailsExpand } = statistics

  if (isLoading || !dashboard) {
    return <ScreenSkeleton variant="hero-list" listCount={3} className="gap-3" />
  }

  return (
    <View className="gap-3 pb-4">
      <StatisticsInsightsFeed insights={dashboard.insights} />

      <StatisticsCollapsibleSection
        title={STATISTICS_UI.sections.details.title}
        emoji={STATISTICS_UI.sections.details.emoji}
        subtitle={STATISTICS_UI.sections.details.subtitle}
        onExpand={handleDetailsExpand}>
        <StatisticsHeroCard dashboard={dashboard} />

        <StatisticsCollapsibleSection
          title={STATISTICS_UI.sections.progress.title}
          emoji={STATISTICS_UI.sections.progress.emoji}
          subtitle={STATISTICS_UI.sections.progress.subtitle}>
          <ConsistencySection consistency={dashboard.consistency} />
          <OverviewSection overview={dashboard.overview} />
        </StatisticsCollapsibleSection>

        <StatisticsCollapsibleSection
          title={STATISTICS_UI.sections.activity.title}
          emoji={STATISTICS_UI.sections.activity.emoji}
          subtitle={STATISTICS_UI.sections.activity.subtitle}>
          <QuestsSection quests={dashboard.quests} />
          <ContractsSection contracts={dashboard.contracts} />
          <CitySection city={dashboard.city} />
        </StatisticsCollapsibleSection>

        <StatisticsCollapsibleSection
          title={STATISTICS_UI.sections.collection.title}
          emoji={STATISTICS_UI.sections.collection.emoji}
          subtitle={STATISTICS_UI.sections.collection.subtitle}>
          <PetSection pet={dashboard.pet} />
          <LootBoxesSection lootBoxes={dashboard.lootBoxes} />
          <AchievementsSection achievements={dashboard.achievements} />
          <StatisticsMilestoneList milestones={dashboard.milestones} />
        </StatisticsCollapsibleSection>
      </StatisticsCollapsibleSection>
    </View>
  )
}
