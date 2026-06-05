import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '@/components';
import { ListItemSkeleton } from '@/components/ui/skeleton';
import { vaultEntryHref } from '@/constants';
import { JournalEntryType } from '@/types/journal';
import type { VaultSpaceKey } from '@/types/knowledge-vault';

import { VAULT_SPACE_BY_KEY } from '../catalogs/vault-spaces-catalog';
import { VAULT_UI } from '../constants/vault-ui';
import { useEnglishJournalStore } from '../store/english-journal-store';
import { JournalEntryFormModal } from './JournalEntryFormModal';
import { VaultEmptyState } from './vault/VaultEmptyState';
import { VaultGlobalSearchTrigger } from './vault/VaultGlobalSearchTrigger';
import { VaultSpaceFoldersView } from './vault/VaultSpaceFoldersView';
import { VaultHubNav } from './VaultHubNav';

type VaultSpaceDetailContentProps = {
  spaceKey: VaultSpaceKey;
};

export const VaultSpaceDetailContent = ({ spaceKey }: VaultSpaceDetailContentProps) => {
  const router = useRouter();
  const space = VAULT_SPACE_BY_KEY[spaceKey];
  const entries = useEnglishJournalStore((s) => s.entries);
  const folders = useEnglishJournalStore((s) => s.folders);
  const isLoading = useEnglishJournalStore((s) => s.isLoading);
  const refresh = useEnglishJournalStore((s) => s.refresh);
  const [formVisible, setFormVisible] = useState(false);
  const [initialFolderId, setInitialFolderId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      void refresh({ spaceKey });
    }, [refresh, spaceKey]),
  );

  const spaceFolders = useMemo(
    () => folders.filter((f) => f.spaceKey === spaceKey).sort((a, b) => a.sortOrder - b.sortOrder),
    [folders, spaceKey],
  );

  const openEntry = (id: string) => {
    router.push(vaultEntryHref(id));
  };

  const openCreateInFolder = (folderId: string | null) => {
    setInitialFolderId(folderId);
    setFormVisible(true);
  };

  if (!space) {
    return <Text className="text-muted">Área não encontrada.</Text>;
  }

  const hasFolders = spaceFolders.length > 0;
  const hasNotes = entries.length > 0;

  return (
    <View className="gap-4">
      <VaultHubNav active="spaces" />
      <VaultGlobalSearchTrigger />

      <View className="rounded-2xl border border-border bg-surface p-4">
        <Text className="text-2xl">{space.emoji}</Text>
        <Text className="mt-2 text-lg font-black text-foreground">{space.label}</Text>
        <Text className="mt-1 text-sm leading-5 text-foreground-secondary">{space.description}</Text>
        <Text className="mt-2 text-xs font-semibold text-primary">
          {VAULT_UI.spacesFolderCount(spaceFolders.length)} · {VAULT_UI.spaceNotesCount(entries.length)}
        </Text>
      </View>

      <Button label={VAULT_UI.spaceAddNote} size="sm" onPress={() => openCreateInFolder(null)} />

      {isLoading ? (
        <View className="gap-3">
          <ListItemSkeleton />
          <ListItemSkeleton />
          <ListItemSkeleton />
        </View>
      ) : !hasFolders && !hasNotes ? (
        <VaultEmptyState
          emoji={space.emoji}
          title={VAULT_UI.spaceEmptyTitle(space.label)}
          body={VAULT_UI.spaceEmptyBody}
          ctaLabel={VAULT_UI.spaceAddNote}
          onCta={() => openCreateInFolder(null)}
        />
      ) : (
        <VaultSpaceFoldersView folders={spaceFolders} entries={entries} onOpenEntry={openEntry} />
      )}

      <JournalEntryFormModal
        visible={formVisible}
        editing={null}
        initialType={JournalEntryType.TEXT_NOTE}
        defaultSpaceKey={spaceKey}
        defaultFolderId={initialFolderId}
        onClose={() => {
          setFormVisible(false);
          setInitialFolderId(null);
        }}
        onSaved={() => void refresh({ spaceKey })}
      />
    </View>
  );
};
