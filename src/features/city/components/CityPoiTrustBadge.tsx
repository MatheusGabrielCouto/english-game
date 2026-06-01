import { Text, View } from 'react-native';

import { ProgressBar } from '@/components';
import { getNpcTrustBand, getNpcTrustLabel } from '@/features/city/constants/npc-trust-config';
import { NPC_TRUST_MAX } from '@/types/city-npc-trust';

type CityPoiTrustBadgeProps = {
  npcTrust: number;
};

export const CityPoiTrustBadge = ({ npcTrust }: CityPoiTrustBadgeProps) => {
  const band = getNpcTrustBand(npcTrust);
  const label = getNpcTrustLabel(band);

  return (
    <View className="rounded-2xl border border-border/80 bg-surface px-4 py-3">
      <View className="flex-row items-center justify-between gap-2">
        <Text className="text-[10px] font-bold uppercase tracking-widest text-muted">
          Confiança do NPC
        </Text>
        <Text className="text-xs font-black text-primary">
          {label} · {npcTrust}/{NPC_TRUST_MAX}
        </Text>
      </View>
      <View className="mt-2">
        <ProgressBar value={npcTrust} max={NPC_TRUST_MAX} variant="xp" height="sm" showLabel={false} />
      </View>
    </View>
  );
};
