import { View } from 'react-native';

import { ScreenContainer, ScreenHeader } from '@/components/layout';

import { STATISTICS_UI } from '../constants/statistics-ui';
import { useStatistics } from '../hooks/use-statistics';
import { StatisticsScreenContent } from './StatisticsScreenContent';

export const StatisticsScreen = () => {
  const statistics = useStatistics();

  return (
    <ScreenContainer scrollable>
      <ScreenHeader
        showBack
        title={STATISTICS_UI.screenTitle}
        subtitle={STATISTICS_UI.screenSubtitle}
        emoji="📊"
      />
      <View className="gap-4">
        <StatisticsScreenContent statistics={statistics} />
      </View>
    </ScreenContainer>
  );
};
