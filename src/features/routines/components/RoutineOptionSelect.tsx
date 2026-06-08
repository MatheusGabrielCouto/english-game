import { Pressable, Text, View } from 'react-native';

import { cn } from '@/utils';

export type RoutineSelectOption<T extends string> = {
  value: T;
  label: string;
  description?: string;
};

type RoutineOptionSelectProps<T extends string> = {
  label: string;
  hint?: string;
  options: RoutineSelectOption<T>[];
  value: T;
  onChange: (value: T) => void;
  variant: 'list' | 'grid';
};

const SelectionIndicator = ({ selected }: { selected: boolean }) => (
  <View
    className={cn(
      'h-6 w-6 items-center justify-center rounded-full border-2',
      selected ? 'border-primary bg-primary' : 'border-border bg-surface',
    )}
    accessibilityElementsHidden>
    {selected ? <View className="h-2.5 w-2.5 rounded-full bg-foreground" /> : null}
  </View>
);

export const RoutineOptionSelect = <T extends string>({
  label,
  hint,
  options,
  value,
  onChange,
  variant,
}: RoutineOptionSelectProps<T>) => (
  <View className="w-full">
    <Text className="text-sm font-semibold text-foreground">{label}</Text>
    {hint ? (
      <Text className="mt-1 text-xs leading-4 text-foreground-secondary">{hint}</Text>
    ) : null}

    {variant === 'list' ? (
      <View className="mt-3 gap-2.5">
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={`${option.label}. ${option.description ?? ''}`}
              className={cn(
                'flex-row items-center gap-3 rounded-2xl border px-4 py-4',
                selected
                  ? 'border-primary bg-primary/12'
                  : 'border-border bg-surface',
              )}>
              <View className="min-w-0 flex-1">
                <Text
                  className={cn(
                    ' font-semibold',
                    selected ? 'text-primary' : 'text-foreground',
                  )}>
                  {option.label}
                </Text>
                {option.description ? (
                  <Text className="mt-1 text-sm leading-5 text-foreground-secondary">
                    {option.description}
                  </Text>
                ) : null}
              </View>
              <SelectionIndicator selected={selected} />
            </Pressable>
          );
        })}
      </View>
    ) : (
      <View className="mt-3 flex-row flex-wrap gap-2.5">
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={option.label}
              className={cn(
                'min-h-[52px] min-w-[47%] flex-grow justify-center rounded-2xl border px-3 py-3.5',
                selected
                  ? 'border-primary bg-primary/12'
                  : 'border-border bg-surface',
              )}>
              <Text
                className={cn(
                  'text-center text-sm font-semibold leading-5',
                  selected ? 'text-primary' : 'text-foreground',
                )}
                numberOfLines={2}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    )}
  </View>
);
