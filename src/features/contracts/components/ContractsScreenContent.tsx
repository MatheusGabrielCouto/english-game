import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { ScreenSkeleton } from '@/components/ui/skeleton';

import { CONTRACTS_UI } from '../constants/contracts-ui';
import { CONTRACT_ORDER } from '../constants/default-contracts';
import type { UseContractsReturn } from '../hooks/use-contracts';
import { ActiveContractCard } from './ActiveContractCard';
import { AvailableContractCard } from './AvailableContractCard';
import { ContractAcceptModal } from './ContractAcceptModal';
import { ContractHistoryList } from './ContractHistoryList';
import { ContractStatsCard } from './ContractStatsCard';
import { ContractsHeroCard } from './ContractsHeroCard';
import { ContractsHowItWorksCard } from './ContractsHowItWorksCard';

type ContractsScreenContentProps = {
  contracts: UseContractsReturn;
};

export const ContractsScreenContent = ({ contracts }: ContractsScreenContentProps) => {
  const router = useRouter();
  const {
    activeContract,
    history,
    analytics,
    availableKeys,
    isLoading,
    getDefinition,
    canAfford,
    handleSelectContract,
  } = contracts;

  if (isLoading || !analytics) {
    return <ScreenSkeleton variant="hero-list" listCount={3} />;
  }

  return (
    <View className="gap-4 pb-4">
      <ContractsHeroCard activeContract={activeContract} analytics={analytics} />
      <ContractsHowItWorksCard />

      {activeContract ? <ActiveContractCard contract={activeContract} /> : null}

      {!activeContract ? (
        <View className="gap-3">
          <View className="gap-1 px-1">
            <Text className="text-sm font-black text-foreground">{CONTRACTS_UI.availableTitle}</Text>
            <Text className="text-xs leading-4 text-foreground-secondary">
              {CONTRACTS_UI.availableHint}
            </Text>
          </View>
          {CONTRACT_ORDER.filter((key) => availableKeys.includes(key)).map((key) => {
            const definition = getDefinition(key);
            if (!definition) return null;

            return (
              <View key={definition.key} className="gap-2">
                <AvailableContractCard
                  definition={definition}
                  canAfford={canAfford(definition)}
                  onAccept={handleSelectContract}
                  showIssuer
                />
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: '/city',
                      params: { poiKey: definition.issuerPoiKey, tab: 'contracts' },
                    })
                  }
                  accessibilityRole="button"
                  accessibilityLabel={`${CONTRACTS_UI.goToIssuer} ${definition.name}`}
                  className="items-center rounded-xl border border-border bg-surface px-4 py-2.5"
                >
                  <Text className="text-sm font-semibold text-primary">{CONTRACTS_UI.goToIssuer}</Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      ) : (
        <View className="rounded-xl border border-border bg-surface px-4 py-3">
          <Text className="text-sm leading-5 text-foreground-secondary">{CONTRACTS_UI.lockedHint}</Text>
        </View>
      )}

      <ContractStatsCard analytics={analytics} />
      <ContractHistoryList history={history} />
      <ContractAcceptModal contracts={contracts} />
    </View>
  );
};
