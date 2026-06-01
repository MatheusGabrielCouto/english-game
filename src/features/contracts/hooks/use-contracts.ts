import { useCallback, useEffect } from 'react';

import { usePlayerStore } from '@/features/player';
import type { ContractDefinition } from '@/types/contract';

import { CONTRACT_MESSAGES } from '../constants/default-contracts';
import { ContractService } from '../services/contract-service';
import { useContractsStore } from '../store/contracts-store';

export const useContracts = () => {
  const coins = usePlayerStore((state) => state.coins);
  const activeContract = useContractsStore((state) => state.activeContract);
  const history = useContractsStore((state) => state.history);
  const analytics = useContractsStore((state) => state.analytics);
  const availableKeys = useContractsStore((state) => state.availableKeys);
  const isLoading = useContractsStore((state) => state.isLoading);
  const toastMessage = useContractsStore((state) => state.toastMessage);
  const toastVariant = useContractsStore((state) => state.toastVariant);
  const selectedContractKey = useContractsStore((state) => state.selectedContractKey);
  const selectedAcceptIssuerPoiKey = useContractsStore((state) => state.selectedAcceptIssuerPoiKey);
  const setSelectedContractKey = useContractsStore((state) => state.setSelectedContractKey);
  const setSelectedAcceptIssuerPoiKey = useContractsStore(
    (state) => state.setSelectedAcceptIssuerPoiKey,
  );
  const clearToast = useContractsStore((state) => state.clearToast);

  useEffect(() => {
    void ContractService.refresh();
  }, []);

  const getDefinition = useCallback(
    (key: string): ContractDefinition | undefined => ContractService.getDefinition(key),
    [],
  );

  const canAfford = useCallback(
    (definition: ContractDefinition) => coins >= definition.stakeAmount,
    [coins],
  );

  const handleSelectContract = useCallback(
    (definition: ContractDefinition, issuerPoiKey?: string) => {
      if (activeContract) {
        useContractsStore.getState().showToast(CONTRACT_MESSAGES.alreadyActive, 'info');
        return;
      }
      setSelectedContractKey(definition.key);
      setSelectedAcceptIssuerPoiKey(issuerPoiKey ?? definition.issuerPoiKey);
    },
    [activeContract, setSelectedContractKey, setSelectedAcceptIssuerPoiKey],
  );

  const handleCancelAccept = useCallback(() => {
    setSelectedContractKey(null);
    setSelectedAcceptIssuerPoiKey(null);
  }, [setSelectedContractKey, setSelectedAcceptIssuerPoiKey]);

  const handleConfirmAccept = useCallback(async () => {
    if (!selectedContractKey) return false;

    const key = selectedContractKey;
    const issuerPoiKey = selectedAcceptIssuerPoiKey ?? undefined;
    setSelectedContractKey(null);
    setSelectedAcceptIssuerPoiKey(null);

    const result = await ContractService.acceptContract(key, issuerPoiKey);

    if (!result.success) {
      if (result.reason === 'insufficient_coins') {
        useContractsStore.getState().showToast(CONTRACT_MESSAGES.insufficientCoins, 'info');
      } else if (result.reason === 'already_active') {
        useContractsStore.getState().showToast(CONTRACT_MESSAGES.alreadyActive, 'info');
      } else if (result.reason === 'requirements_not_met') {
        useContractsStore.getState().showToast(CONTRACT_MESSAGES.requirementsNotMet, 'info');
      }
      return false;
    }

    return true;
  }, [
    selectedContractKey,
    selectedAcceptIssuerPoiKey,
    setSelectedContractKey,
    setSelectedAcceptIssuerPoiKey,
  ]);

  return {
    coins,
    activeContract,
    history,
    analytics,
    availableKeys,
    isLoading,
    toastMessage,
    toastVariant,
    selectedContractKey,
    getDefinition,
    canAfford,
    handleSelectContract,
    handleCancelAccept,
    handleConfirmAccept,
    clearToast,
  };
};

export type UseContractsReturn = ReturnType<typeof useContracts>;
