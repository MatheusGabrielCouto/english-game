import { useRouter, type Href } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { Card } from '@/components';
import { PressableScale } from '@/components/ui/game';
import { routes } from '@/constants';
import { PetFarmRepository } from '@/storage/repositories/pet-farm-repository';
import { PetInstanceRepository } from '@/storage/repositories/pet-instance-repository';

import { getSpeciesDefinition } from '../catalogs/pet-species-resolver';
import { PET_INSTANCE_HUB_UI } from '../constants/pet-instance-hub-ui';
import { PetSpeciesIcon } from './PetSpeciesIcon';

type PetInstanceBreedHistoryTabProps = {
  instanceId: number;
};

type HistoryRow = Awaited<ReturnType<typeof PetFarmRepository.listBreedingHistoryForInstance>>[number];

export const PetInstanceBreedHistoryTab = ({ instanceId }: PetInstanceBreedHistoryTabProps) => {
  const router = useRouter();
  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const history = await PetFarmRepository.listBreedingHistoryForInstance(instanceId);
    setRows(history);
    setLoading(false);
  }, [instanceId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <Card className="py-6">
        <Text className="text-center text-xs text-muted">Carregando…</Text>
      </Card>
    );
  }

  if (rows.length === 0) {
    return (
      <Card className="py-6">
        <Text className="text-center text-xs text-muted">{PET_INSTANCE_HUB_UI.breedHistoryEmpty}</Text>
      </Card>
    );
  }

  return (
    <Card className="gap-3">
      <Text className="text-sm font-bold text-foreground">{PET_INSTANCE_HUB_UI.breedHistoryTitle}</Text>
      {rows.map((row) => (
        <BreedHistoryRow key={row.id} row={row} onNavigate={(id) => router.push(`${routes.petFarmInstance}/${id}` as Href)} />
      ))}
    </Card>
  );
};

const BreedHistoryRow = ({
  row,
  onNavigate,
}: {
  row: HistoryRow;
  onNavigate: (id: number) => void;
}) => {
  const [partnerLabel, setPartnerLabel] = useState('…');
  const outcome = getSpeciesDefinition(row.outcomeSpeciesKey);
  const partnerId =
    row.role === 'mother' ? row.fatherInstanceId : row.motherInstanceId;

  useEffect(() => {
    void PetInstanceRepository.findById(partnerId).then((p) => {
      setPartnerLabel(p?.nickname ?? `#${partnerId}`);
    });
  }, [partnerId]);

  const roleLabel =
    row.role === 'mother' ? PET_INSTANCE_HUB_UI.roleMother : PET_INSTANCE_HUB_UI.roleFather;

  return (
    <View className="gap-1 rounded-lg bg-surface p-2">
      <View className="flex-row items-center gap-2">
        <PetSpeciesIcon speciesKey={row.outcomeSpeciesKey} size={22} />
        <View className="flex-1">
          <Text className="text-xs font-bold text-foreground">
            {roleLabel} → {outcome.name}
          </Text>
          <Text className="text-[10px] text-muted">
            {new Date(row.rolledAt).toLocaleString('pt-BR')}
          </Text>
        </View>
      </View>
      <PressableScale
        onPress={() => onNavigate(partnerId)}
        accessibilityRole="button"
        className="self-start">
        <Text className="text-[10px] font-bold text-primary">Parceiro: {partnerLabel}</Text>
      </PressableScale>
    </View>
  );
};
