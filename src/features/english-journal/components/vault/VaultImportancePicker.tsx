import { Pressable, Text, View } from 'react-native';

import type { JournalImportanceValue } from '@/types/journal';
import { cn, haptics } from '@/utils';

import {
    JOURNAL_IMPORTANCE_META,
    JOURNAL_IMPORTANCE_ORDER,
} from '../../constants/journal-importance';
import { JOURNAL_UI } from '../../constants/journal-ui';

type VaultImportancePickerProps = {
  value: JournalImportanceValue;
  onChange: (value: JournalImportanceValue) => void;
};

export const VaultImportancePicker = ({ value, onChange }: VaultImportancePickerProps) => {
  const selectedMeta = JOURNAL_IMPORTANCE_META[value];

  const handleSelect = (level: JournalImportanceValue) => {
    if (level === value) return;
    haptics.light();
    onChange(level);
  };

  return (
    <View className="gap-3" accessibilityRole="radiogroup" accessibilityLabel={JOURNAL_UI.importanceLabel}>
      <Text className="text-xs text-foreground-secondary">{JOURNAL_UI.importanceHint}</Text>

      <View className="flex-row gap-1.5 rounded-2xl border border-border bg-surface-elevated p-1.5">
        {JOURNAL_IMPORTANCE_ORDER.map((level) => {
          const meta = JOURNAL_IMPORTANCE_META[level];
          const selected = value === level;

          return (
            <Pressable
              key={level}
              onPress={() => handleSelect(level)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={`${meta.label}. ${meta.hint}`}
              className="min-w-0 flex-1">
              <View
                className={cn(
                  'items-center rounded-xl px-1 py-2.5',
                  !selected && 'opacity-80',
                )}
                style={
                  selected
                    ? {
                        backgroundColor: meta.surfaceColor,
                        borderWidth: 2,
                        borderColor: meta.color,
                      }
                    : undefined
                }>
                <Text className="text-lg leading-5">{meta.emoji}</Text>
                <Text
                  className={cn(
                    'mt-1 text-center text-[10px] font-bold leading-3',
                    !selected && 'text-muted',
                  )}
                  style={selected ? { color: meta.color } : undefined}
                  numberOfLines={1}>
                  {meta.shortLabel}
                </Text>
                <View
                  className="mt-2 h-1 w-8 rounded-full"
                  style={{
                    backgroundColor: selected ? meta.color : 'rgba(113, 113, 122, 0.35)',
                  }}
                />
              </View>
            </Pressable>
          );
        })}
      </View>

      <View
        className="flex-row items-start gap-3 rounded-2xl border px-3.5 py-3"
        style={{
          backgroundColor: selectedMeta.surfaceColor,
          borderColor: `${selectedMeta.color}66`,
        }}>
        <Text className="text-2xl">{selectedMeta.emoji}</Text>
        <View className="min-w-0 flex-1">
          <Text className="text-sm font-black text-foreground">{selectedMeta.label}</Text>
          <Text className="mt-0.5 text-xs leading-4 text-foreground-secondary">
            {selectedMeta.hint}
          </Text>
        </View>
      </View>
    </View>
  );
};
