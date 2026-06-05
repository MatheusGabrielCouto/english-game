import { Redirect } from 'expo-router'

import { routes } from '@/constants/routes'

export default function StreakDeepLinkRoute() {
  return <Redirect href={routes.tabs.home} />
}
