import { Redirect } from 'expo-router'

import { routes } from '@/constants/routes'

export default function MissionsDeepLinkRoute() {
  return <Redirect href={routes.tabs.play} />
}
