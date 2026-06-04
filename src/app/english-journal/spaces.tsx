import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, Text } from 'react-native';

import { ScreenContainer, ScreenHeader } from '@/components/layout';
import { GameCard } from '@/components/ui/game';

import { VAULT_SPACES } from '@/features/english-journal/catalogs/vault-spaces-catalog';
import { VaultScreenBody } from '@/features/english-journal/components/vault/VaultScreenBody';
import { VAULT_UI } from '@/features/english-journal/constants/vault-ui';
import { useEnglishJournalStore } from '@/features/english-journal/store/english-journal-store';
import type { VaultSpaceKey } from '@/types/knowledge-vault';

export default function VaultSpacesRoute() {
  const router = useRouter();
  const folders = useEnglishJournalStore((s) => s.folders);
  const entries = useEnglishJournalStore((s) => s.entries);
  const refresh = useEnglishJournalStore((s) => s.refresh);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const handleOpenSpace = (spaceKey: VaultSpaceKey) => {
    router.push(`/english-journal/space/${spaceKey}` as never);
  };

  const countNotesInSpace = (spaceKey: VaultSpaceKey) =>
    entries.filter((e) => e.spaceKey === spaceKey).length;

  return (
    <ScreenContainer scrollable>
      <ScreenHeader showBack title={VAULT_UI.spacesTitle} subtitle={VAULT_UI.spacesIntro} emoji="🗂️" />
      <VaultScreenBody hubActive="spaces" helpText={VAULT_UI.spacesIntro} showHelp>
        {VAULT_SPACES.map((space) => {
          const folderCount = folders.filter((f) => f.spaceKey === space.key).length;
          const noteCount = countNotesInSpace(space.key);
          return (
            <Pressable
              key={space.key}
              onPress={() => handleOpenSpace(space.key)}
              accessibilityRole="button"
              accessibilityLabel={`${space.label}. ${VAULT_UI.spaceBrowseHint}`}>
              <GameCard>
                <Text className="text-lg font-bold text-foreground">
                  {space.emoji} {space.label}
                </Text>
                <Text className="mt-1 text-xs leading-4 text-foreground-secondary">
                  {space.description}
                </Text>
                <Text className="mt-2 text-xs font-semibold text-primary">
                  {VAULT_UI.spaceNotesCount(noteCount)} · {VAULT_UI.spacesFolderCount(folderCount)}
                </Text>
                <Text className="mt-1 text-[10px] text-muted">{VAULT_UI.spaceBrowseHint}</Text>
              </GameCard>
            </Pressable>
          );
        })}
      </VaultScreenBody>
    </ScreenContainer>
  );
};
