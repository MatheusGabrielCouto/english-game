import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

import { PressableScale } from '@/components/ui/game';

import type { PetFarmMapBuildingDef } from '../catalogs/pet-farm-map-catalog';
import { petFarmIslandToPercent } from '../constants/pet-farm-island-layout';
import type { PetFarmOnboardingTargetKey } from '../constants/pet-farm-onboarding-ui';
import { PetFarmOnboardingTarget } from './PetFarmOnboardingTarget';

const PIN = {
  md: { width: 72, height: 68, anchorX: 36, anchorY: 32 },
  sm: { width: 60, height: 54, anchorX: 30, anchorY: 26 },
} as const;

type PetFarmMapBuildingProps = {
  building: PetFarmMapBuildingDef;
  badge?: string;
  highlighted?: boolean;
  onboardingTargetKey?: PetFarmOnboardingTargetKey;
  onPress: () => void;
};

export const PetFarmMapBuilding = ({
  building,
  badge,
  highlighted = false,
  onboardingTargetKey,
  onPress,
}: PetFarmMapBuildingProps) => {
  const bounce = useSharedValue(1);
  const size = building.size === 'sm' ? 'sm' : 'md';
  const pin = PIN[size];
  const { leftPercent, topPercent } = petFarmIslandToPercent(building.x, building.y);

  useEffect(() => {
    const peak = highlighted ? 1.14 : 1.06;
    const duration = highlighted ? 620 : 1100;

    bounce.value = withRepeat(
      withSequence(
        withTiming(peak, { duration, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [bounce, highlighted]);

  const bounceStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bounce.value }],
  }));

  const pressable = (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={building.label}>
      <Animated.View style={bounceStyle} className="items-center">
        <View
          className={`items-center rounded-2xl border-2 bg-emerald-950/85 shadow-lg ${
            size === 'sm' ? 'px-2 py-1.5' : 'px-2.5 py-2'
          } ${building.comingSoon ? 'opacity-90' : ''} ${
            highlighted ? 'border-emerald-400/80' : 'border-amber-100/30'
          }`}
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.4,
            shadowRadius: 5,
            elevation: 6,
          }}>
          {badge ? (
            <View className="absolute -right-1 -top-1 z-10 min-w-[18px] rounded-full bg-primary px-1 py-0.5">
              <Text className="text-center text-[9px] font-black text-background">{badge}</Text>
            </View>
          ) : null}
          {building.comingSoon ? (
            <View className="absolute -left-1 -top-1 rounded bg-muted/90 px-1">
              <Text className="text-[8px] font-bold text-foreground">🔜</Text>
            </View>
          ) : null}
          <Text className={size === 'sm' ? 'text-xl' : 'text-2xl'}>{building.emoji}</Text>
        </View>
        <Text
          className={`mt-0.5 max-w-[76px] text-center font-bold text-amber-50 ${
            size === 'sm' ? 'text-[8px]' : 'text-[9px]'
          }`}
          style={{
            textShadowColor: 'rgba(0,0,0,0.8)',
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 2,
          }}
          numberOfLines={2}>
          {building.label}
        </Text>
      </Animated.View>
    </PressableScale>
  );

  return (
    <View
      className="absolute items-center"
      style={{
        left: `${leftPercent}%`,
        top: `${topPercent}%`,
        marginLeft: -pin.anchorX,
        marginTop: -pin.anchorY,
        width: pin.width,
      }}>
      {onboardingTargetKey ? (
        <PetFarmOnboardingTarget targetKey={onboardingTargetKey}>
          {pressable}
        </PetFarmOnboardingTarget>
      ) : (
        pressable
      )}
    </View>
  );
};
