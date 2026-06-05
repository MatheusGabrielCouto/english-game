import { Redirect } from 'expo-router'

import { routes } from '@/constants'

export default function EnglishJournalCollectionsRedirect() {
  return <Redirect href={routes.vault.collections} />
}
