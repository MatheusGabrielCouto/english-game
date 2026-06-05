import { useState } from 'react';
import { Text, View } from 'react-native';

import { Card } from '@/components';
import { PressableScale } from '@/components/ui/game';
import type { PetInstance } from '@/types/pet-instance';

import { getSpeciesDefinition } from '../catalogs/pet-species-resolver';
import { PET_INSTANCE_HUB_UI } from '../constants/pet-instance-hub-ui';
import { PET_TIMELINE_UI } from '../constants/pet-timeline-ui';
import { PetStatsService } from '../services/pet-stats-service';
import { PetInstanceBreedHistoryTab } from './PetInstanceBreedHistoryTab';
import { PetInstanceCosmeticsTab } from './PetInstanceCosmeticsTab';
import { PetInstanceTimelineScreenContent } from './PetInstanceTimelineScreenContent';
import { PetLineageSummaryCard } from './PetLineageSummaryCard';
import { PetStatBars } from './PetStatBars';
import { PetTraitChips } from './PetTraitChips';

type HubTab = 'overview' | 'memories' | 'breeding' | 'achievements' | 'equip';

const TABS: { key: HubTab; label: string }[] = [
  { key: 'overview', label: PET_INSTANCE_HUB_UI.tabOverview },
  { key: 'memories', label: PET_INSTANCE_HUB_UI.tabMemories },
  { key: 'breeding', label: PET_INSTANCE_HUB_UI.tabBreeding },
  { key: 'achievements', label: PET_INSTANCE_HUB_UI.tabAchievements },
  { key: 'equip', label: PET_INSTANCE_HUB_UI.tabEquip },
];

type PetInstanceHubTabsProps = {
  instance: PetInstance;
  onRerolled: () => void;
  onMessage: (message: string) => void;
};

export const PetInstanceHubTabs = ({ instance, onRerolled, onMessage }: PetInstanceHubTabsProps) => {
  const [tab, setTab] = useState<HubTab>('overview');
  const species = getSpeciesDefinition(instance.speciesKey);
  const passiveLabel = PetStatsService.formatPassiveLabel(instance.speciesKey, instance.stats);

  return (
    <View className="gap-3">
      <ScrollTabs active={tab} onChange={setTab} />

      {tab === 'overview' ? (
        <>
          <Card className="gap-2">
            <Text className="text-sm font-bold text-foreground">Passivo</Text>
            <Text className="text-lg font-black text-accent">{passiveLabel}</Text>
            <Text className="text-xs text-muted">{species.passive.label} (base da espécie)</Text>
          </Card>
          <Card className="gap-2">
            <Text className="text-sm font-bold text-foreground">Atributos</Text>
            <PetStatBars stats={instance.stats} />
          </Card>
          <Card>
            <PetTraitChips instance={instance} onRerolled={onRerolled} />
          </Card>
          <PetLineageSummaryCard instance={instance} />
        </>
      ) : null}

      {tab === 'memories' ? (
        <Card className="gap-2">
          <Text className="text-sm font-bold text-foreground">{PET_TIMELINE_UI.title}</Text>
          <PetInstanceTimelineScreenContent instanceId={instance.id} />
        </Card>
      ) : null}

      {tab === 'breeding' ? <PetInstanceBreedHistoryTab instanceId={instance.id} /> : null}

      {tab === 'achievements' ? (
        <Card className="py-6">
          <Text className="text-center text-xs text-muted">{PET_INSTANCE_HUB_UI.achievementsSoon}</Text>
        </Card>
      ) : null}

      {tab === 'equip' ? (
        <Card className="gap-2">
          <PetInstanceCosmeticsTab instance={instance} onChanged={onMessage} />
        </Card>
      ) : null}
    </View>
  );
};

const ScrollTabs = ({
  active,
  onChange,
}: {
  active: HubTab;
  onChange: (tab: HubTab) => void;
}) => (
  <View className="flex-row flex-wrap gap-2">
    {TABS.map((item) => (
      <PressableScale
        key={item.key}
        onPress={() => onChange(item.key)}
        className={`rounded-full border px-3 py-1.5 ${
          active === item.key ? 'border-primary bg-primary/15' : 'border-border bg-surface'
        }`}
        accessibilityRole="tab"
        accessibilityState={{ selected: active === item.key }}>
        <Text
          className={`text-[11px] font-bold ${
            active === item.key ? 'text-primary' : 'text-muted'
          }`}>
          {item.label}
        </Text>
      </PressableScale>
    ))}
  </View>
);
