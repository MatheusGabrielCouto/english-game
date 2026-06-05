import { create } from 'zustand';

import type { ContractAnalyticsSummary, ContractRunRecord, ContractRunViewModel } from '@/types/contract';

type ContractsState = {
  activeContract: ContractRunViewModel | null;
  history: ContractRunRecord[];
  analytics: ContractAnalyticsSummary | null;
  availableKeys: string[];
  isLoading: boolean;
  selectedContractKey: string | null;
  selectedAcceptIssuerPoiKey: string | null;
  setSelectedContractKey: (key: string | null) => void;
  setSelectedAcceptIssuerPoiKey: (poiKey: string | null) => void;
};

export const useContractsStore = create<ContractsState>()((set) => ({
  activeContract: null,
  history: [],
  analytics: null,
  availableKeys: [],
  isLoading: true,
  selectedContractKey: null,
  selectedAcceptIssuerPoiKey: null,
  setSelectedContractKey: (key) => set({ selectedContractKey: key }),
  setSelectedAcceptIssuerPoiKey: (poiKey) => set({ selectedAcceptIssuerPoiKey: poiKey }),
}));
