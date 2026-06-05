import { Redirect } from 'expo-router'

import { routes } from '@/constants/routes'

export default function LootDeepLinkRoute() {
  return <Redirect href={routes.lootBoxes} />
}
