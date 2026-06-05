import { Redirect } from 'expo-router'

import { routes } from '@/constants/routes'

export default function PlayDeepLinkRoute() {
  return <Redirect href={routes.tabs.play} />
}
