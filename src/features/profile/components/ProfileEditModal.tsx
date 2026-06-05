import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { TextInput } from 'react-native'

import { Modal } from '@/components'
import { INPUT_PLACEHOLDER_COLOR } from '@/constants'
import { formInputBorderClass } from '@/constants/form-validation-ui'
import { FormFieldShell } from '@/components/ui/form/FormFieldShell'
import { getFormFieldInputA11y, resolveFormFieldErrorId } from '@/components/ui/form/form-field-a11y'
import { usePlayerStore } from '@/features/player'
import { cn, playerNameSchema, type PlayerNameFormValues } from '@/utils'

import { useProfileScreenStore } from '../store/profile-screen-store'

const PLAYER_NAME_FIELD_ID = 'player-name'
const PLAYER_NAME_ERROR_ID = resolveFormFieldErrorId(PLAYER_NAME_FIELD_ID)

export const ProfileEditModal = () => {
  const name = usePlayerStore((state) => state.name)
  const setName = usePlayerStore((state) => state.setName)
  const isVisible = useProfileScreenStore((state) => state.isEditModalVisible)
  const closeEditModal = useProfileScreenStore((state) => state.closeEditModal)

  const { control, handleSubmit, reset, formState } = useForm<PlayerNameFormValues>({
    resolver: zodResolver(playerNameSchema),
    defaultValues: { name },
  })

  useEffect(() => {
    if (isVisible) {
      reset({ name })
    }
  }, [isVisible, name, reset])

  const handleSave = handleSubmit((data) => {
    setName(data.name)
    closeEditModal()
  })

  const nameError = formState.errors.name?.message

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
          <FormFieldShell
            label="Nome do jogador"
            error={nameError}
            fieldId={PLAYER_NAME_FIELD_ID}>
            <TextInput
              className={cn(
                'rounded-xl border bg-surface-elevated px-4 py-3 text-foreground',
                formInputBorderClass(!!nameError),
              )}
              placeholder="Seu nome"
              placeholderTextColor={INPUT_PLACEHOLDER_COLOR}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoCapitalize="words"
              {...getFormFieldInputA11y({
                label: 'Nome do jogador',
                error: nameError,
                errorNativeId: PLAYER_NAME_ERROR_ID,
              })}
            />
          </FormFieldShell>
        )}
      />
    </Modal>
  )
}
