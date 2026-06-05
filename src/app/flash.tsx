import { Redirect } from 'expo-router'

import { routes } from '@/constants/routes'

export default function FlashDeepLinkRoute() {
  return <Redirect href={routes.flashDeckReview} />
}
