import { Redirect } from 'expo-router'

import { playTabHref } from '@/constants/routes'

export default function RoutinesRouteRedirect() {
  return <Redirect href={playTabHref('routines')} />
}
