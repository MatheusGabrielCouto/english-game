import { create } from 'zustand';

import type { ActiveCityEventViewModel } from '@/types/city-event';
import type {
  CityDistrictViewModel,
  CityMapSummary,
  CityPoiViewModel,
  CityRumorViewModel,
  CityVitalityBand,
} from '@/types/city-map';
import type { CityResourceBalances } from '@/types/city-resource';

type CityMapState = {
  districts: CityDistrictViewModel[];
  pois: CityPoiViewModel[];
  summary: CityMapSummary | null;
  claimablePoiKeys: string[];
  activeContractIssuerPoiKey: string | null;
  resourceBalances: CityResourceBalances | null;
  activeRumor: CityRumorViewModel | null;
  vitalityBand: CityVitalityBand;
  petVisitedParkToday: boolean;
  activeCityEvent: ActiveCityEventViewModel | null;
  selectedPoiKey: string | null;
  activeTab: 'map' | 'summary';
  isLoading: boolean;
  setSelectedPoiKey: (poiKey: string | null) => void;
  setActiveTab: (tab: 'map' | 'summary') => void;
};

export const useCityMapStore = create<CityMapState>()((set) => ({
  districts: [],
  pois: [],
  summary: null,
  claimablePoiKeys: [],
  activeContractIssuerPoiKey: null,
  resourceBalances: null,
  activeRumor: null,
  vitalityBand: 'mid',
  petVisitedParkToday: false,
  activeCityEvent: null,
  selectedPoiKey: null,
  activeTab: 'map',
  isLoading: true,
  setSelectedPoiKey: (poiKey) => set({ selectedPoiKey: poiKey }),
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
