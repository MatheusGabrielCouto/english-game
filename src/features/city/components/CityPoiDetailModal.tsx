import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Modal as RNModal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components';
import { theme } from '@/constants';
import { useClaimLoading } from '@/hooks';
import type { CityPoiViewModel } from '@/types/city-map';
import type { CityPoiMission } from '@/types/city-poi-mission';

import { CITY_UI } from '../constants/city-ui';
import { CityMapService } from '../services/city-map-service';
import { CityPoiMissionService } from '../services/city-poi-mission-service';
import { CityPoiProjectService } from '../services/city-poi-project-service';
import { useCityMapStore } from '../store/city-map-store';
import { CityPoiContractsSection } from './CityPoiContractsSection';
import { CityPoiDeliverSection } from './CityPoiDeliverSection';
import { CityPoiDetailHeader } from './CityPoiDetailHeader';
import { CityPoiDetailOverview } from './CityPoiDetailOverview';
import { CityPoiDetailTabs, type CityPoiDetailTab } from './CityPoiDetailTabs';
import { CityPoiEventSection } from './CityPoiEventSection';
import { CityPoiMissionCard } from './CityPoiMissionCard';

type CityPoiDetailModalProps = {
  poi: CityPoiViewModel | null;
  visible: boolean;
  onClose: () => void;
  initialTab?: CityPoiDetailTab;
  hasClaimableMissions?: boolean;
  isContractIssuer?: boolean;
};

const resolveInitialTab = (
  tab: CityPoiDetailTab,
  poiKey: string,
  showEventTab: boolean,
): CityPoiDetailTab => {
  if (tab === 'deliver' && !CityPoiProjectService.supportsDelivery(poiKey)) {
    return 'overview';
  }
  if (tab === 'event' && !showEventTab) {
    return 'overview';
  }
  return tab;
};

export const CityPoiDetailModal = ({
  poi,
  visible,
  onClose,
  initialTab = 'overview',
  hasClaimableMissions = false,
  isContractIssuer = false,
}: CityPoiDetailModalProps) => {
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const sheetMaxHeight = Math.min(windowHeight * 0.88, 640);
  const footerPaddingBottom = Math.max(insets.bottom, 16);

  const districts = useCityMapStore((s) => s.districts);
  const activeRumor = useCityMapStore((s) => s.activeRumor);
  const vitalityBand = useCityMapStore((s) => s.vitalityBand);
  const petVisitedParkToday = useCityMapStore((s) => s.petVisitedParkToday);
  const activeCityEvent = useCityMapStore((s) => s.activeCityEvent);

  const showEventTab = Boolean(
    activeCityEvent?.participatingPoiKeys.includes(poi?.poiKey ?? ''),
  );

  const [activeTab, setActiveTab] = useState<CityPoiDetailTab>(initialTab);
  const [missions, setMissions] = useState<CityPoiMission[]>([]);
  const [loadingMissions, setLoadingMissions] = useState(false);
  const { isClaiming, isBusy, runClaim } = useClaimLoading();

  const districtName = useMemo(() => {
    if (!poi) return null;
    return districts.find((d) => d.districtKey === poi.districtKey)?.name ?? null;
  }, [districts, poi]);

  useEffect(() => {
    if (!visible || !poi) return;
    setActiveTab(resolveInitialTab(initialTab, poi.poiKey, showEventTab));
  }, [visible, initialTab, poi?.poiKey, showEventTab]);

  const loadMissions = useCallback(async () => {
    if (!poi?.poiKey) return;

    setLoadingMissions(true);
    try {
      const list = await CityPoiMissionService.getMissionsForPoi(poi.poiKey);
      setMissions(list);
    } finally {
      setLoadingMissions(false);
    }
  }, [poi?.poiKey]);

  useEffect(() => {
    if (visible && poi?.isUnlocked && activeTab === 'missions') {
      void loadMissions();
    }
  }, [visible, poi?.isUnlocked, poi?.poiKey, activeTab, loadMissions]);

  const handleClaim = useCallback(
    async (missionId: string) => {
      await runClaim(missionId, async () => {
        const result = await CityPoiMissionService.claimMission(missionId);
        if (!result.ok) return false;

        await loadMissions();
        await CityMapService.refresh();
        return true;
      });
    },
    [loadMissions, runClaim],
  );

  if (!poi) return null;

  const tabContent = !poi.isUnlocked ? (
    <View className="rounded-2xl border border-dashed border-warning/40 bg-warning/10 px-4 py-4">
      <Text className="text-sm font-bold text-warning">{CITY_UI.poiLockedTitle}</Text>
      <Text className="mt-2 text-sm leading-5 text-foreground-secondary">
        {poi.specialLockReason ?? CITY_UI.poiLockedBody(poi.requiredPlayerLevel)}
      </Text>
    </View>
  ) : (
    <>
      {activeTab === 'overview' ? (
        <CityPoiDetailOverview
          poi={poi}
          petVisitedParkToday={petVisitedParkToday}
          onChainMissionClaim={handleClaim}
          isClaimingMission={isClaiming}
          claimBusy={isBusy}
        />
      ) : null}

      {activeTab === 'missions' ? (
        <View className="gap-3">
          <View>
            <Text className="text-sm font-bold text-foreground">{CITY_UI.poiMissionsTitle}</Text>
            <Text className="mt-1 text-xs leading-5 text-foreground-secondary">
              {CITY_UI.poiMissionsHint}
            </Text>
          </View>

          {loadingMissions ? (
            <View className="items-center py-8">
              <ActivityIndicator color={theme.colors.primary} />
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
      ) : null}

      {activeTab === 'contracts' ? (
        <CityPoiContractsSection poiKey={poi.poiKey} isUnlocked={poi.isUnlocked} />
      ) : null}

      {activeTab === 'deliver' ? (
        <CityPoiDeliverSection poiKey={poi.poiKey} isUnlocked={poi.isUnlocked} />
      ) : null}

      {activeTab === 'event' && activeCityEvent && showEventTab ? (
        <CityPoiEventSection
          poiKey={poi.poiKey}
          isUnlocked={poi.isUnlocked}
          activeEvent={activeCityEvent}
        />
      ) : null}
    </>
  );

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent>
      <View className="flex-1 justify-end bg-black/65" accessibilityViewIsModal>
        <TouchableOpacity
          className="absolute inset-0"
          activeOpacity={1}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={CITY_UI.poiModalClose}
        />

        <View
          className="rounded-t-3xl border border-border bg-background"
          style={{ maxHeight: sheetMaxHeight }}>
          <View className="items-center pt-2 pb-1">
            <View className="h-1 w-10 rounded-full bg-border" accessibilityElementsHidden />
          </View>

          <View className="flex-row items-center justify-end px-4 pb-1">
            <TouchableOpacity
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={CITY_UI.poiModalClose}
              className="rounded-full border border-border bg-surface px-3 py-1.5">
              <Text className="text-xs font-bold text-foreground-secondary">✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={{ maxHeight: sheetMaxHeight - 120 }}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}>
            <View className="gap-4 px-4">
              <CityPoiDetailHeader
                poi={poi}
                districtName={districtName}
                vitalityBand={vitalityBand}
                activeRumor={activeRumor}
                petVisitedParkToday={petVisitedParkToday}
              />

              {poi.isUnlocked ? (
                <CityPoiDetailTabs
                  poiKey={poi.poiKey}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  hasClaimableMissions={hasClaimableMissions}
                  isContractIssuer={isContractIssuer}
                  showEventTab={showEventTab}
                  eventTabEmoji={activeCityEvent?.emoji}
                  eventTabLabel={activeCityEvent?.tabLabel}
                />
              ) : null}

              {tabContent}
            </View>
          </ScrollView>

          <View
            className="border-t border-border px-4 pt-4"
            style={{ paddingBottom: footerPaddingBottom }}>
            <Button label="Fechar" variant="secondary" onPress={onClose} />
          </View>
        </View>
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 12,
  },
});
