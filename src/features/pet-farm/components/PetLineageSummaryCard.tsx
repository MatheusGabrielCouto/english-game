import { useRouter, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { Card } from '@/components';
import { PressableScale } from '@/components/ui/game';
import { routes } from '@/constants';
import type { PetInstance } from '@/types/pet-instance';

import { PET_FARM_UI } from '../constants/pet-farm-ui';
import { PET_GEN_UI } from '../constants/pet-gen-ui';
import {
    canOpenLineageTree,
    PetLineageService,
    type LineageSummaryRow,
} from '../services/pet-lineage-service';
import { PetGenBadge } from './PetGenBadge';
import { PetSpeciesIcon } from './PetSpeciesIcon';

type PetLineageSummaryCardProps = {
  instance: PetInstance;
};

export const PetLineageSummaryCard = ({ instance }: PetLineageSummaryCardProps) => {
  const router = useRouter();
  const [rows, setRows] = useState<LineageSummaryRow[]>([]);
  const treeUnlocked = canOpenLineageTree(instance);

  useEffect(() => {
    void PetLineageService.buildSummaryRows(instance, 4).then(setRows);
  }, [instance]);

  const hasParents = rows.some((r) => r.instance !== null);

  return (
    <Card className="gap-3">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-bold text-foreground">{PET_GEN_UI.lineageTitle}</Text>
        <PetGenBadge generation={instance.generation} size="sm" />
      </View>

      {!hasParents ? (
        <Text className="text-xs text-muted">{PET_FARM_UI.noParents}</Text>
      ) : (
        <View className="gap-2">
          {rows.map((row) => (
            <LineageRow key={row.key} row={row} onPress={(id) => router.push(`${routes.petFarmInstance}/${id}` as Href)} />
          ))}
        </View>
      )}

      {treeUnlocked ? (
        <PressableScale
          onPress={() => router.push(`${routes.petFarmInstance}/${instance.id}/tree` as Href)}
          className="items-center rounded-xl border border-primary/30 bg-primary/10 py-2.5"
          accessibilityRole="button"
          accessibilityLabel={PET_GEN_UI.openTree}>
          <Text className="text-xs font-bold text-primary">{PET_GEN_UI.openTree}</Text>
        </PressableScale>
      ) : (
        <Text className="text-center text-[10px] text-muted">{PET_GEN_UI.treeLocked}</Text>
      )}
    </Card>
  );
};

const LineageRow = ({
  row,
  onPress,
}: {
  row: LineageSummaryRow;
  onPress: (id: number) => void;
}) => {
  if (!row.instance) return null;

  return (
    <PressableScale
      onPress={() => onPress(row.instance!.id)}
      className="flex-row items-center gap-2 rounded-lg bg-surface p-2"
      accessibilityRole="button">
      <PetSpeciesIcon speciesKey={row.instance.speciesKey} size={22} />
      <View className="flex-1">
        <Text className="text-[10px] text-muted">{row.label}</Text>
        <Text className="text-xs font-bold text-foreground">{row.instance.nickname}</Text>
      </View>
      <PetGenBadge generation={row.instance.generation} size="sm" />
    </PressableScale>
  );
};
