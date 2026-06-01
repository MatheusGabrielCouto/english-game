import { useState } from 'react';
import { Alert, Text, TextInput, View } from 'react-native';

import { Button, Card } from '@/components';
import type { Pet } from '@/types/pet';

import { PetInteractionService } from '../services/pet-interaction-service';

type PetNameEditorProps = {
  pet: Pet;
  onUpdated?: () => void;
};

export const PetNameEditor = ({ pet, onUpdated }: PetNameEditorProps) => {
  const [name, setName] = useState(pet.name);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await PetInteractionService.setName(name);
      onUpdated?.();
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar o nome.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card elevated>
      <Text className="mb-2 text-base font-semibold text-foreground">Nome do companheiro</Text>
      <View className="flex-row items-center gap-2">
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Ex: Luna, Max, Buddy"
          className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-foreground"
          maxLength={20}
          accessibilityLabel="Nome do pet"
        />
        <Button label="Salvar" onPress={handleSave} disabled={isSaving} size="sm" />
      </View>
    </Card>
  );
};
