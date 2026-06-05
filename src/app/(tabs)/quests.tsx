import { Redirect } from 'expo-router'

import { routes } from '@/constants'

export default function QuestsTabRedirect() {
  return <Redirect href={routes.tabs.play} />
}
