import { useRouter, type Href } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { Card } from '@/components';
import { PressableScale } from '@/components/ui/game';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { routes } from '@/constants';
import type { PetSpeciesDefinition } from '@/features/game-design/catalogs/pet-species-catalog';
import { MenuHubSearchField } from '@/features/menu-hub/components/MenuHubSearchField';
import type { PetRarityValue } from '@/types/pet';
import { cn } from '@/utils';

import { PET_HYBRID_BY_KEY } from '../catalogs/pet-hybrid-species';
import { ALL_PET_SPECIES, getSpeciesDefinition } from '../catalogs/pet-species-resolver';
import {
    PET_ENCYCLOPEDIA_UI,
    PET_RARITY_CHIP_STYLES,
    PET_RARITY_LABELS,
} from '../constants/pet-encyclopedia-ui';
import { PET_FARM_UI } from '../constants/pet-farm-ui';
import { toOutcomeDisplays } from '../utils/breeding-chance-display';
import { getBreedingPairMeta } from '../utils/breeding-encyclopedia';
import { PetEncyclopediaSpeciesCarousel } from './PetEncyclopediaSpeciesCarousel';
import {
    PetFarmCardHeader,
    PetFarmPrimaryCta,
    PetFarmSectionHint
} from './PetFarmUiKit';
import { PetSpeciesIcon } from './PetSpeciesIcon';

type ParentTab = 'mother' | 'father';

const filterSpecies = (list: PetSpeciesDefinition[], query: string) => {
  const q = query.trim().toLowerCase();
  if (!q) return list;
  return list.filter(
    (s) => s.name.toLowerCase().includes(q) || s.key.toLowerCase().includes(q),
  );
};

const ensureKeyInList = (key: string, list: PetSpeciesDefinition[], fallback: string) => {
  if (list.some((s) => s.key === key)) return key;
  return list[0]?.key ?? fallback;
};

export const PetBreedingEncyclopediaScreenContent = () => {
  const router = useRouter();
  const speciesList = useMemo(() => ALL_PET_SPECIES, []);
  const [search, setSearch] = useState('');
  const [parentTab, setParentTab] = useState<ParentTab>('mother');
  const [motherKey, setMotherKey] = useState(speciesList[0]?.key ?? 'codeowl');
  const [fatherKey, setFatherKey] = useState(speciesList[1]?.key ?? 'debugduck');

  const filtered = useMemo(() => filterSpecies(speciesList, search), [speciesList, search]);

  useEffect(() => {
    setMotherKey((k) => ensureKeyInList(k, filtered, k));
    setFatherKey((k) => ensureKeyInList(k, filtered, k));
  }, [filtered]);

  const mother = getSpeciesDefinition(motherKey);
  const father = getSpeciesDefinition(fatherKey);
  const meta = useMemo(() => getBreedingPairMeta(motherKey, fatherKey), [motherKey, fatherKey]);
  const outcomes = useMemo(() => toOutcomeDisplays(meta.outcomes), [meta.outcomes]);

  const handleSwap = () => {
    setMotherKey(fatherKey);
    setFatherKey(motherKey);
  };

  const activeKey = parentTab === 'mother' ? motherKey : fatherKey;
  const setActiveKey = parentTab === 'mother' ? setMotherKey : setFatherKey;

  return (
    <View className="gap-4 pb-6">
      <Card className="gap-4 border-primary/20 bg-primary/5">
        <View className="flex-row items-center justify-between">
          <Text className="text-xs font-bold uppercase tracking-widest text-primary">
            {PET_ENCYCLOPEDIA_UI.pairTitle}
          </Text>
          <PressableScale
            onPress={handleSwap}
            className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1"
            accessibilityRole="button"
            accessibilityLabel={PET_ENCYCLOPEDIA_UI.swapParents}>
            <Text className="text-[10px] font-bold text-primary">⇄ {PET_ENCYCLOPEDIA_UI.swapShort}</Text>
          </PressableScale>
        </View>

        <View className="flex-row items-center justify-center gap-2">
          <HeroParentCard speciesKey={motherKey} role="mother" />
          <View className="items-center px-1">
            <View className="h-10 w-10 items-center justify-center rounded-full border-2 border-border bg-surface">
              <Text className="text-lg font-black text-muted">×</Text>
            </View>
            <Text className="mt-1 text-[9px] font-bold text-muted">Cruzamento</Text>
          </View>
          <HeroParentCard speciesKey={fatherKey} role="father" />
        </View>

        <Text className="text-center text-sm font-bold text-foreground">
          {PET_ENCYCLOPEDIA_UI.pairLabel(mother.name, father.name)}
        </Text>
      </Card>

      <MenuHubSearchField
        value={search}
        onChangeText={setSearch}
        label={PET_ENCYCLOPEDIA_UI.searchLabel}
        placeholder={PET_ENCYCLOPEDIA_UI.searchPlaceholder}
      />

      <Card className="gap-3">
        <View className="flex-row rounded-xl border border-border bg-surface p-1">
          <ParentTabButton
            active={parentTab === 'mother'}
            label={PET_ENCYCLOPEDIA_UI.mother}
            onPress={() => setParentTab('mother')}
          />
          <ParentTabButton
            active={parentTab === 'father'}
            label={PET_ENCYCLOPEDIA_UI.father}
            onPress={() => setParentTab('father')}
          />
        </View>
        <PetFarmSectionHint>{PET_ENCYCLOPEDIA_UI.carouselHint}</PetFarmSectionHint>
        <PetEncyclopediaSpeciesCarousel
          species={filtered}
          selectedKey={activeKey}
          onSelect={setActiveKey}
          emptyLabel={PET_ENCYCLOPEDIA_UI.emptySearch}
        />
      </Card>

      <Card className="gap-3">
        <View className="flex-row items-center justify-between gap-2">
          <PetFarmCardHeader emoji="🧬" title={PET_FARM_UI.outcomes} />
          <RecipeBadge explicit={meta.hasExplicitRecipe} sameSpecies={meta.isSameSpecies} />
        </View>

        {meta.isSameSpecies ? (
          <Text className="text-xs text-muted">{PET_ENCYCLOPEDIA_UI.sameSpecies}</Text>
        ) : null}

        {meta.hybridName && !meta.isSameSpecies ? (
          <View className="rounded-xl border border-amber-500/35 bg-amber-950/25 px-3 py-2">
            <Text className="text-xs font-bold text-amber-200">
              ✨ {PET_ENCYCLOPEDIA_UI.hybridHint(meta.hybridName)}
            </Text>
          </View>
        ) : null}

        {outcomes.length === 0 ? (
          <Text className="text-xs text-muted">{PET_ENCYCLOPEDIA_UI.noOutcomes}</Text>
        ) : (
          <View className="gap-2">
            {outcomes.map((o, index) => (
              <OutcomeRow
                key={`${motherKey}-${fatherKey}-${o.speciesKey}-${index}`}
                speciesKey={o.speciesKey}
                percent={o.percent}
                isHybrid={Boolean(PET_HYBRID_BY_KEY[o.speciesKey])}
                isTop={index === 0}
              />
            ))}
          </View>
        )}
      </Card>

      <PetFarmPrimaryCta
        label={PET_ENCYCLOPEDIA_UI.goBreeding}
        onPress={() => router.push(routes.petFarmBreeding as Href)}
        accessibilityLabel={PET_ENCYCLOPEDIA_UI.goBreeding}
      />
    </View>
  );
};

const ParentTabButton = ({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) => (
  <PressableScale
    onPress={onPress}
    className={`flex-1 items-center rounded-lg py-2.5 ${
      active ? 'bg-primary/15' : 'bg-transparent'
    }`}
    accessibilityRole="button"
    accessibilityState={{ selected: active }}>
    <Text className={`text-xs font-bold ${active ? 'text-primary' : 'text-muted'}`}>{label}</Text>
  </PressableScale>
);

const HeroParentCard = ({
  speciesKey,
  role,
}: {
  speciesKey: string;
  role: 'mother' | 'father';
}) => {
  const species = getSpeciesDefinition(speciesKey);
  const styles = PET_RARITY_CHIP_STYLES[species.rarity];

  return (
    <View className={cn('flex-1 items-center rounded-2xl border-2 px-2 py-3 bg-surface', styles.border)}>
      <Text className="text-[10px] font-bold text-muted">{role === 'mother' ? '♀ Mãe' : '♂ Pai'}</Text>
      <PetSpeciesIcon speciesKey={speciesKey} size={48} />
      <Text className="mt-2 text-center text-xs font-bold text-foreground" numberOfLines={2}>
        {species.name}
      </Text>
      <Text className={cn('text-[9px] capitalize', styles.text)}>
        {PET_RARITY_LABELS[species.rarity as PetRarityValue]}
      </Text>
    </View>
  );
};

const RecipeBadge = ({
  explicit,
  sameSpecies,
}: {
  explicit: boolean;
  sameSpecies: boolean;
}) => {
  if (sameSpecies) return null;

  return (
    <View
      className={`rounded-full px-2 py-0.5 ${explicit ? 'bg-emerald-500/20' : 'bg-muted/30'}`}>
      <Text
        className={`text-[9px] font-bold ${explicit ? 'text-emerald-300' : 'text-muted'}`}>
        {explicit ? PET_ENCYCLOPEDIA_UI.recipeKnown : PET_ENCYCLOPEDIA_UI.recipeFallback}
      </Text>
    </View>
  );
};

const OutcomeRow = ({
  speciesKey,
  percent,
  isHybrid,
  isTop,
}: {
  speciesKey: string;
  percent: number;
  isHybrid: boolean;
  isTop: boolean;
}) => {
  const species = getSpeciesDefinition(speciesKey);
  const rarityStyle = PET_RARITY_CHIP_STYLES[species.rarity];

  return (
    <View
      className={`gap-2 rounded-xl border px-3 py-2.5 ${
        isTop ? 'border-primary/40 bg-primary/10' : 'border-border bg-surface'
      }`}>
      <View className="flex-row items-center gap-2">
        <PetSpeciesIcon speciesKey={speciesKey} size={30} />
        <View className="flex-1">
          <View className="flex-row flex-wrap items-center gap-1">
            <Text className="text-sm font-bold text-foreground">{species.name}</Text>
            {isHybrid ? (
              <View className="rounded bg-amber-500/25 px-1.5 py-0.5">
                <Text className="text-[8px] font-bold text-amber-200">Híbrido</Text>
              </View>
            ) : null}
            {isTop ? (
              <View className="rounded bg-primary/20 px-1.5 py-0.5">
                <Text className="text-[8px] font-bold text-primary">Mais provável</Text>
              </View>
            ) : null}
          </View>
          <Text className={cn('text-[10px] capitalize', rarityStyle.text)}>
            {PET_RARITY_LABELS[species.rarity as PetRarityValue]} ·{' '}
            {PET_ENCYCLOPEDIA_UI.hatchHours(species.hatchHours)}
          </Text>
        </View>
        <Text className="text-lg font-black text-primary">{percent}%</Text>
      </View>
      <ProgressBar
        value={percent}
        max={100}
        variant="xp"
        height="sm"
        animated={false}
        accessibilityLabel={`${species.name} ${percent}%`}
      />
    </View>
  );
};
