import { useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '@/components';
import type { SeasonTierView } from '@/types/metagame';
import { cn } from '@/utils';

import { MetagameService } from '../services/metagame-service';

type SeasonTierTimelineProps = {
  tiers: SeasonTierView[];
  seasonPoints: number;
};

export const SeasonTierTimeline = ({ tiers, seasonPoints }: SeasonTierTimelineProps) => {
  const [claimingTier, setClaimingTier] = useState<number | null>(null);

  const handleClaim = async (tier: number) => {
    setClaimingTier(tier);
    try {
      await MetagameService.claimSeasonTier(tier);
    } finally {
      setClaimingTier(null);
    }
  };

  return (
    <View className="mt-4 gap-0">
      {tiers.map((tier, index) => {
        const isLast = index === tiers.length - 1;
        const progressToTier = Math.min(100, Math.round((seasonPoints / tier.pointsRequired) * 100));
        const unlocked = tier.status !== 'locked';

        return (
          <View key={tier.tier} className="flex-row gap-3">
            <View className="items-center">
              <View
                className={cn(
                  'h-9 w-9 items-center justify-center rounded-full border-2',
                  tier.status === 'claimed'
                    ? 'border-success bg-success/20'
                    : tier.status === 'claimable'
                      ? 'border-gold bg-gold/30'
                      : unlocked
                        ? 'border-gold bg-gold/20'
                        : 'border-border bg-surface',
                )}>
                <Text
                  className={cn(
                    'text-xs font-black',
                    tier.status === 'claimed'
                      ? 'text-success'
                      : tier.status === 'claimable'
                        ? 'text-gold'
                        : 'text-muted',
                  )}>
                  {tier.status === 'claimed' ? '✓' : tier.tier}
                </Text>
              </View>
              {!isLast ? (
                <View
                  className={cn(
                    'my-1 min-h-[20px] w-0.5 flex-1',
                    tier.status === 'claimed' ? 'bg-success/50' : unlocked ? 'bg-gold/50' : 'bg-border',
                  )}
                />
              ) : null}
            </View>

            <View
              className={cn(
                'mb-4 flex-1 rounded-xl border px-3 py-2.5',
                tier.status === 'claimable'
                  ? 'border-gold/50 bg-gold/10'
                  : tier.status === 'claimed'
                    ? 'border-success/30 bg-success/5'
                    : unlocked
                      ? 'border-gold/30 bg-gold/5'
                      : 'border-border bg-surface',
              )}>
              <View className="flex-row items-center justify-between gap-2">
                <Text
                  className={cn(
                    'flex-1 text-sm font-bold',
                    tier.status === 'locked' ? 'text-muted' : 'text-foreground',
                  )}>
                  {tier.rewardLabel}
                </Text>
                {tier.status === 'claimable' ? (
                  <Text className="text-[10px] font-bold uppercase text-gold">Resgatar</Text>
                ) : tier.status === 'claimed' ? (
                  <Text className="text-xs text-success">Resgatado</Text>
                ) : null}
              </View>
              <Text className="mt-0.5 text-[10px] text-muted">{tier.pointsRequired} pts</Text>

              {tier.status === 'locked' && seasonPoints < tier.pointsRequired ? (
                <Text className="mt-1 text-[10px] text-muted">{progressToTier}% do caminho</Text>
              ) : null}

              {tier.status === 'claimable' ? (
                <View className="mt-2">
                  <Button
                    label="Resgatar recompensa"
                    loading={claimingTier === tier.tier}
                    loadingLabel="Resgatando…"
                    size="sm"
                    onPress={() => void handleClaim(tier.tier)}
                    disabled={claimingTier !== null}
                  />
                </View>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
};
