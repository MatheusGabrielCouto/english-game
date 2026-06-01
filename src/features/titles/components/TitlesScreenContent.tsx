import { ActivityIndicator, Text, View } from 'react-native';

import { theme } from '@/constants';

import { TITLES_UI } from '../constants/titles-ui';
import { useTitles } from '../hooks/use-titles';
import { TitleHistoryCard } from './TitleHistoryCard';
import { TitlesHeroCard } from './TitlesHeroCard';
import { TitlesHowItWorksCard } from './TitlesHowItWorksCard';

export const TitlesScreenContent = () => {
  const { titles, progress, summary, isLoading } = useTitles();

  if (isLoading || !progress) {
    return (
      <View className="items-center justify-center py-20">
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const sortedTitles = [...titles].sort((a, b) => a.requiredLevel - b.requiredLevel);

  return (
    <View className="gap-4 pb-4">
      <TitlesHeroCard progress={progress} summary={summary} />
      <TitlesHowItWorksCard />

      <View className="gap-3">
        <View className="gap-1 px-1">
          <Text className="text-sm font-black text-foreground">{TITLES_UI.historyTitle}</Text>
          <Text className="text-xs leading-4 text-foreground-secondary">{TITLES_UI.historySubtitle}</Text>
        </View>

        <View className="gap-2">
          {sortedTitles.map((title) => (
            <TitleHistoryCard key={title.key} title={title} />
          ))}
        </View>
      </View>
    </View>
  );
};
