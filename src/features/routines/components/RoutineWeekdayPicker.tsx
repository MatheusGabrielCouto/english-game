import { Pressable, Text, View } from 'react-native';

import { cn } from '@/utils';

import { ROUTINE_WEEKDAY_OPTIONS } from '../catalogs/routine-weekday-options';
import { ROUTINE_UI } from '../constants/routine-ui';
import { RoutineFieldShell } from './RoutineFieldShell';

type RoutineWeekdayPickerProps = {
  selected: number[];
  onChange: (weekdays: number[]) => void;
  required?: boolean;
  showError?: boolean;
};

export const RoutineWeekdayPicker = ({
  selected,
  onChange,
  required = false,
  showError = false,
}: RoutineWeekdayPickerProps) => {
  const handleToggle = (day: number) => {
    if (selected.includes(day)) {
      onChange(selected.filter((value) => value !== day));
      return;
    }
    onChange([...selected, day].sort((a, b) => a - b));
  };

  const hasError = showError && required && selected.length === 0;

  return (
    <RoutineFieldShell
      label={ROUTINE_UI.weekdaysLabel}
      hint={ROUTINE_UI.weekdaysHint}
      error={hasError ? ROUTINE_UI.weekdaysRequired : null}
      footer={
        !hasError && selected.length > 0
          ? ROUTINE_UI.weekdaysSelected(selected.length)
          : null
      }
      footerTone="success">
      <View className="flex-row gap-1.5">
        {ROUTINE_WEEKDAY_OPTIONS.map((option) => {
          const isSelected = selected.includes(option.value);
          return (
            <Pressable
              key={option.value}
              onPress={() => handleToggle(option.value)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isSelected }}
              accessibilityLabel={`${option.label}${isSelected ? ', selecionado' : ''}`}
              className="flex-1"
              style={{ minHeight: 48 }}>
              <View
                className={cn(
                  'min-h-[48px] items-center justify-center rounded-xl border',
                  isSelected
                    ? 'border-primary bg-primary/15'
                    : 'border-border bg-surface',
                  hasError && !isSelected ? 'border-danger/40' : '',
                )}>
                <Text
                  className={cn(
                    'text-sm font-bold',
                    isSelected ? 'text-primary' : 'text-foreground-secondary',
                  )}>
                  {option.label}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </RoutineFieldShell>
  );
};
