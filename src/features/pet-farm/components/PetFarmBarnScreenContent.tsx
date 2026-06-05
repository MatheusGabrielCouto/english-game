import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, Text, View, type ViewStyle } from 'react-native';

import { Card } from '@/components';
import { routes } from '@/constants';
import { MenuHubSearchField } from '@/features/menu-hub/components/MenuHubSearchField';
import { PetStage } from '@/types/pet';
import { PetFavoriteTag } from '@/types/pet-instance';
import { cn } from '@/utils';

import { PET_BARN_FILTER_UI } from '../constants/pet-hall-ui';
import { PET_BARN_UI } from '../constants/pet-barn-ui';
import { PET_FARM_SCREEN_UI } from '../constants/pet-farm-screen-ui';
import { PET_FARM_UI } from '../constants/pet-farm-ui';
import { usePetFarmLoad } from '../hooks/use-pet-farm-load';
import { PetFarmService } from '../services/pet-farm-service';
import { usePetFarmStore } from '../store/pet-farm-store';
import {
  PetFarmAlertCard,
  PetFarmCapacityBar,
  PetFarmCardHeader,
  PetFarmEmptyState,
  PetFarmFeedback,
  PetFarmSecondaryCta,
  PetFarmSectionHint,
} from './PetFarmUiKit';
import { PetInstanceChip } from './PetInstanceChip';

type BarnFilterKey =
  | 'all'
  | 'star'
  | 'heart'
  | 'crown'
  | 'gen5'
  | 'breed'
  | 'adventure';

const FILTERS: { key: BarnFilterKey; label: string }[] = [
  { key: 'all', label: PET_BARN_FILTER_UI.all },
  { key: 'star', label: PET_BARN_FILTER_UI.favorites },
  { key: 'heart', label: PET_BARN_FILTER_UI.hearts },
  { key: 'crown', label: PET_BARN_FILTER_UI.crowns },
  { key: 'gen5', label: PET_BARN_FILTER_UI.highGen },
  { key: 'breed', label: PET_BARN_FILTER_UI.breedReady },
  { key: 'adventure', label: PET_BARN_FILTER_UI.onAdventure },
];

const FILTER_SELECTED: ViewStyle = { backgroundColor: 'rgba(139, 92, 246, 0.14)' };

export const PetFarmBarnScreenContent = () => {
  const router = useRouter();
  const { assignSlot } = useLocalSearchParams<{ assignSlot?: string }>();
  const slotIndex = assignSlot !== undefined ? Number(assignSlot) : null;
  const validSlot =
    slotIndex !== null && Number.isInteger(slotIndex) && slotIndex >= 0 ? slotIndex : null;

  const instances = usePetFarmStore((s) => s.instances);
  const adventures = usePetFarmStore((s) => s.adventures);
  const fields = usePetFarmStore((s) => s.fields);
  const { load } = usePetFarmLoad();
  const [barnQuery, setBarnQuery] = useState('');
  const [filter, setFilter] = useState<BarnFilterKey>('all');
  const [message, setMessage] = useState('');

  const adventureIds = useMemo(
    () => new Set(adventures.map((a) => a.instanceId)),
    [adventures],
  );

  const barnList = useMemo(() => {
    const q = barnQuery.trim().toLowerCase();
    let list = instances.filter((i) => i.stage !== PetStage.EGG);
    if (validSlot !== null) {
      list = list.filter((i) => i.passiveFieldSlot === null);
    }

    switch (filter) {
      case 'star':
        list = list.filter((i) => i.favoriteTag === PetFavoriteTag.STAR);
        break;
      case 'heart':
        list = list.filter((i) => i.favoriteTag === PetFavoriteTag.HEART);
        break;
      case 'crown':
        list = list.filter((i) => i.favoriteTag === PetFavoriteTag.CROWN);
        break;
      case 'gen5':
        list = list.filter((i) => i.generation >= 5);
        break;
      case 'breed':
        list = list.filter(
          (i) =>
            i.breedingPenSlot === null &&
            i.passiveFieldSlot === null &&
            !adventureIds.has(i.id) &&
            (!i.breedingCooldownUntil ||
              new Date(i.breedingCooldownUntil).getTime() <= Date.now()),
        );
        break;
      case 'adventure':
        list = list.filter((i) => adventureIds.has(i.id));
        break;
      default:
        break;
    }

    if (!q) return list;
    return list.filter(
      (i) =>
        i.nickname.toLowerCase().includes(q) ||
        i.speciesKey.toLowerCase().includes(q),
    );
  }, [instances, validSlot, barnQuery, filter, adventureIds]);

  const openDetail = (instanceId: number) => {
    router.push(`${routes.petFarmInstance}/${instanceId}` as Href);
  };

  const handleAssign = async (instanceId: number) => {
    if (validSlot === null) return;
    const result = await PetFarmService.assignToPassiveSlot(instanceId, validSlot);
    setMessage(result.message);
    if (result.ok) {
      router.replace(routes.petFarmPasture as Href);
    }
    await load();
  };

  return (
    <View className="gap-4 pb-6">
      {validSlot !== null ? (
        <PetFarmAlertCard
          title={PET_BARN_UI.assignBanner(validSlot)}
          subtitle={PET_BARN_UI.assignHint}
        />
      ) : null}

      <Card className="gap-3">
        <PetFarmCardHeader emoji="🏠" title={PET_FARM_UI.barn} />
        <PetFarmCapacityBar
          label="Capacidade do celeiro"
          used={instances.length}
          max={fields.barn_storage}
        />
        <MenuHubSearchField
          value={barnQuery}
          onChangeText={setBarnQuery}
          label={PET_BARN_UI.searchLabel}
          placeholder={PET_BARN_UI.searchPlaceholder}
        />

        {validSlot === null ? (
          <View className="flex-row flex-wrap gap-2">
            {FILTERS.map((item) => {
              const active = filter === item.key;
              return (
                <Pressable
                  key={item.key}
                  onPress={() => setFilter(item.key)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  className={cn(
                    'rounded-full border border-border px-2.5 py-1.5',
                    active && 'border-primary',
                  )}
                  style={active ? FILTER_SELECTED : undefined}>
                  <Text
                    className={cn(
                      'text-[10px] font-bold',
                      active ? 'text-primary' : 'text-muted',
                    )}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        <PetFarmSectionHint>
          {validSlot !== null ? PET_FARM_SCREEN_UI.tapToAssign : PET_FARM_SCREEN_UI.tapToOpen}
        </PetFarmSectionHint>
        {barnList.length === 0 ? (
          <PetFarmEmptyState
            emoji={validSlot !== null ? '🌿' : '🏠'}
            title={validSlot !== null ? PET_BARN_UI.emptyAssign : PET_BARN_UI.empty}
            subtitle={
              validSlot !== null
                ? PET_FARM_SCREEN_UI.emptyBarnAssign
                : PET_FARM_SCREEN_UI.emptyBarn
            }
          />
        ) : (
          <View className="flex-row flex-wrap gap-2.5">
            {barnList.map((instance) => (
              <PetInstanceChip
                key={instance.id}
                instance={instance}
                compact
                selected={validSlot !== null || instance.isActive}
                onPress={() => {
                  if (validSlot !== null) void handleAssign(instance.id);
                  else openDetail(instance.id);
                }}
              />
            ))}
          </View>
        )}
      </Card>

      {validSlot !== null ? (
        <PetFarmSecondaryCta
          label={PET_BARN_UI.goPasture}
          onPress={() => router.replace(routes.petFarmPasture as Href)}
        />
      ) : null}

      {message ? <PetFarmFeedback message={message} /> : null}
    </View>
  );
};
