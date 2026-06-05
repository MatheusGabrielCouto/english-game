import { Redirect } from 'expo-router'

import { routes } from '@/constants'

export default function EnglishJournalIndexRedirect() {
  return <Redirect href={routes.vault.library} />
}
