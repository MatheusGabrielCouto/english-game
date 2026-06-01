import { Text, View } from 'react-native';

import type { CityPoiViewModel } from '@/types/city-map';

import { CITY_UI } from '../constants/city-ui';
import { CityPoiChainSection } from './CityPoiChainSection';
import { CityPoiParkSection } from './CityPoiParkSection';
import { CityPoiSeasonMuseumSection } from './CityPoiSeasonMuseumSection';

type CityPoiDetailOverviewProps = {
  poi: CityPoiViewModel;
  petVisitedParkToday: boolean;
  onChainMissionClaim?: (missionId: string) => Promise<void>;
  isClaimingMission?: (missionId: string) => boolean;
  claimBusy?: boolean;
};

const hasSpecialOverview =
  (poiKey: string) => poiKey === 'city_park' || poiKey === 'season_museum';

export const CityPoiDetailOverview = ({
  poi,
  petVisitedParkToday,
  onChainMissionClaim,
  isClaimingMission,
  claimBusy = false,
}: CityPoiDetailOverviewProps) => (
  <View className="gap-3">
    {onChainMissionClaim ? (
      <CityPoiChainSection
        poiKey={poi.poiKey}
        onClaim={onChainMissionClaim}
        isClaimingMission={isClaimingMission}
        claimBusy={claimBusy}
      />
    ) : null}

    {!hasSpecialOverview(poi.poiKey) ? (
      <View className="rounded-2xl border border-border/80 bg-surface px-4 py-3">
        <Text className="text-sm leading-5 text-foreground-secondary">
          {CITY_UI.poiOverviewDefaultHint}
        </Text>
      </View>
    ) : null}

    {poi.poiKey === 'city_park' ? (
      <CityPoiParkSection petVisitedParkToday={petVisitedParkToday} />
    ) : null}
    {poi.poiKey === 'season_museum' ? <CityPoiSeasonMuseumSection /> : null}
  </View>
);
