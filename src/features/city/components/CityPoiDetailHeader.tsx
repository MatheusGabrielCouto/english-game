import { Text, View } from 'react-native';

import { ProgressBar } from '@/components';
import { GameCard } from '@/components/ui/game';
import type { CityPoiViewModel, CityRumorViewModel, CityVitalityBand } from '@/types/city-map';

import { CITY_UI } from '../constants/city-ui';
import { getNpcFlavorLine } from '../utils/get-npc-flavor-line';
import { CityPoiTrustBadge } from './CityPoiTrustBadge';

type CityPoiDetailHeaderProps = {
  poi: CityPoiViewModel;
  districtName: string | null;
  vitalityBand: CityVitalityBand;
  activeRumor: CityRumorViewModel | null;
  petVisitedParkToday: boolean;
};

export const CityPoiDetailHeader = ({
  poi,
  districtName,
  vitalityBand,
  activeRumor,
  petVisitedParkToday,
}: CityPoiDetailHeaderProps) => {
  const npcFlavor = getNpcFlavorLine(poi, vitalityBand, activeRumor, petVisitedParkToday);

  return (
    <View className="gap-3">
      <GameCard variant="hero" glow className="overflow-hidden p-0">
        <View className="flex-row items-start gap-3 p-4">
          <View className="h-16 w-16 items-center justify-center rounded-2xl border border-primary/30 bg-primary/15">
            <Text className="text-4xl">{poi.icon}</Text>
          </View>
          <View className="min-w-0 flex-1">
            <Text className="text-xl font-black text-foreground" accessibilityRole="header">
              {poi.name}
            </Text>
            <Text className="mt-1 text-sm leading-5 text-foreground-secondary" numberOfLines={3}>
              {poi.description}
            </Text>
            <View className="mt-2 flex-row flex-wrap gap-2">
              {districtName ? (
                <View className="rounded-full border border-border bg-surface px-2.5 py-1">
                  <Text className="text-[10px] font-bold uppercase tracking-wide text-muted">
                    {CITY_UI.poiModalDistrict(districtName)}
                  </Text>
                </View>
              ) : null}
              <View className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1">
                <Text className="text-[10px] font-bold text-primary">
                  {CITY_UI.poiCategoryLabel(poi.category)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View className="border-t border-border/60 px-4 py-3">
          <View className="flex-row items-center justify-between gap-2">
            <Text className="text-xs font-bold uppercase tracking-widest text-muted">
              {CITY_UI.poiModalLevelLabel}
            </Text>
            <Text className="text-sm font-black text-primary">
              {CITY_UI.poiLevelStars(poi.localLevel, poi.maxLocalLevel)}
            </Text>
          </View>
          <View className="mt-2">
            <ProgressBar
              value={poi.localXpProgressPercent}
              max={100}
              variant="xp"
              height="sm"
              showLabel={false}
            />
          </View>
          <Text className="mt-1.5 text-[10px] text-foreground-secondary">
            {poi.localLevel >= poi.maxLocalLevel
              ? CITY_UI.poiMaxLevel
              : CITY_UI.poiXpProgress(poi.localXp, poi.localXpProgressPercent)}
          </Text>
        </View>
      </GameCard>

      <CityPoiTrustBadge npcTrust={poi.npcTrust} />

      <View className="flex-row items-start gap-3 rounded-2xl border border-border bg-surface-elevated px-4 py-3">
        <Text className="text-3xl">{poi.npcEmoji}</Text>
        <View className="min-w-0 flex-1">
          <Text className="text-[10px] font-bold uppercase tracking-wide text-muted">
            {CITY_UI.poiModalNpcQuote}
          </Text>
          <Text className="mt-0.5 text-sm font-semibold text-foreground">{poi.npcName}</Text>
          <Text className="mt-2 text-sm italic leading-5 text-foreground-secondary">{npcFlavor}</Text>
        </View>
      </View>
    </View>
  );
};
