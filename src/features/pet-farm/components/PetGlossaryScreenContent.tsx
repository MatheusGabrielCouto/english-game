import { useRouter, type Href } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { SectionList, Text, View } from 'react-native';

import { Card } from '@/components';
import { PressableScale } from '@/components/ui/game';
import { routes } from '@/constants';
import type { PetSpeciesDefinition } from '@/features/game-design/catalogs/pet-species-catalog';
import { MenuHubSearchField } from '@/features/menu-hub/components/MenuHubSearchField';
import { getDb } from '@/storage/database/client';
import { petCollection } from '@/storage/database/schema';
import type { PetRarityValue } from '@/types/pet';

import { ALL_PET_SPECIES } from '../catalogs/pet-species-resolver';
import { isHybridSpecies } from '../utils/pet-glossary';
import {
  PET_RARITY_CHIP_STYLES,
  PET_RARITY_LABELS,
} from '../constants/pet-encyclopedia-ui';
import {
  PET_GLOSSARY_FILTERS,
  PET_GLOSSARY_UI,
  type PetGlossaryFilter,
} from '../constants/pet-glossary-ui';
import {
  countByRarity,
  filterGlossarySpecies,
  formatSpeciesStatLine,
  groupGlossarySections,
} from '../utils/pet-glossary';
import { PetSpeciesIcon } from './PetSpeciesIcon';

export const PetGlossaryScreenContent = () => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<PetGlossaryFilter>('all');
  const [discoveredKeys, setDiscoveredKeys] = useState<Set<string>>(new Set());

  const loadDiscovered = useCallback(async () => {
    const db = getDb();
    const rows = await db.select({ speciesKey: petCollection.speciesKey }).from(petCollection);
    setDiscoveredKeys(new Set(rows.map((r) => r.speciesKey)));
  }, []);

  useEffect(() => {
    void loadDiscovered();
  }, [loadDiscovered]);

  const filtered = useMemo(
    () => filterGlossarySpecies(ALL_PET_SPECIES, query, filter),
    [query, filter],
  );

  const sections = useMemo(() => groupGlossarySections(filtered, filter), [filtered, filter]);
  const totals = useMemo(() => countByRarity(ALL_PET_SPECIES), []);

  return (
    <View className="gap-4 pb-6">
      <Text className="text-xs leading-relaxed text-muted">{PET_GLOSSARY_UI.subtitle}</Text>

      <Card className="flex-row flex-wrap gap-2 border-border/80 bg-surface-elevated py-3">
        <SummaryPill label="Total" value={String(totals.total)} />
        <SummaryPill label="Híbridos" value={String(totals.hybrids)} tone="amber" />
        <SummaryPill label="Lend." value={String(totals.legendary)} tone="amber" />
        <SummaryPill label="Épic." value={String(totals.epic)} tone="violet" />
        <SummaryPill label="Raros" value={String(totals.rare)} tone="sky" />
        <SummaryPill label="Com." value={String(totals.common)} />
      </Card>

      <MenuHubSearchField
        value={query}
        onChangeText={setQuery}
        label={PET_GLOSSARY_UI.searchLabel}
        placeholder={PET_GLOSSARY_UI.searchPlaceholder}
      />

      <View className="flex-row flex-wrap gap-2">
        {PET_GLOSSARY_FILTERS.map((item) => (
          <PressableScale
            key={item.key}
            onPress={() => setFilter(item.key)}
            className={`rounded-full border px-3 py-1.5 ${
              filter === item.key ? 'border-primary bg-primary/15' : 'border-border bg-surface'
            }`}
            accessibilityRole="button"
            accessibilityState={{ selected: filter === item.key }}>
            <Text
              className={`text-[11px] font-bold ${
                filter === item.key ? 'text-primary' : 'text-muted'
              }`}>
              {item.label}
            </Text>
          </PressableScale>
        ))}
      </View>

      <Text className="text-center text-[10px] text-muted">
        {PET_GLOSSARY_UI.count(filtered.length, ALL_PET_SPECIES.length)}
      </Text>

      {filtered.length === 0 ? (
        <Card className="py-8">
          <Text className="text-center text-sm text-muted">{PET_GLOSSARY_UI.emptySearch}</Text>
        </Card>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.key}
          scrollEnabled={false}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section: { title } }) => (
            <Text className="mb-2 mt-1 text-xs font-bold uppercase tracking-widest text-primary">
              {title}
            </Text>
          )}
          renderItem={({ item }) => (
            <View className="mb-2">
              <GlossarySpeciesCard
                species={item}
                discovered={discoveredKeys.has(item.key)}
              />
            </View>
          )}
          ItemSeparatorComponent={() => <View className="h-0" />}
          SectionSeparatorComponent={() => <View className="h-2" />}
        />
      )}

      <PressableScale
        onPress={() => router.push(routes.petFarmEncyclopedia as Href)}
        className="items-center rounded-xl border border-primary/40 bg-primary/10 py-3"
        accessibilityRole="button">
        <Text className="text-sm font-bold text-primary">{PET_GLOSSARY_UI.goEncyclopedia}</Text>
      </PressableScale>
    </View>
  );
};

const SummaryPill = ({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: 'amber' | 'violet' | 'sky';
}) => {
  const toneClass =
    tone === 'amber'
      ? 'border-amber-500/30 bg-amber-950/20'
      : tone === 'violet'
        ? 'border-violet-500/30 bg-violet-950/20'
        : tone === 'sky'
          ? 'border-sky-500/30 bg-sky-950/20'
          : 'border-border bg-surface';

  return (
    <View className={`rounded-lg border px-2.5 py-1.5 ${toneClass}`}>
      <Text className="text-[9px] text-muted">{label}</Text>
      <Text className="text-sm font-black text-foreground">{value}</Text>
    </View>
  );
};

const GlossarySpeciesCard = ({
  species,
  discovered,
}: {
  species: PetSpeciesDefinition;
  discovered: boolean;
}) => {
  const styles = PET_RARITY_CHIP_STYLES[species.rarity];
  const hybrid = isHybridSpecies(species.key);
  const statLine = formatSpeciesStatLine(species);

  return (
    <Card className={`gap-3 border-2 ${styles.border} ${discovered ? '' : 'opacity-90'}`}>
      <View className="flex-row items-start gap-3">
        <View className="rounded-2xl bg-surface-elevated p-2">
          <PetSpeciesIcon speciesKey={species.key} size={44} />
        </View>
        <View className="flex-1 gap-1">
          <View className="flex-row flex-wrap items-center gap-1.5">
            <Text className="text-base font-black text-foreground">{species.name}</Text>
            {hybrid ? (
              <View className="rounded bg-amber-500/25 px-1.5 py-0.5">
                <Text className="text-[8px] font-bold text-amber-200">Híbrido</Text>
              </View>
            ) : null}
          </View>
          <Text className={`text-xs font-bold capitalize ${styles.text}`}>
            {PET_RARITY_LABELS[species.rarity as PetRarityValue]}
          </Text>
          <View
            className={`self-start rounded-full px-2 py-0.5 ${
              discovered ? 'bg-emerald-500/20' : 'bg-muted/25'
            }`}>
            <Text
              className={`text-[9px] font-bold ${
                discovered ? 'text-emerald-300' : 'text-muted'
              }`}>
              {discovered ? PET_GLOSSARY_UI.discovered : PET_GLOSSARY_UI.notDiscovered}
            </Text>
          </View>
        </View>
      </View>

      <Text className="text-xs leading-relaxed text-muted">{species.description}</Text>

      <View className="flex-row flex-wrap gap-2">
        <InfoPill label={species.passive.label} accent />
        <InfoPill label={PET_GLOSSARY_UI.hatch(species.hatchHours)} />
      </View>

      <View className="rounded-lg bg-surface px-2.5 py-2">
        <Text className="text-[10px] font-bold text-muted">{PET_GLOSSARY_UI.statBias}</Text>
        <Text className="mt-0.5 text-[11px] text-foreground-secondary">{statLine}</Text>
      </View>
    </Card>
  );
};

const InfoPill = ({ label, accent }: { label: string; accent?: boolean }) => (
  <View
    className={`rounded-full px-2.5 py-1 ${
      accent ? 'bg-primary/15' : 'border border-border bg-surface'
    }`}>
    <Text className={`text-[10px] font-bold ${accent ? 'text-primary' : 'text-foreground'}`}>
      {label}
    </Text>
  </View>
);
