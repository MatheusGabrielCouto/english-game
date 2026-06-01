import { create } from 'zustand';

import type { ContractAnalyticsSummary, ContractRunRecord, ContractRunViewModel } from '@/types/contract';

type ContractsState = {
  activeContract: ContractRunViewModel | null;
  history: ContractRunRecord[];
  analytics: ContractAnalyticsSummary | null;
  availableKeys: string[];
  isLoading: boolean;
  toastMessage: string | null;
  toastVariant: 'success' | 'info';
  selectedContractKey: string | null;
  selectedAcceptIssuerPoiKey: string | null;
  setSelectedContractKey: (key: string | null) => void;
  setSelectedAcceptIssuerPoiKey: (poiKey: string | null) => void;
  showToast: (message: string, variant?: 'success' | 'info') => void;
  clearToast: () => void;
};

export const useContractsStore = create<ContractsState>()((set) => ({
  activeContract: null,
  history: [],
  analytics: null,
  availableKeys: [],
  isLoading: true,
  toastMessage: null,
  toastVariant: 'success',
  selectedContractKey: null,
  selectedAcceptIssuerPoiKey: null,
  setSelectedContractKey: (key) => set({ selectedContractKey: key }),
  setSelectedAcceptIssuerPoiKey: (poiKey) => set({ selectedAcceptIssuerPoiKey: poiKey }),
  showToast: (message, variant = 'success') => set({ toastMessage: message, toastVariant: variant }),
  clearToast: () => set({ toastMessage: null }),
}));
