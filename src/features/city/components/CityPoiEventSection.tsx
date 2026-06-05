import { useCallback, useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { ListItemSkeleton } from '@/components/ui/skeleton';
import { CONTRACTS_BY_KEY } from '@/data/loaders/contracts';
import { ActiveContractCard } from '@/features/contracts/components/ActiveContractCard';
import { AvailableContractCard } from '@/features/contracts/components/AvailableContractCard';
import { ContractAcceptModal } from '@/features/contracts/components/ContractAcceptModal';
import { CONTRACT_MESSAGES } from '@/features/contracts/constants/default-contracts';
import { useContracts } from '@/features/contracts/hooks/use-contracts';
import { ContractService } from '@/features/contracts/services/contract-service';
import { useClaimLoading } from '@/hooks';
import type { ActiveCityEventViewModel } from '@/types/city-event';
import type { CityPoiMission } from '@/types/city-poi-mission';
import type { PoiContractsState } from '@/types/contract';

import { CITY_UI } from '../constants/city-ui';
import { CityMapService } from '../services/city-map-service';
import { CityPoiMissionService } from '../services/city-poi-mission-service';
import { CityPoiMissionCard } from './CityPoiMissionCard';

type CityPoiEventSectionProps = {
  poiKey: string;
  isUnlocked: boolean;
  activeEvent: ActiveCityEventViewModel;
};

export const CityPoiEventSection = ({
  poiKey,
  isUnlocked,
  activeEvent,
}: CityPoiEventSectionProps) => {
  const contracts = useContracts();
  const [missions, setMissions] = useState<CityPoiMission[]>([]);
  const [contractState, setContractState] = useState<PoiContractsState | null>(null);
  const [loading, setLoading] = useState(false);
  const { isClaiming, isBusy, runClaim } = useClaimLoading();

  const load = useCallback(async () => {
    if (!isUnlocked) return;

    setLoading(true);
    try {
      const [missionList, poiContracts] = await Promise.all([
        CityPoiMissionService.getEventMissionsForPoi(poiKey, activeEvent.eventKey),
        ContractService.getContractsForPoi(poiKey),
      ]);
      setMissions(missionList);
      const eventContracts = {
        ...poiContracts,
        available: poiContracts.available.filter((c) => c.eventKey === activeEvent.eventKey),
      };
      setContractState(eventContracts);
    } finally {
      setLoading(false);
    }
  }, [activeEvent.eventKey, isUnlocked, poiKey]);

  useEffect(() => {
    void load();
  }, [load, contracts.activeContract]);

  const handleClaim = useCallback(
    async (missionId: string) => {
      await runClaim(missionId, async () => {
        const result = await CityPoiMissionService.claimMission(missionId);
        if (!result.ok) return false;
        await load();
        await CityMapService.refresh();
        return true;
      });
    },
    [load, runClaim],
  );

  if (!isUnlocked) return null;

  const eventOnlyContracts = contractState?.available ?? [];

  return (
    <View className="gap-4">
      <View className="rounded-xl border border-primary/25 bg-primary/10 px-3 py-2">
        <Text className="text-xs font-bold text-primary">
          {CITY_UI.eventBannerSpirit(activeEvent.spiritProgress, activeEvent.spiritLabel)}
        </Text>
        {activeEvent.milestonesReached.length > 0 ? (
          <Text className="mt-1 text-[10px] text-foreground-secondary">
            {activeEvent.milestonesReached
              .map((m) => CITY_UI.eventMilestoneReached(m))
              .join(' · ')}
          </Text>
        ) : null}
      </View>

      <View className="gap-3">
        <Text className="text-sm font-bold text-foreground">
          {CITY_UI.eventMissionsTitle(activeEvent.name)}
        </Text>
        <Text className="text-xs leading-5 text-foreground-secondary">{CITY_UI.eventMissionsHint}</Text>

        {loading ? (
          <View className="gap-3 py-2">
            <ListItemSkeleton />
            <ListItemSkeleton />
          </View>
        ) : missions.length === 0 ? (
          <Text className="text-sm text-muted">{CITY_UI.poiMissionsEmpty}</Text>
        ) : (
          missions.map((mission) => (
            <CityPoiMissionCard
              key={mission.id}
              mission={mission}
              onClaim={handleClaim}
              isClaiming={isClaiming(mission.id)}
              claimDisabled={isBusy}
            />
          ))
        )}
      </View>

      <View className="gap-3">
        <Text className="text-sm font-bold text-foreground">
          {CITY_UI.eventContractsTitle(activeEvent.name)}
        </Text>

        {!loading &&
        contractState?.activeHere &&
        CONTRACTS_BY_KEY[contractState.activeHere.contractKey]?.eventKey === activeEvent.eventKey ? (
          <ActiveContractCard contract={contractState.activeHere} />
        ) : null}

        {!loading && !contractState?.activeHere
          ? eventOnlyContracts.map((definition) => (
              <AvailableContractCard
                key={definition.key}
                definition={definition}
                canAfford={contracts.canAfford(definition)}
                onAccept={(def) => contracts.handleSelectContract(def, poiKey)}
                compact
              />
            ))
          : null}

        {!loading &&
        !contractState?.activeHere &&
        eventOnlyContracts.length === 0 &&
        !contractState?.activeElsewhere ? (
          <Text className="text-sm text-muted">{CITY_UI.poiContractsEmpty}</Text>
        ) : null}

        {!loading && contractState?.activeElsewhere ? (
          <View className="rounded-2xl border border-warning/40 bg-warning/10 px-4 py-3">
            <Text className="text-sm font-medium text-foreground">{CONTRACT_MESSAGES.activeElsewhere}</Text>
            <Text className="mt-1 text-xs text-foreground-secondary">
              {CITY_UI.poiContractActiveElsewhere(
                contractState.activeElsewhere.contractName,
                contractState.activeElsewhere.issuerPoiName,
              )}
            </Text>
          </View>
        ) : null}
      </View>

      {contracts.selectedContractKey ? <ContractAcceptModal contracts={contracts} /> : null}
    </View>
  );
};
