import { Redirect, useLocalSearchParams } from 'expo-router'

import { vaultEntryHref } from '@/constants/routes'

export default function VaultEntryDeepLinkRoute() {
  const { id } = useLocalSearchParams<{ id?: string }>()

  if (!id) {
    return <Redirect href="/vault" />
  }

  return <Redirect href={vaultEntryHref(id)} />
}
