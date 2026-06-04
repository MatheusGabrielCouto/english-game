import { useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';

import { VAULT_UI } from '../../constants/vault-ui';
import { useEnglishJournalStore } from '../../store/english-journal-store';
import { VaultChoiceChip } from './VaultChoiceChip';
import { VaultField } from './VaultField';

type VaultRelatedNotesPickerProps = {
  excludeEntryId?: string | null;
  selectedIds: string[];
  onChange: (ids: string[]) => void;
};

export const VaultRelatedNotesPicker = ({
  excludeEntryId,
  selectedIds,
  onChange,
}: VaultRelatedNotesPickerProps) => {
  const entries = useEnglishJournalStore((s) => s.entries);
  const [query, setQuery] = useState('');

  const selectedEntries = useMemo(
    () =>
      selectedIds
        .map((id) => entries.find((e) => e.id === id))
        .filter((e): e is NonNullable<typeof e> => e != null),
    [entries, selectedIds],
  );

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries
      .filter((e) => e.id !== excludeEntryId)
      .filter((e) => !selectedIds.includes(e.id))
      .filter((e) => {
        if (!q) return true;
        return (
          e.title.toLowerCase().includes(q) ||
          e.tags.some((t) => t.toLowerCase().includes(q))
        );
      })
      .slice(0, 12);
  }, [entries, excludeEntryId, query, selectedIds]);

  const handleToggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id));
      return;
    }
    onChange([...selectedIds, id]);
  };

  return (
    <VaultField label={VAULT_UI.relatedKnowledge} hint={VAULT_UI.relatedFormHint}>
      {selectedEntries.length > 0 ? (
        <View className="mb-2 flex-row flex-wrap gap-2">
          {selectedEntries.map((entry) => (
            <VaultChoiceChip
              key={entry.id}
              label={entry.title}
              selected
              compact
              onPress={() => handleToggle(entry.id)}
            />
          ))}
        </View>
      ) : (
        <Text className="mb-2 text-xs text-muted">{VAULT_UI.relatedFormEmpty}</Text>
      )}

      <TextInput
        className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-foreground"
        value={query}
        onChangeText={setQuery}
        placeholder={VAULT_UI.relatedFormSearch}
        placeholderTextColor="#71717a"
        autoCapitalize="none"
      />

      {suggestions.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2">
          <View className="flex-row gap-2 py-0.5">
            {suggestions.map((entry) => (
              <VaultChoiceChip
                key={entry.id}
                label={entry.title}
                selected={false}
                compact
                onPress={() => handleToggle(entry.id)}
              />
            ))}
          </View>
        </ScrollView>
      ) : (
        <Text className="mt-2 text-xs text-muted">{VAULT_UI.relatedFormNoResults}</Text>
      )}
    </VaultField>
  );
};
