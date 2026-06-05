import { useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { Button, FormSheetModal } from '@/components';
import {
  RoutineCategory,
  RoutineFrequency,
  type RoutineCategoryValue,
  type RoutineFrequencyValue,
  type UserRoutineRecord,
} from '@/types/routine';

import { ROUTINE_TEMPLATES } from '../catalogs/routine-templates';
import { ROUTINE_FORM_LIMITS } from '../constants/routine-form-limits';
import {
  ROUTINE_CATEGORY_LABELS,
  ROUTINE_FREQUENCY_DESCRIPTIONS,
  ROUTINE_FREQUENCY_LABELS,
  ROUTINE_UI,
} from '../constants/routine-ui';
import { RoutineService, type CreateRoutineInput } from '../services/routine-service';
import {
  validateRoutineDescription,
  validateRoutineForm,
  validateRoutineName,
} from '../utils/routine-form-input';
import { formatReminderTimeForInput } from '../utils/routine-time-input';
import {
  frequencyRequiresWeekdays,
  frequencyShowsWeekdayPicker,
} from '../utils/routine-weekdays';
import { RoutineFormSection } from './RoutineFormSection';
import { RoutineFormTextField } from './RoutineFormTextField';
import { RoutineOptionSelect } from './RoutineOptionSelect';
import { RoutineReminderTimeField } from './RoutineReminderTimeField';
import { RoutineRewardsFields } from './RoutineRewardsFields';
import { RoutineWeekdayPicker } from './RoutineWeekdayPicker';

type RoutineFormModalProps = {
  visible: boolean;
  editing: UserRoutineRecord | null;
  templateKey?: string | null;
  onClose: () => void;
  onSaved: () => void;
};

const CATEGORIES = Object.values(RoutineCategory).map((value) => ({
  value,
  label: ROUTINE_CATEGORY_LABELS[value],
}));

const FREQUENCIES = Object.values(RoutineFrequency).map((value) => ({
  value,
  label: ROUTINE_FREQUENCY_LABELS[value],
  description: ROUTINE_FREQUENCY_DESCRIPTIONS[value],
}));

export const RoutineFormModal = ({
  visible,
  editing,
  templateKey,
  onClose,
  onSaved,
}: RoutineFormModalProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<RoutineCategoryValue>(RoutineCategory.PERSONAL);
  const [frequency, setFrequency] = useState<RoutineFrequencyValue>(RoutineFrequency.DAILY);
  const [reminderTime, setReminderTime] = useState('');
  const [customXp, setCustomXp] = useState('');
  const [customCoins, setCustomCoins] = useState('');
  const [expectedDurationMin, setExpectedDurationMin] = useState('');
  const [weekdays, setWeekdays] = useState<number[]>([]);
  const [weekdaysTouched, setWeekdaysTouched] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = Boolean(editing);

  const formValidation = useMemo(
    () =>
      validateRoutineForm({
        name,
        description,
        reminderTime,
        frequency,
        weekdays,
        expectedDurationMin,
        customXp,
        customCoins,
      }),
    [
      name,
      description,
      reminderTime,
      frequency,
      weekdays,
      expectedDurationMin,
      customXp,
      customCoins,
    ],
  );

  const showWeekdayPicker = frequencyShowsWeekdayPicker(frequency);
  const weekdaysRequired = frequencyRequiresWeekdays(frequency);

  useEffect(() => {
    if (!visible) return;

    if (editing) {
      setName(editing.name);
      setDescription(editing.description ?? '');
      setCategory(editing.category);
      setFrequency(editing.frequency);
      setReminderTime(formatReminderTimeForInput(editing.reminderTime));
      setCustomXp(editing.customXp != null ? String(editing.customXp) : '');
      setCustomCoins(editing.customCoins != null ? String(editing.customCoins) : '');
      setExpectedDurationMin(
        editing.expectedDurationMin != null ? String(editing.expectedDurationMin) : '',
      );
      setWeekdays([...editing.weekdays]);
    } else {
      const template = templateKey ? ROUTINE_TEMPLATES.find((t) => t.key === templateKey) : null;
      if (template) {
        setName(template.name);
        setDescription(template.description);
        setCategory(template.category);
        setFrequency(template.frequency);
        setCustomXp(String(template.defaultXp));
        setCustomCoins(String(template.defaultCoins));
        setExpectedDurationMin(String(template.expectedDurationMin));
        setWeekdays([...template.weekdays]);
      } else {
        setName('');
        setDescription('');
        setCategory(RoutineCategory.PERSONAL);
        setFrequency(RoutineFrequency.DAILY);
        setCustomXp('');
        setCustomCoins('');
        setExpectedDurationMin('');
        setWeekdays([]);
      }
      setReminderTime('');
    }

    setWeekdaysTouched(false);
    setSubmitAttempted(false);
    setError(null);
  }, [visible, editing, templateKey]);

  const buildInput = (): CreateRoutineInput => ({
    name: formValidation.name.normalized ?? name.trim(),
    description: formValidation.description.normalized ?? undefined,
    category,
    frequency,
    reminderTime: formValidation.reminderTime.normalized,
    weekdays: showWeekdayPicker ? weekdays : [],
    expectedDurationMin: formValidation.duration.normalizedNumber,
    customXp: formValidation.customXp.normalizedNumber,
    customCoins: formValidation.customCoins.normalizedNumber,
    templateKey: templateKey ?? editing?.templateKey ?? null,
  });

  const handleSave = async () => {
    setSubmitAttempted(true);

    if (!formValidation.valid) {
      setWeekdaysTouched(true);
      const firstError =
        formValidation.name.error ??
        formValidation.description.error ??
        formValidation.reminderTime.error ??
        formValidation.weekdays.error ??
        formValidation.duration.error ??
        formValidation.customXp.error ??
        formValidation.customCoins.error ??
        formValidation.rewardsPair.error ??
        'Revise os campos destacados';
      setError(firstError);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      if (editing) {
        await RoutineService.update(editing.id, buildInput());
      } else {
        await RoutineService.create(buildInput());
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível salvar');
    } finally {
      setSaving(false);
    }
  };

  const handleFrequencyChange = (freq: RoutineFrequencyValue) => {
    setFrequency(freq);
    if (freq === RoutineFrequency.DAILY) {
      setWeekdays([]);
      setWeekdaysTouched(false);
    }
  };

  return (
    <FormSheetModal
      visible={visible}
      onClose={onClose}
      closeAccessibilityLabel="Fechar formulário"
      header={
        <>
          <View className="items-center pt-3">
            <View className="h-1 w-10 rounded-full bg-border" />
          </View>
          <View className="border-b border-border/60 px-5 pb-4 pt-2">
            <View className="flex-row items-center gap-3">
              <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primary/15">
                <Text className="text-2xl">{isEdit ? '✏️' : '🔄'}</Text>
              </View>
              <View className="min-w-0 flex-1">
                <Text className="text-lg font-black text-foreground">
                  {isEdit ? ROUTINE_UI.editRoutine : ROUTINE_UI.addRoutine}
                </Text>
                <Text className="mt-0.5 text-xs text-foreground-secondary">
                  {isEdit
                    ? 'Ajuste nome, agenda e recompensas da rotina.'
                    : 'Monte um hábito com lembrete e recompensas no jogo.'}
                </Text>
              </View>
            </View>
          </View>
        </>
      }
      footer={
        <View className="gap-2 border-t border-border/60 bg-background px-5 py-4">
          {error ? (
            <Text className="text-center text-sm text-danger" accessibilityLiveRegion="polite">
              {error}
            </Text>
          ) : null}
          <Button
            label="Salvar rotina"
            onPress={() => void handleSave()}
            loading={saving}
            disabled={saving}
          />
          <Button label="Cancelar" variant="secondary" onPress={onClose} />
        </View>
      }>
      <View className="gap-4 px-5 pb-7 pt-4">
                <RoutineFormSection
                  emoji="📝"
                  title="Informações"
                  hint="Nome e descrição visíveis na lista">
                  <RoutineFormTextField
                    label={ROUTINE_UI.nameLabel}
                    hint={ROUTINE_UI.nameHint}
                    value={name}
                    onChange={setName}
                    validate={validateRoutineName}
                    placeholder={ROUTINE_UI.namePlaceholder}
                    maxLength={ROUTINE_FORM_LIMITS.nameMax}
                    forceShowError={submitAttempted}
                    autoCapitalize="words"
                  />

                  <RoutineFormTextField
                    label={ROUTINE_UI.descriptionLabel}
                    hint={ROUTINE_UI.descriptionHint}
                    value={description}
                    onChange={setDescription}
                    validate={validateRoutineDescription}
                    placeholder={ROUTINE_UI.descriptionPlaceholder}
                    maxLength={ROUTINE_FORM_LIMITS.descriptionMax}
                    multiline
                    showCharCount
                    forceShowError={submitAttempted}
                  />

                  <RoutineOptionSelect
                    label={ROUTINE_UI.categoryLabel}
                    hint="Tipo de estudo — afeta recompensas e tijolos na cidade"
                    options={CATEGORIES}
                    value={category}
                    onChange={setCategory}
                    variant="grid"
                  />
                </RoutineFormSection>

                <RoutineFormSection
                  emoji="📅"
                  title="Agenda"
                  hint="Frequência, dias e horário do lembrete">
                  <RoutineOptionSelect
                    label={ROUTINE_UI.frequencyLabel}
                    hint="Com que regularidade esta rotina entra no seu plano"
                    options={FREQUENCIES}
                    value={frequency}
                    onChange={handleFrequencyChange}
                    variant="list"
                  />

                  {showWeekdayPicker ? (
                    <RoutineWeekdayPicker
                      selected={weekdays}
                      onChange={(next) => {
                        setWeekdays(next);
                        setWeekdaysTouched(true);
                      }}
                      required={weekdaysRequired}
                      showError={weekdaysTouched || submitAttempted}
                    />
                  ) : (
                    <Text className="text-sm text-muted">{ROUTINE_UI.weekdaysAllDays}</Text>
                  )}

                  <RoutineReminderTimeField
                    value={reminderTime}
                    onChange={setReminderTime}
                    forceShowError={submitAttempted}
                  />
                </RoutineFormSection>

                <RoutineFormSection
                  emoji="🎁"
                  title="Recompensas"
                  hint="Veja o padrão do jogo ou defina valores próprios">
                  <RoutineRewardsFields
                    category={category}
                    frequency={frequency}
                    customXp={customXp}
                    customCoins={customCoins}
                    expectedDurationMin={expectedDurationMin}
                    onChangeXp={setCustomXp}
                    onChangeCoins={setCustomCoins}
                    onChangeDuration={setExpectedDurationMin}
                    rewardsPairError={
                      submitAttempted && !formValidation.rewardsPair.valid
                        ? formValidation.rewardsPair.error
                        : null
                    }
                    forceShowError={submitAttempted}
                  />
                </RoutineFormSection>
      </View>
    </FormSheetModal>
  );
};
