import { Redirect } from 'expo-router'

import { routes } from '@/constants/routes'

export default function VaultDeepLinkRoute() {
  return <Redirect href={routes.vault.library} />
}
