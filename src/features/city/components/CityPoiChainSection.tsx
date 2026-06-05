import { useCallback, useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { ListItemSkeleton } from '@/components/ui/skeleton';
import type { PoiChainViewModel } from '@/types/city-poi-chain';
import type { CityPoiMission } from '@/types/city-poi-mission';
import { getPoiMissionStatus } from '@/types/city-poi-mission';

import { CITY_UI } from '../constants/city-ui';
import { CityPoiChainService } from '../services/city-poi-chain-service';
import { CityPoiMissionCard } from './CityPoiMissionCard';

type CityPoiChainSectionProps = {
  poiKey: string;
  onClaim: (missionId: string) => Promise<void>;
  isClaimingMission?: (missionId: string) => boolean;
  claimBusy?: boolean;
};

export const CityPoiChainSection = ({
  poiKey,
  onClaim,
  isClaimingMission,
  claimBusy = false,
}: CityPoiChainSectionProps) => {
  const [chains, setChains] = useState<PoiChainViewModel[]>([]);
  const [chainMissions, setChainMissions] = useState<CityPoiMission[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await CityPoiChainService.getChainsForPoi(poiKey);
      setChains(list);

      const missions: CityPoiMission[] = [];
      for (const chain of list) {
        if (chain.isComplete) continue;
        const mission = await CityPoiChainService.getActiveChainMission(poiKey, chain.chainKey);
        if (mission) missions.push(mission);
      }
      setChainMissions(missions);
    } finally {
      setLoading(false);
    }
  }, [poiKey]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <View className="gap-3 py-2">
        <ListItemSkeleton />
        <ListItemSkeleton />
      </View>
    );
  }

  if (chains.length === 0) return null;

  return (
    <View className="gap-3">
      <View>
        <Text className="text-sm font-bold text-foreground">{CITY_UI.poiChainsTitle}</Text>
        <Text className="mt-1 text-xs leading-5 text-foreground-secondary">
          {CITY_UI.poiChainsHint}
        </Text>
      </View>

      {chains.map((chain) => {
        const activeMission = chainMissions.find((m) => m.chainKey === chain.chainKey);
        const stepLabel =
          chain.isComplete
            ? CITY_UI.poiChainComplete
            : CITY_UI.poiChainStepProgress(
                (chain.activeStepIndex ?? 0) + 1,
                chain.totalSteps,
              );

        return (
          <View
            key={chain.chainKey}
            className="gap-2 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3"
          >
            <Text className="text-sm font-bold text-foreground">{chain.title}</Text>
            <Text className="text-xs leading-5 text-foreground-secondary">{chain.synopsis}</Text>
            <Text className="text-[10px] font-bold uppercase tracking-wide text-primary">
              {stepLabel}
            </Text>

            {activeMission && getPoiMissionStatus(activeMission) !== 'claimed' ? (
              <CityPoiMissionCard
                mission={activeMission}
                onClaim={async (id) => {
                  await onClaim(id);
                  await load();
                }}
                isClaiming={isClaimingMission?.(activeMission.id) ?? false}
                claimDisabled={claimBusy}
              />
            ) : chain.isComplete ? (
              <Text className="text-xs text-muted">{CITY_UI.poiChainArchived}</Text>
            ) : null}
          </View>
        );
      })}
    </View>
  );
};
