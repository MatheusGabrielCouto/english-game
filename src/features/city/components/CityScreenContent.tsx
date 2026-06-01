import { ActivityIndicator, Text, View } from 'react-native';

import { theme } from '@/constants';
import { ProfileSectionHeader } from '@/features/profile/components/ProfileSectionHeader';

import type { CityBuildingViewModel } from '@/types/city';

import { CITY_UI } from '../constants/city-ui';
import { useCity } from '../hooks/use-city';
import { CityHeroCard } from './CityHeroCard';
import { CityHowItWorksCard } from './CityHowItWorksCard';
import { CityProgressCard } from './CityProgressCard';
import { CitySkyline } from './CitySkyline';
import { CityTimelineItem } from './CityTimelineItem';

const isDistrictBuilding = (key: string): boolean => key.startsWith('extended_building_');

const pickVisibleDistricts = (districts: CityBuildingViewModel[], playerLevel: number) => {
  const unlocked = districts.filter((b) => b.unlockedAt !== null);
  const upcoming = districts
    .filter((b) => !b.unlockedAt && b.requiredLevel <= playerLevel + 20)
    .slice(0, 4);
  const visibleKeys = new Set([...unlocked, ...upcoming].map((b) => b.key));
  const visible = districts.filter((b) => visibleKeys.has(b.key));
  const hiddenCount = districts.length - visible.length;

  return { visible, hiddenCount };
};

export const CityScreenContent = () => {
  const { buildings, progress, summary, level, isLoading } = useCity();

  if (isLoading || !progress || !summary) {
    return (
      <View className="flex-1 items-center justify-center py-20">
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text className="mt-3 text-sm text-foreground-secondary">Carregando sua cidade...</Text>
      </View>
    );
  }

  const mainBuildings = buildings.filter((b) => !isDistrictBuilding(b.key));
  const districtBuildings = buildings.filter((b) => isDistrictBuilding(b.key));
  const { visible: visibleDistricts, hiddenCount: hiddenDistrictCount } = pickVisibleDistricts(
    districtBuildings,
    level,
  );

  return (
    <View className="gap-5 pb-8">
      <CityHeroCard level={level} summary={summary} progress={progress} />
      <CityHowItWorksCard />
      <CityProgressCard progress={progress} />

      <View className="gap-3">
        <ProfileSectionHeader
          title={CITY_UI.skylineTitle}
          subtitle={CITY_UI.skylineSubtitle}
          emoji="🌆"
        />
        <CitySkyline buildings={buildings} />
      </View>

      <View className="gap-1">
        <ProfileSectionHeader
          title={CITY_UI.roadmapTitle}
          subtitle={CITY_UI.roadmapSubtitle}
          emoji="🗺️"
        />
        <View className="mt-2">
          {mainBuildings.map((building, index) => (
            <CityTimelineItem
              key={building.key}
              building={building}
              playerLevel={level}
              isLast={index === mainBuildings.length - 1 && visibleDistricts.length === 0}
            />
          ))}
        </View>
      </View>

      {districtBuildings.length > 0 ? (
        <View className="gap-1">
          <ProfileSectionHeader
            title={CITY_UI.districtsTitle}
            subtitle={CITY_UI.districtsSubtitle}
            emoji="🌐"
          />
          <View className="mt-2">
            {visibleDistricts.map((building, index) => (
              <CityTimelineItem
                key={building.key}
                building={building}
                playerLevel={level}
                isLast={index === visibleDistricts.length - 1}
              />
            ))}
          </View>
          {hiddenDistrictCount > 0 ? (
            <View className="rounded-xl border border-dashed border-border bg-surface/80 px-4 py-3">
              <Text className="text-center text-xs text-muted">
                {CITY_UI.districtsMore(hiddenDistrictCount)}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
};
