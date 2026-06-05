import { Redirect } from 'expo-router'

import { routes } from '@/constants'

export default function EnglishJournalMapRedirect() {
  return <Redirect href={routes.vault.map} />
}
