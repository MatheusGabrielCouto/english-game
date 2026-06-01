import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { theme } from '@/constants';
import { ActiveContractCard } from '@/features/contracts/components/ActiveContractCard';
import { AvailableContractCard } from '@/features/contracts/components/AvailableContractCard';
import { ContractAcceptModal } from '@/features/contracts/components/ContractAcceptModal';
import { CONTRACT_MESSAGES } from '@/features/contracts/constants/default-contracts';
import { useContracts } from '@/features/contracts/hooks/use-contracts';
import { ContractService } from '@/features/contracts/services/contract-service';
import type { ContractDefinition, PoiContractsState } from '@/types/contract';

import { CITY_UI } from '../constants/city-ui';

type CityPoiContractsSectionProps = {
  poiKey: string;
  isUnlocked: boolean;
};

export const CityPoiContractsSection = ({ poiKey, isUnlocked }: CityPoiContractsSectionProps) => {
  const contracts = useContracts();
  const [state, setState] = useState<PoiContractsState | null>(null);
  const [loading, setLoading] = useState(false);

  const loadContracts = useCallback(async () => {
    if (!isUnlocked) return;

    setLoading(true);
    try {
      const next = await ContractService.getContractsForPoi(poiKey);
      setState(next);
    } finally {
      setLoading(false);
    }
  }, [isUnlocked, poiKey]);

  useEffect(() => {
    void loadContracts();
  }, [loadContracts, contracts.activeContract]);

  const handleAccept = (definition: ContractDefinition) => {
    contracts.handleSelectContract(definition, poiKey);
  };

  if (!isUnlocked) return null;

  return (
    <View className="gap-3">
      <Text className="text-sm font-semibold text-foreground">{CITY_UI.poiContractsTitle}</Text>
      <Text className="text-xs text-foreground-secondary">{CITY_UI.poiContractsHint}</Text>

      {loading ? (
        <View className="items-center py-6">
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : null}

      {!loading && state?.activeElsewhere ? (
        <View className="rounded-2xl border border-warning/40 bg-warning/10 px-4 py-3">
          <Text className="text-sm font-medium text-foreground">{CONTRACT_MESSAGES.activeElsewhere}</Text>
          <Text className="mt-1 text-xs leading-5 text-foreground-secondary">
            {CITY_UI.poiContractActiveElsewhere(
              state.activeElsewhere.contractName,
              state.activeElsewhere.issuerPoiName,
            )}
          </Text>
        </View>
      ) : null}

      {!loading && state?.activeHere ? <ActiveContractCard contract={state.activeHere} /> : null}

      {!loading && !state?.activeHere && !state?.activeElsewhere
        ? state?.available.map((definition) => (
            <AvailableContractCard
              key={definition.key}
              definition={definition}
              canAfford={contracts.canAfford(definition)}
              onAccept={handleAccept}
              compact
            />
          ))
        : null}

      {!loading &&
      !state?.activeHere &&
      !state?.activeElsewhere &&
      (state?.available.length ?? 0) === 0 ? (
        <Text className="text-sm text-muted">{CITY_UI.poiContractsEmpty}</Text>
      ) : null}

      {contracts.selectedContractKey ? <ContractAcceptModal contracts={contracts} /> : null}
    </View>
  );
};
