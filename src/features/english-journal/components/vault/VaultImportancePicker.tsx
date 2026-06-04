import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import type { JournalImportanceValue } from '@/types/journal';
import { cn } from '@/utils';

import {
  JOURNAL_IMPORTANCE_META,
  JOURNAL_IMPORTANCE_ORDER,
} from '../../constants/journal-importance';
import { JOURNAL_UI } from '../../constants/journal-ui';

type VaultImportancePickerProps = {
  value: JournalImportanceValue;
  onChange: (value: JournalImportanceValue) => void;
};

export const VaultImportancePicker = ({ value, onChange }: VaultImportancePickerProps) => (
  <View className="gap-2">
    <Text className="text-xs text-foreground-secondary">{JOURNAL_UI.importanceHint}</Text>
    <View className="flex-row flex-wrap gap-2">
      {JOURNAL_IMPORTANCE_ORDER.map((level) => {
        const meta = JOURNAL_IMPORTANCE_META[level];
        const selected = value === level;
        return (
          <Pressable
            key={level}
            onPress={() => onChange(level)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={`${meta.label}. ${meta.hint}`}
            className="min-w-[47%] flex-grow">
            <View
              className={cn(
                'overflow-hidden rounded-2xl border-2 px-3 py-3',
                selected ? 'border-transparent' : 'border-border/80',
              )}
              style={{
                backgroundColor: meta.surfaceColor,
                borderColor: selected ? meta.color : undefined,
                shadowColor: selected ? meta.color : 'transparent',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: selected ? 0.45 : 0,
                shadowRadius: selected ? 8 : 0,
                elevation: selected ? 4 : 0,
              }}>
              <View className="flex-row items-center justify-between">
                <Text className="text-2xl">{meta.emoji}</Text>
                {selected ? (
                  <View
                    className="h-6 w-6 items-center justify-center rounded-full"
                    style={{ backgroundColor: meta.color }}>
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  </View>
                ) : (
                  <View className="h-6 w-6 rounded-full border border-border/60 bg-background/40" />
                )}
              </View>
              <Text
                className={cn('mt-2 text-sm font-black', !selected && 'text-foreground')}
                style={selected ? { color: meta.color } : undefined}>
                {meta.label}
              </Text>
              <Text
                className={cn('mt-0.5 text-[10px] leading-3', !selected && 'text-muted')}
                style={selected ? { color: meta.color } : undefined}
                numberOfLines={2}>
                {meta.hint}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  </View>
);
