import { useLocalSearchParams } from 'expo-router';

import { ScreenContainer, ScreenHeader } from '@/components/layout';

import { VAULT_SPACE_BY_KEY } from '@/features/english-journal/catalogs/vault-spaces-catalog';
import { VaultSpaceDetailContent } from '@/features/english-journal/components/VaultSpaceDetailContent';
import type { VaultSpaceKey } from '@/types/knowledge-vault';

export default function VaultSpaceDetailRoute() {
  const { key } = useLocalSearchParams<{ key: string }>();
  const spaceKey = key as VaultSpaceKey;
  const space = VAULT_SPACE_BY_KEY[spaceKey];

  return (
    <ScreenContainer scrollable>
      <ScreenHeader
        showBack
        title={space?.label ?? 'Área'}
        subtitle={space?.description}
        emoji={space?.emoji ?? '🗂️'}
      />
      <VaultSpaceDetailContent spaceKey={spaceKey} />
    </ScreenContainer>
  );
}
