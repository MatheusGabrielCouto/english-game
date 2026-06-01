import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { theme } from '@/constants';

import { CityEventService } from '../services/city-event-service';
import { useCityMap } from '../hooks/use-city-map';
import { CityEventBanner } from './CityEventBanner';
import { CityEventIntroModal } from './CityEventIntroModal';
import { CityMapView } from './CityMapView';
import { CityPoiDetailModal } from './CityPoiDetailModal';
import type { CityPoiDetailTab } from './CityPoiDetailTabs';
import { CityRumorBanner } from './CityRumorBanner';

type CityMapTabContentProps = {
  poiDetailInitialTab?: CityPoiDetailTab;
};

export const CityMapTabContent = ({ poiDetailInitialTab }: CityMapTabContentProps) => {
  const {
    districts,
    pois,
    summary,
    claimablePoiKeys,
    activeContractIssuerPoiKey,
    resourceBalances,
    activeRumor,
    vitalityBand,
    petVisitedParkToday,
    activeCityEvent,
    selectedPoi,
    selectedPoiKey,
    isLoading,
    setSelectedPoiKey,
    visitPoi,
  } = useCityMap();

  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    if (!activeCityEvent || activeCityEvent.introSeen) {
      setShowIntro(false);
      return;
    }
    setShowIntro(true);
  }, [activeCityEvent?.eventKey, activeCityEvent?.introSeen]);

  const handleIntroClose = () => {
    if (activeCityEvent) {
      void CityEventService.markIntroSeen(activeCityEvent.eventKey);
    }
    setShowIntro(false);
  };

  if (isLoading || !summary) {
    return (
      <View className="items-center justify-center py-16">
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text className="mt-3 text-sm text-foreground-secondary">Carregando mapa...</Text>
      </View>
    );
  }

  const handlePoiPress = (poiKey: string) => {
    const poi = pois.find((p) => p.poiKey === poiKey);
    if (!poi?.isUnlocked) return;

    void visitPoi(poiKey);
    setSelectedPoiKey(poiKey);
  };

  return (
    <>
      {activeCityEvent ? <CityEventBanner event={activeCityEvent} /> : null}
      <CityRumorBanner rumor={activeRumor} vitalityBand={vitalityBand} />
      <CityMapView
        summary={summary}
        districts={districts}
        pois={pois}
        claimablePoiKeys={claimablePoiKeys}
        activeContractIssuerPoiKey={activeContractIssuerPoiKey}
        resourceBalances={resourceBalances}
        petVisitedParkToday={petVisitedParkToday}
        activeCityEvent={activeCityEvent}
        onPoiPress={handlePoiPress}
      />
      <CityPoiDetailModal
        poi={selectedPoi}
        visible={selectedPoiKey !== null}
        onClose={() => setSelectedPoiKey(null)}
        initialTab={poiDetailInitialTab}
        hasClaimableMissions={
          selectedPoi ? claimablePoiKeys.includes(selectedPoi.poiKey) : false
        }
        isContractIssuer={
          selectedPoi ? activeContractIssuerPoiKey === selectedPoi.poiKey : false
        }
      />
      {activeCityEvent ? (
        <CityEventIntroModal
          event={activeCityEvent}
          visible={showIntro}
          onClose={handleIntroClose}
        />
      ) : null}
    </>
  );
};
