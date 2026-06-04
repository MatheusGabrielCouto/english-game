import DateTimePicker from '@react-native-community/datetimepicker';
import { useMemo, useState } from 'react';
import { Platform, Pressable, Text, TextInput, View } from 'react-native';

import { Modal } from '@/components';
import { theme } from '@/constants';
import { cn, haptics } from '@/utils';

import { ROUTINE_FORM_INPUT } from '../constants/routine-form-limits';
import { ROUTINE_REMINDER_PRESETS } from '../constants/routine-reminder-presets';
import { ROUTINE_UI } from '../constants/routine-ui';
import {
    dateToReminderTime,
    maskReminderTimeInput,
    reminderTimeToDate,
    validateReminderTime,
} from '../utils/routine-time-input';
import { RoutineFieldShell, routineInputBorderClass } from './RoutineFieldShell';

type RoutineReminderTimeFieldProps = {
  value: string;
  onChange: (value: string) => void;
  forceShowError?: boolean;
};

const isNativeMobile = Platform.OS === 'ios' || Platform.OS === 'android';

export const RoutineReminderTimeField = ({
  value,
  onChange,
  forceShowError = false,
}: RoutineReminderTimeFieldProps) => {
  const [touched, setTouched] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [draftDate, setDraftDate] = useState(() => reminderTimeToDate(value));

  const validation = useMemo(() => validateReminderTime(value), [value]);
  const displayTime = validation.normalized ?? (value.trim() ? value : null);

  const showError =
    !validation.valid && validation.error != null && (forceShowError || touched);

  const handleClear = () => {
    setTouched(false);
    setPickerVisible(false);
    onChange('');
  };

  const handlePreset = (time: string) => {
    haptics.light();
    setTouched(true);
    setPickerVisible(false);
    onChange(time);
  };

  const openPickerModal = () => {
    haptics.light();
    setDraftDate(reminderTimeToDate(value));
    setPickerVisible(true);
  };

  const closePickerModal = () => {
    setPickerVisible(false);
  };

  const handleConfirmPicker = () => {
    setTouched(true);
    onChange(dateToReminderTime(draftDate));
    closePickerModal();
  };

  return (
    <RoutineFieldShell
      label={ROUTINE_UI.reminderTimeLabel}
      hint={ROUTINE_UI.reminderTimeHint}
      error={showError ? validation.error : null}
      footer={
        touched && validation.valid && validation.normalized
          ? ROUTINE_UI.reminderTimeConfirmed(validation.normalized)
          : null
      }
      footerTone="success"
      showClear={value.length > 0}
      onClear={handleClear}>
      <View className="gap-3">
        <View>
          <Text className="mb-2 text-xs font-semibold text-foreground-secondary">
            {ROUTINE_UI.reminderPresetsTitle}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {ROUTINE_REMINDER_PRESETS.map((preset) => {
              const selected = validation.normalized === preset.time;
              return (
                <Pressable
                  key={preset.time}
                  onPress={() => handlePreset(preset.time)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`${ROUTINE_UI.reminderPresetA11y} ${preset.label}`}
                  className={cn(
                    'min-w-[56px] items-center rounded-xl border px-3 py-2',
                    selected ? 'border-primary bg-primary/15' : 'border-border bg-surface',
                  )}>
                  <Text
                    className={cn(
                      'font-mono text-sm font-bold',
                      selected ? 'text-primary' : 'text-foreground',
                    )}>
                    {preset.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {isNativeMobile ? (
          <>
            <View>
              <Text className="mb-2 text-xs font-semibold text-foreground-secondary">
                {ROUTINE_UI.reminderPickerTitle}
              </Text>
              <Pressable
                onPress={openPickerModal}
                accessibilityRole="button"
                accessibilityLabel={ROUTINE_UI.reminderTimeAccessibility}
                className={cn(
                  'w-full flex-row items-center justify-center gap-2 rounded-xl border bg-surface px-4 py-3.5',
                  routineInputBorderClass(showError),
                )}
                style={{ minHeight: 48 }}>
                <Text className="text-lg">🕐</Text>
                <Text
                  className={cn(
                    'font-mono text-xl font-bold tracking-wide',
                    displayTime ? 'text-foreground' : 'text-muted',
                  )}>
                  {displayTime ?? ROUTINE_UI.reminderTimeEmpty}
                </Text>
              </Pressable>
            </View>

            <Modal
              visible={pickerVisible}
              onRequestClose={closePickerModal}
              title={ROUTINE_UI.reminderPickerModalTitle}
              description={ROUTINE_UI.reminderPickerModalHint}
              confirmLabel={ROUTINE_UI.reminderPickerDone}
              cancelLabel={ROUTINE_UI.reminderPickerCancel}
              onConfirm={handleConfirmPicker}
              onCancel={closePickerModal}
              scrollable={false}
              footerMode="dual">
              <View className="items-center overflow-hidden rounded-xl bg-surface-elevated py-2">
                <DateTimePicker
                  value={draftDate}
                  mode="time"
                  display="spinner"
                  is24Hour={Platform.OS === 'android'}
                  locale={Platform.OS === 'ios' ? 'pt-BR' : undefined}
                  themeVariant="dark"
                  textColor={theme.colors.foreground}
                  accentColor={theme.colors.primary}
                  onChange={(_event, date) => {
                    if (date) setDraftDate(date);
                  }}
                />
              </View>
            </Modal>
          </>
        ) : (
          <WebTimeFallback
            value={value}
            showError={showError}
            onChange={onChange}
            onBlur={() => setTouched(true)}
          />
        )}
      </View>
    </RoutineFieldShell>
  );
};

type WebTimeFallbackProps = {
  value: string;
  showError: boolean;
  onChange: (value: string) => void;
  onBlur: () => void;
};

const WebTimeFallback = ({ value, showError, onChange, onBlur }: WebTimeFallbackProps) => (
  <View>
    <Text className="mb-2 text-xs font-semibold text-foreground-secondary">
      {ROUTINE_UI.reminderManualTitle}
    </Text>
    <TextInput
      className={cn(
        'w-full rounded-xl border bg-surface px-4 py-3 text-center font-mono text-xl tracking-[0.15em] text-foreground',
        routineInputBorderClass(showError),
      )}
      style={{ minHeight: 48 }}
      value={value}
      onChangeText={(raw) => onChange(maskReminderTimeInput(raw))}
      onBlur={onBlur}
      placeholder={ROUTINE_UI.reminderTimePlaceholder}
      placeholderTextColor={ROUTINE_FORM_INPUT.placeholderColor}
      inputMode="numeric"
      accessibilityLabel={ROUTINE_UI.reminderTimeAccessibility}
    />
  </View>
);

export { formatReminderTimeForInput, validateReminderTime } from '../utils/routine-time-input';
