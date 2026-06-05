import type { VaultFolderRecord, VaultSpaceKey } from '@/types/knowledge-vault';
import { VAULT_SPACE_BY_KEY, VAULT_SPACES } from '../catalogs/vault-spaces-catalog';
import { VAULT_UI } from '../constants/vault-ui';

const FOLDER_DESCRIPTION_BY_SPACE_SLUG: Partial<Record<VaultSpaceKey, Record<string, string>>> =
  Object.fromEntries(
    VAULT_SPACES.map((space) => [
      space.key,
      Object.fromEntries(space.defaultFolders.map((f) => [f.slug, f.description])),
    ]),
  );

export type VaultOrganizeContext = {
  spaceEmoji: string;
  spaceLabel: string;
  spaceDescription: string;
  folderName: string | null;
  folderDescription: string;
};

export const getVaultFolderDescription = (
  spaceKey: VaultSpaceKey,
  slug: string,
): string | undefined => FOLDER_DESCRIPTION_BY_SPACE_SLUG[spaceKey]?.[slug];

export const resolveVaultOrganizeContext = (
  spaceKey: VaultSpaceKey,
  folderId: string | null,
  folders: VaultFolderRecord[],
): VaultOrganizeContext => {
  const space = VAULT_SPACE_BY_KEY[spaceKey];
  const folder = folderId ? folders.find((f) => f.id === folderId) : null;

  if (!folder) {
    return {
      spaceEmoji: space.emoji,
      spaceLabel: space.label,
      spaceDescription: space.description,
      folderName: null,
      folderDescription: VAULT_UI.organizeNoFolderDescription(space.label),
    };
  }

  const catalogDescription = getVaultFolderDescription(spaceKey, folder.slug);

  return {
    spaceEmoji: space.emoji,
    spaceLabel: space.label,
    spaceDescription: space.description,
    folderName: folder.name,
    folderDescription:
      catalogDescription ?? VAULT_UI.organizeCustomFolderDescription(folder.name, space.label),
  };
};
