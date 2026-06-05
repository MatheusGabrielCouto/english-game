import { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { cn } from '@/utils';

import {
    FOCUS_DURATION_MAX_MINUTES,
    FOCUS_DURATION_MIN_MINUTES,
    FOCUS_DURATION_OPTIONS,
    FOCUS_MESSAGES,
} from '../constants/focus-config';
import {
    clampFocusDurationMinutes,
    maskFocusDurationInput,
    parseFocusDurationInput,
} from '../utils/focus-duration-input';

type FocusDurationPickerProps = {
  valueMinutes: number;
  onChangeMinutes: (minutes: number) => void;
};

export const FocusDurationPicker = ({ valueMinutes, onChangeMinutes }: FocusDurationPickerProps) => {
  const [input, setInput] = useState(String(valueMinutes));
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    setInput(String(valueMinutes));
  }, [valueMinutes]);

  const parsed = useMemo(() => parseFocusDurationInput(input), [input]);
  const isPreset = FOCUS_DURATION_OPTIONS.includes(valueMinutes as (typeof FOCUS_DURATION_OPTIONS)[number]);
  const showError = touched && parsed == null;

  const handlePreset = (minutes: number) => {
    setTouched(false);
    setInput(String(minutes));
    onChangeMinutes(minutes);
  };

  const handleInputChange = (raw: string) => {
    const masked = maskFocusDurationInput(raw);
    setInput(masked);
    const next = parseFocusDurationInput(masked);
    if (next != null) {
      onChangeMinutes(next);
    }
  };

  const handleBlur = () => {
    setTouched(true);
    if (parsed != null) {
      setInput(String(parsed));
      onChangeMinutes(parsed);
      return;
    }
    const fallback = clampFocusDurationMinutes(valueMinutes);
    setInput(String(fallback));
    onChangeMinutes(fallback);
  };

  return (
    <View className="gap-3">
      <View>
        <Text className="text-sm font-semibold text-foreground">{FOCUS_MESSAGES.durationLabel}</Text>
        <Text className="mt-0.5 text-xs text-foreground-secondary">
          {FOCUS_MESSAGES.durationHint(FOCUS_DURATION_MIN_MINUTES, FOCUS_DURATION_MAX_MINUTES)}
        </Text>
      </View>

      <View>
        <Text className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">
          {FOCUS_MESSAGES.durationQuickLabel}
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {FOCUS_DURATION_OPTIONS.map((minutes) => {
            const selected = isPreset && valueMinutes === minutes;
            return (
              <Pressable
                key={minutes}
                onPress={() => handlePreset(minutes)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={`${minutes} minutos`}
                className={cn(
                  'rounded-xl border px-3 py-2',
                  selected ? 'border-primary bg-primary/15' : 'border-border bg-surface',
                )}>
                <Text
                  className={cn(
                    'text-sm font-bold',
                    selected ? 'text-primary' : 'text-foreground',
                  )}>
                  {minutes} min
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View>
        <Text className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">
          {FOCUS_MESSAGES.durationCustomLabel}
        </Text>
        <View className="flex-row items-center gap-2">
          <TextInput
            className={cn(
              'min-w-0 flex-1 rounded-xl border bg-surface px-4 py-3 text-base font-semibold text-foreground',
              showError ? 'border-danger' : !isPreset ? 'border-primary' : 'border-border',
            )}
            value={input}
            onChangeText={handleInputChange}
            onBlur={handleBlur}
            keyboardType="number-pad"
            maxLength={3}
            placeholder={FOCUS_MESSAGES.durationCustomPlaceholder}
            placeholderTextColor="#71717a"
            accessibilityLabel={FOCUS_MESSAGES.durationCustomLabel}
          />
          <Text className="text-sm font-semibold text-muted">{FOCUS_MESSAGES.durationCustomSuffix}</Text>
        </View>
        {showError ? (
          <Text className="mt-1.5 text-xs text-danger">
            {FOCUS_MESSAGES.durationInvalid(FOCUS_DURATION_MIN_MINUTES, FOCUS_DURATION_MAX_MINUTES)}
          </Text>
        ) : null}
      </View>
    </View>
  );
};
