import { Text, View } from 'react-native';

import { ProgressBar } from '@/components';
import type { ActiveCityEventViewModel } from '@/types/city-event';

import { CITY_UI } from '../constants/city-ui';

type CityEventBannerProps = {
  event: ActiveCityEventViewModel;
};

export const CityEventBanner = ({ event }: CityEventBannerProps) => (
  <View className="overflow-hidden rounded-2xl border border-primary/35 bg-primary/10">
    <View className="flex-row items-center justify-between gap-2 px-4 py-3">
      <View className="min-w-0 flex-1">
        <Text className="text-xs font-bold uppercase tracking-widest text-primary">
          {event.emoji} {event.name}
        </Text>
        <Text className="mt-1 text-sm leading-5 text-foreground-secondary" numberOfLines={2}>
          {event.description}
        </Text>
      </View>
      <View className="rounded-full border border-primary/30 bg-surface px-2.5 py-1">
        <Text className="text-[10px] font-bold text-primary">
          {CITY_UI.eventBannerDaysLeft(event.daysRemaining)}
        </Text>
      </View>
    </View>

    <View className="gap-2 border-t border-primary/20 px-4 py-3">
      <View className="flex-row items-center justify-between">
        <Text className="text-xs font-semibold text-foreground">
          {CITY_UI.eventBannerSpirit(event.spiritProgress, event.spiritLabel)}
        </Text>
        <Text className="text-[10px] text-muted">
          {CITY_UI.eventBannerVocab(
            event.vocabWordsLearned,
            event.vocabTarget,
            event.emoji,
          )}
        </Text>
      </View>
      <ProgressBar value={event.spiritProgress} max={100} variant="gold" height="sm" />
    </View>
  </View>
);
