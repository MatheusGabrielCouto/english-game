import { getNpcTrustBand, getNpcTrustLabel } from '@/features/city/constants/npc-trust-config';
import type { CityPoiViewModel, CityRumorViewModel, CityVitalityBand } from '@/types/city-map';

import { CITY_UI } from '../constants/city-ui';

export const getNpcFlavorLine = (
  poi: CityPoiViewModel,
  vitalityBand: CityVitalityBand,
  activeRumor: CityRumorViewModel | null,
  petVisitedParkToday: boolean,
): string => {
  const trustBand = getNpcTrustBand(poi.npcTrust);

  if (trustBand === 'wary') {
    return `${poi.npcName}: «Ainda estou te conhecendo… mostre consistência nos estudos.»`;
  }

  if (trustBand === 'ally') {
    return `${poi.npcName}: «Você é ${getNpcTrustLabel(trustBand).toLowerCase()} da casa — conte comigo sempre!»`;
  }

  if (poi.poiKey === 'city_park' && petVisitedParkToday) {
    return 'Sam: «Seu pet deixou pegadas felizes na grama hoje!»';
  }

  if (activeRumor?.npcHint && poi.districtKey === 'centro') {
    return activeRumor.npcHint;
  }

  if (vitalityBand === 'high') {
    return `${poi.npcName}: «A cidade está no melhor ritmo — obrigado por estudar!»`;
  }

  if (vitalityBand === 'low') {
    return `${poi.npcName}: «Sentimos sua falta nos últimos dias… volte a estudar!»`;
  }

  return CITY_UI.npcFlavorDefault(poi.npcName);
};
