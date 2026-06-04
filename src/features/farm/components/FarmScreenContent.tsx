import { useCallback } from 'react';
import { Text, View } from 'react-native';

import { Card, ProgressBar } from '@/components';
import { GameCard, PressableScale, StatPill } from '@/components/ui/game';
import { CITY_UI } from '@/features/city/constants/city-ui';
import { useCityMapStore } from '@/features/city/store/city-map-store';
import { FARM_UI } from '@/features/farm/constants/farm-ui';
import { useFarmCooldown } from '@/features/farm/hooks/use-farm-cooldown';
import { FarmService } from '@/features/farm/services/farm-service';
import { useFarmStore } from '@/features/farm/store/farm-store';
import { DAILY_FARM_SOFT_CAP, FARM_ACTIVITIES } from '@/features/game-design/catalogs/farm-catalog';
import { useStudyPointsStore } from '@/features/study-points/store/study-points-store';
import { FarmActivityType, type FarmActivityTypeValue } from '@/types/farm';
import { cn, useGuardedPress } from '@/utils';

const QUICK_AMOUNTS = [1, 5, 10, 15];

type FarmAmountButtonProps = {
  amount: number;
  unitLabel: string;
  activityKey: FarmActivityTypeValue;
  isOnCooldown: boolean;
  remainingSec: number;
  onFarm: (activityType: FarmActivityTypeValue, amount: number) => Promise<void>;
};

const FarmAmountButton = ({
  amount,
  unitLabel,
  activityKey,
  isOnCooldown,
  remainingSec,
  onFarm,
}: FarmAmountButtonProps) => {
  const onPress = useGuardedPress(() => onFarm(activityKey, amount));

  return (
    <PressableScale
      onPress={onPress}
      disabled={isOnCooldown}
      accessibilityRole="button"
      accessibilityState={{ disabled: isOnCooldown }}
      accessibilityLabel={
        isOnCooldown
          ? `${FARM_UI.cooldownHint(remainingSec)} — ${amount} ${unitLabel}`
          : `Registrar ${amount} ${unitLabel}`
      }
      className="min-w-[22%] flex-1">
      <View
        className={cn(
          'items-center rounded-xl border px-2 py-2.5',
          isOnCooldown
            ? 'border-border bg-surface opacity-45'
            : 'border-primary/30 bg-primary/10',
        )}>
        <Text
          className={cn(
            'text-center text-sm font-black',
            isOnCooldown ? 'text-muted' : 'text-primary',
          )}>
          +{amount}
        </Text>
        <Text className="text-center text-[10px] text-muted">{unitLabel}</Text>
      </View>
    </PressableScale>
  );
};

export const FarmScreenContent = () => {
  const todayStudyPoints = useFarmStore((s) => s.todayStudyPoints);
  const todayStats = useFarmStore((s) => s.todayStats);
  const balance = useStudyPointsStore((s) => s.balance);
  const { isOnCooldown, remainingSec } = useFarmCooldown();
  const activeCityEvent = useCityMapStore((s) => s.activeCityEvent);

  const handleFarm = useCallback(
    async (activityType: FarmActivityTypeValue, amount: number) => {
      if (isOnCooldown) return;
      await FarmService.recordManualActivity(activityType, amount);
    },
    [isOnCooldown],
  );

  const capProgress = Math.min(100, Math.round((todayStudyPoints / DAILY_FARM_SOFT_CAP) * 100));

  return (
    <View className="gap-5">
      {activeCityEvent ? (
        <View className="rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3">
          <Text className="text-xs font-bold text-primary">
            {activeCityEvent.emoji} {activeCityEvent.name} — vocabulário conta para o evento
          </Text>
          <Text className="mt-1 text-xs text-foreground-secondary">
            {CITY_UI.eventBannerVocab(
              activeCityEvent.vocabWordsLearned,
              activeCityEvent.vocabTarget,
              activeCityEvent.emoji,
            )}{' '}
            · {CITY_UI.eventBannerSpirit(activeCityEvent.spiritProgress, activeCityEvent.spiritLabel)}
          </Text>
        </View>
      ) : null}

      <GameCard variant="hero" glow>
        <Text className="text-xs font-bold uppercase tracking-widest text-primary">🌾 Farm Infinito</Text>
        <Text className="mt-1 text-sm text-foreground-secondary">
          Continue estudando após as missões e ganhe Study Points + moedas. Com as dailies
          completas, você ganha +35% no farm. Vocabulário e speaking também alimentam a cidade.
        </Text>
        <View className="mt-4 flex-row gap-2">
          <StatPill label="Study Points" value={balance?.balance ?? 0} emoji="⚡" tone="accent" />
          <StatPill label="Farm hoje" value={`${todayStudyPoints}/${DAILY_FARM_SOFT_CAP}`} emoji="📈" tone="gold" />
        </View>
        <View className="mt-4">
          <Text className="mb-1 text-xs text-muted">Cap diário de farm (anti-idle)</Text>
          <ProgressBar value={capProgress} variant="xp" height="sm" showLabel />
        </View>
        <Text className="mt-3 text-[10px] leading-4 text-muted">{FARM_UI.cooldownDetail}</Text>
      </GameCard>

      {isOnCooldown ? (
        <View
          className="rounded-xl border border-warning/35 bg-warning/10 px-4 py-3"
          accessibilityLiveRegion="polite"
          accessibilityLabel={FARM_UI.cooldownHint(remainingSec)}>
          <Text className="text-xs font-bold uppercase tracking-wide text-warning">
            {FARM_UI.cooldownBanner}
          </Text>
          <Text className="mt-1 text-sm font-semibold text-foreground">
            {FARM_UI.cooldownHint(remainingSec)}
          </Text>
        </View>
      ) : null}

      {FARM_ACTIVITIES.map((activity) => {
        const stat = todayStats.find((entry) => entry.activityType === activity.key);
        return (
          <Card key={activity.key} elevated accent>
            <View className="flex-row items-start gap-3">
              <Text className="text-3xl">{activity.emoji}</Text>
              <View className="flex-1">
                <Text className="text-base font-black text-foreground">{activity.name}</Text>
                <Text className="text-xs text-foreground-secondary">{activity.description}</Text>
                <Text className="mt-1 text-[10px] text-muted">
                  {activity.studyPointsPerUnit} SP / {activity.unitLabel.slice(0, -1)} · {activity.coinPerUnit} moedas
                  {activity.key === FarmActivityType.VOCABULARY
                    ? ' · +1 tijolo lexicon / palavra (cidade)'
                    : activity.key === FarmActivityType.SPEAKING
                      ? ' · +1 cimento / min (cidade)'
                      : ''}
                </Text>
                {stat ? (
                  <Text className="mt-1 text-[10px] font-semibold text-success">
                    Hoje: {stat.totalAmount} {activity.unitLabel} · +{stat.totalStudyPoints} SP
                  </Text>
                ) : null}
              </View>
            </View>

            <View className="mt-4 flex-row flex-wrap gap-2">
              {QUICK_AMOUNTS.map((amount) => (
                <FarmAmountButton
                  key={`${activity.key}-${amount}`}
                  amount={amount}
                  unitLabel={activity.unitLabel}
                  activityKey={activity.key}
                  isOnCooldown={isOnCooldown}
                  remainingSec={remainingSec}
                  onFarm={handleFarm}
                />
              ))}
            </View>
          </Card>
        );
      })}
    </View>
  );
};
