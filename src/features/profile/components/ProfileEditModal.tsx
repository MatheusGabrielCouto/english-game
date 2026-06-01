import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Text, TextInput, View } from 'react-native';

import { Modal } from '@/components';
import { usePlayerStore } from '@/features/player';
import { playerNameSchema, type PlayerNameFormValues } from '@/utils';

import { useProfileScreenStore } from '../store/profile-screen-store';

export const ProfileEditModal = () => {
  const name = usePlayerStore((state) => state.name);
  const setName = usePlayerStore((state) => state.setName);
  const isVisible = useProfileScreenStore((state) => state.isEditModalVisible);
  const closeEditModal = useProfileScreenStore((state) => state.closeEditModal);

  const { control, handleSubmit, reset, formState } = useForm<PlayerNameFormValues>({
    resolver: zodResolver(playerNameSchema),
    defaultValues: { name },
  });

  useEffect(() => {
    if (isVisible) {
      reset({ name });
    }
  }, [isVisible, name, reset]);

  const handleSave = handleSubmit((data) => {
    setName(data.name);
    closeEditModal();
  });

  return (
    <Modal
      visible={isVisible}
      onRequestClose={closeEditModal}
      title="Editar nome"
      description="Escolha como você quer ser chamado na jornada."
      confirmLabel="Salvar"
      onConfirm={handleSave}
      onCancel={closeEditModal}>
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <View>
            <TextInput
              className="rounded-xl border border-border bg-surface-elevated px-4 py-3 text-foreground"
              placeholder="Seu nome"
              placeholderTextColor="#71717a"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              accessibilityLabel="Nome do jogador"
              autoCapitalize="words"
            />
            {formState.errors.name ? (
              <Text className="mt-2 text-sm text-danger">{formState.errors.name.message}</Text>
            ) : null}
          </View>
        )}
      />
    </Modal>
  );
};
