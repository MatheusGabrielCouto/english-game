import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { GameCard } from '@/components/ui/game';
import type { JournalEntryRecord } from '@/types/journal';
import type { VaultFolderRecord } from '@/types/knowledge-vault';
import { VAULT_UI } from '../../constants/vault-ui';
import { JournalEntryCard } from '../JournalEntryCard';
import { VaultSectionHeader } from './VaultSectionHeader';

type VaultSpaceFoldersViewProps = {
  folders: VaultFolderRecord[];
  entries: JournalEntryRecord[];
  onOpenEntry: (id: string) => void;
};

export const VaultSpaceFoldersView = ({
  folders,
  entries,
  onOpenEntry,
}: VaultSpaceFoldersViewProps) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const folder of folders) {
      initial[folder.id] = true;
    }
    initial.__unfiled__ = true;
    return initial;
  });

  const entriesByFolder = useMemo(() => {
    const map = new Map<string | null, JournalEntryRecord[]>();
    for (const entry of entries) {
      const key = entry.folderId ?? null;
      const list = map.get(key) ?? [];
      list.push(entry);
      map.set(key, list);
    }
    return map;
  }, [entries]);

  const unfiled = entriesByFolder.get(null) ?? [];
  const sortedFolders = [...folders].sort((a, b) => a.sortOrder - b.sortOrder);

  const toggle = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <View className="gap-4">
      <VaultSectionHeader
        emoji="📂"
        title={VAULT_UI.spaceFoldersSection}
        hint={VAULT_UI.spaceFoldersHint}
        trailing={String(folders.length)}
      />

      {sortedFolders.map((folder) => {
        const folderEntries = entriesByFolder.get(folder.id) ?? [];
        const isOpen = expanded[folder.id] ?? true;
        return (
          <GameCard key={folder.id} className="overflow-hidden p-0">
            <Pressable
              onPress={() => toggle(folder.id)}
              className="flex-row items-center gap-3 px-4 py-3"
              accessibilityRole="button"
              accessibilityState={{ expanded: isOpen }}>
              <Text className="text-lg">📁</Text>
              <View className="min-w-0 flex-1">
                <Text className="text-base font-bold text-foreground">{folder.name}</Text>
                <Text className="text-xs text-foreground-secondary">
                  {VAULT_UI.spaceFolderNotes(folderEntries.length)}
                </Text>
              </View>
              <Text className="text-xs text-muted">{isOpen ? '▼' : '▶'}</Text>
            </Pressable>

            {isOpen ? (
              <View className="gap-2 border-t border-border/60 px-3 pb-3 pt-2">
                {folderEntries.length === 0 ? (
                  <Text className="px-2 py-2 text-xs text-muted">{VAULT_UI.spaceFolderEmpty}</Text>
                ) : (
                  folderEntries.map((entry) => (
                    <JournalEntryCard
                      key={entry.id}
                      entry={entry}
                      compact
                      onPress={() => onOpenEntry(entry.id)}
                    />
                  ))
                )}
              </View>
            ) : null}
          </GameCard>
        );
      })}

      {unfiled.length > 0 ? (
        <GameCard className="overflow-hidden p-0">
          <Pressable
            onPress={() => toggle('__unfiled__')}
            className="flex-row items-center gap-3 px-4 py-3"
            accessibilityRole="button"
            accessibilityState={{ expanded: expanded.__unfiled__ ?? true }}>
            <Text className="text-lg">📄</Text>
            <View className="min-w-0 flex-1">
              <Text className="text-base font-bold text-foreground">{VAULT_UI.spaceUnfiledSection}</Text>
              <Text className="text-xs text-foreground-secondary">{VAULT_UI.spaceUnfiledHint}</Text>
            </View>
            <Text className="text-xs text-muted">{expanded.__unfiled__ ? '▼' : '▶'}</Text>
          </Pressable>
          {expanded.__unfiled__ ? (
            <View className="gap-2 border-t border-border/60 px-3 pb-3 pt-2">
              {unfiled.map((entry) => (
                <JournalEntryCard
                  key={entry.id}
                  entry={entry}
                  compact
                  onPress={() => onOpenEntry(entry.id)}
                />
              ))}
            </View>
          ) : null}
        </GameCard>
      ) : null}
    </View>
  );
};
