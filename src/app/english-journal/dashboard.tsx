import { Redirect } from 'expo-router'

import { routes } from '@/constants'

export default function EnglishJournalDashboardRedirect() {
  return <Redirect href={routes.vault.dashboard} />
}
