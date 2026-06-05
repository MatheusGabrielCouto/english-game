import { type Href, router } from 'expo-router';
import { Text, View } from 'react-native';

import { Card, ProgressBar } from '@/components';
import { PressableScale } from '@/components/ui/game';
import { DAILY_FARM_SOFT_CAP } from '@/features/game-design/catalogs/farm-catalog';
import { FARM_UI } from '@/features/farm/constants/farm-ui';
import { useFarmStore } from '@/features/farm/store/farm-store';
import { useStudyPointsStore } from '@/features/study-points/store/study-points-store';
import { routes } from '@/constants';

export const FarmPreviewCard = () => {
  const todayStudyPoints = useFarmStore((s) => s.todayStudyPoints);
  const balance = useStudyPointsStore((s) => s.balance);
  const capProgress = Math.min(100, Math.round((todayStudyPoints / DAILY_FARM_SOFT_CAP) * 100));

  return (
    <PressableScale
      onPress={() => router.push(routes.farm as Href)}
      accessibilityRole="button"
      accessibilityLabel={FARM_UI.previewAccessibilityLabel}>
      <Card elevated className="border-success/30">
        <Text className="text-xs font-bold uppercase tracking-widest text-success">{FARM_UI.heroLabel}</Text>
        <Text className="mt-1 text-sm text-foreground-secondary">
          Estude além das missões e ganhe Study Points
        </Text>
        <View className="mt-3 flex-row items-end justify-between">
          <View>
            <Text className="text-2xl font-black text-foreground">{balance?.balance ?? 0}</Text>
            <Text className="text-xs text-muted">Study Points</Text>
          </View>
          <Text className="text-xs font-semibold text-accent">
            {todayStudyPoints}/{DAILY_FARM_SOFT_CAP} SP hoje
          </Text>
        </View>
        <View className="mt-3">
          <ProgressBar value={capProgress} variant="streak" height="sm" />
        </View>
      </Card>
    </PressableScale>
  );
};
