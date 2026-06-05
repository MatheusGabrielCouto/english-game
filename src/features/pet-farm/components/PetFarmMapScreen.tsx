import { useRouter, type Href } from 'expo-router';
import { useMemo } from 'react';
import { Text, View } from 'react-native';
import Animated, {
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
} from 'react-native-reanimated';

import { Card } from '@/components';
import { PressableScale } from '@/components/ui/game';
import { routes } from '@/constants';

import { PET_FARM_MAP_BUILDINGS } from '../catalogs/pet-farm-map-catalog';
import { PET_FARM_ISLAND_VIEW_H } from '../constants/pet-farm-island-layout';
import { PET_FARM_MAP_UI } from '../constants/pet-farm-map-ui';
import { PET_FARM_UI } from '../constants/pet-farm-ui';
import { PetFarmService } from '../services/pet-farm-service';
import { usePetFarmStore } from '../store/pet-farm-store';
import { PetFarmIslandBackdrop } from './PetFarmIslandBackdrop';
import { PetFarmMapBuilding } from './PetFarmMapBuilding';

const SCENE_HEIGHT = PET_FARM_ISLAND_VIEW_H;

export const PetFarmMapScreen = () => {
  const router = useRouter();
  const bonuses = usePetFarmStore((s) => s.bonuses);
  const incubators = usePetFarmStore((s) => s.incubators);
  const adventures = usePetFarmStore((s) => s.adventures);
  const academySessions = usePetFarmStore((s) => s.academySessions);
  const instances = usePetFarmStore((s) => s.instances);
  const scrollY = useSharedValue(0);

  const readyEggs = useMemo(
    () => incubators.filter((e) => new Date(e.hatchAt).getTime() <= Date.now()).length,
    [incubators],
  );

  const readyAdventures = useMemo(
    () => adventures.filter((a) => new Date(a.endsAt).getTime() <= Date.now()).length,
    [adventures],
  );

  const readyAcademy = useMemo(
    () => academySessions.filter((s) => new Date(s.endsAt).getTime() <= Date.now()).length,
    [academySessions],
  );

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const sceneParallaxStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scrollY.value * -0.05 }],
  }));

  const titleParallaxStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scrollY.value * 0.03 }],
    opacity: 1 - Math.min(scrollY.value / 100, 0.4),
  }));

  const badgeFor = (key: string): string | undefined => {
    switch (key) {
      case 'incubator':
        if (readyEggs > 0) return String(readyEggs);
        if (incubators.length > 0) return String(incubators.length);
        return undefined;
      case 'barn':
        return instances.length > 0 ? String(instances.length) : undefined;
      case 'adventures':
        if (readyAdventures > 0) return String(readyAdventures);
        if (adventures.length > 0) return String(adventures.length);
        return undefined;
      case 'academy':
        if (readyAcademy > 0) return String(readyAcademy);
        if (academySessions.length > 0) return String(academySessions.length);
        return undefined;
      default:
        return undefined;
    }
  };

  const handleBuildingPress = (route: Href) => {
    router.push(route);
  };

  return (
    <View className="gap-4">
      <Card className="gap-1 border-emerald-500/25 bg-emerald-950/15">
        <Text className="text-xs text-muted">{PET_FARM_UI.bonuses}</Text>
        <Text className="text-sm font-bold text-foreground">
          {PetFarmService.formatBonusSummary(bonuses)}
        </Text>
      </Card>

      <View
        className="overflow-hidden rounded-3xl border border-sky-700/40"
        style={{
          shadowColor: '#0f4d6b',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.35,
          shadowRadius: 16,
          elevation: 10,
        }}>
        <Animated.ScrollView
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          bounces
          contentContainerStyle={{ paddingBottom: 8 }}>
          <View style={{ height: SCENE_HEIGHT }} className="relative">
            <Animated.View style={sceneParallaxStyle} className="absolute inset-0">
              <PetFarmIslandBackdrop height={SCENE_HEIGHT} />
            </Animated.View>

            <Animated.View
              pointerEvents="none"
              className="absolute inset-x-0 top-2.5 z-10 px-4"
              style={titleParallaxStyle}>
              <View className="items-center rounded-2xl bg-black/30 px-4 py-1.5">
                <Text className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-100">
                  {PET_FARM_MAP_UI.islandTitle}
                </Text>
                <Text className="text-[9px] text-sky-200/75">{PET_FARM_MAP_UI.tapBuilding}</Text>
              </View>
            </Animated.View>

            <View className="absolute inset-0 z-20">
              {PET_FARM_MAP_BUILDINGS.map((building) => (
                <PetFarmMapBuilding
                  key={building.key}
                  building={building}
                  badge={badgeFor(building.key)}
                  onPress={() => handleBuildingPress(building.route)}
                />
              ))}
            </View>
          </View>
        </Animated.ScrollView>
      </View>

      {readyEggs > 0 ? (
        <PressableScale
          onPress={() => router.push(routes.petFarmIncubator as Href)}
          className="items-center rounded-xl border border-amber-500/40 bg-amber-950/25 py-2"
          accessibilityRole="button">
          <Text className="text-xs font-bold text-amber-300">
            {PET_FARM_MAP_UI.eggReady} ({readyEggs})
          </Text>
        </PressableScale>
      ) : null}

      {readyAdventures > 0 ? (
        <PressableScale
          onPress={() => router.push(routes.petFarmAdventures as Href)}
          className="items-center rounded-xl border border-primary/40 bg-primary/10 py-2"
          accessibilityRole="button">
          <Text className="text-xs font-bold text-primary">
            {PET_FARM_MAP_UI.adventureDone} ({readyAdventures})
          </Text>
        </PressableScale>
      ) : null}

      {readyAcademy > 0 ? (
        <PressableScale
          onPress={() => router.push(routes.petFarmAcademy as Href)}
          className="items-center rounded-xl border border-violet-500/40 bg-violet-950/20 py-2"
          accessibilityRole="button">
          <Text className="text-xs font-bold text-violet-300">
            {PET_FARM_MAP_UI.academyDone} ({readyAcademy})
          </Text>
        </PressableScale>
      ) : null}
    </View>
  );
};
