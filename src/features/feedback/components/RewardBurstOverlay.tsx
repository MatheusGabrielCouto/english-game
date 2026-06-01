import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { AppIcon } from '@/components/ui/AppIcon';
import { theme } from '@/constants';

import { useFeedbackStore, type MissionRewardBurst } from '../store/feedback-store';

type RewardBurstItemProps = {
  burst: MissionRewardBurst;
  index: number;
  onDone: (id: string) => void;
};

const RewardBurstItem = ({ burst, index, onDone }: RewardBurstItemProps) => {
  const translateY = useSharedValue(40);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.85);

  useEffect(() => {
    const delay = index * 80;
    opacity.value = withDelay(delay, withTiming(1, { duration: 200 }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 350 }));
    scale.value = withDelay(delay, withTiming(1, { duration: 350 }));

    const timeout = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 300 }, (finished) => {
        if (finished) {
          runOnJS(onDone)(burst.id);
        }
      });
      translateY.value = withTiming(-30, { duration: 300 });
    }, 2200 + delay);

    return () => clearTimeout(timeout);
  }, [burst.id, index, onDone, opacity, scale, translateY]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  return (
    <Animated.View style={style} className="mb-2">
      <View className="flex-row items-center gap-3 rounded-2xl border border-success/40 bg-surface-elevated px-4 py-3 shadow-lg">
        <Text className="text-2xl">✅</Text>
        <View className="flex-1">
          <Text className="text-sm font-bold text-foreground" numberOfLines={1}>
            {burst.title}
          </Text>
          <View className="mt-1 flex-row gap-3">
            {burst.xp > 0 ? (
              <View className="flex-row items-center gap-1">
                <AppIcon name="flash" size={12} color={theme.colors.xp} />
                <Text className="text-xs font-bold text-xp">+{burst.xp} XP</Text>
              </View>
            ) : null}
            {burst.coins > 0 ? (
              <View className="flex-row items-center gap-1">
                <AppIcon name="logo-bitcoin" size={12} color={theme.colors.coin} />
                <Text className="text-xs font-bold text-coin">+{burst.coins}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

export const RewardBurstOverlay = () => {
  const bursts = useFeedbackStore((state) => state.rewardBursts);
  const removeRewardBurst = useFeedbackStore((state) => state.removeRewardBurst);

  if (bursts.length === 0) return null;

  return (
    <View
      className="absolute left-0 right-0 top-16 z-50 px-5"
      pointerEvents="none"
      accessibilityLiveRegion="polite">
      {bursts.map((burst, index) => (
        <RewardBurstItem key={burst.id} burst={burst} index={index} onDone={removeRewardBurst} />
      ))}
    </View>
  );
};
