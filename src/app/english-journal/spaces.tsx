import { Redirect } from 'expo-router'

import { routes } from '@/constants'

export default function EnglishJournalSpacesRedirect() {
  return <Redirect href={routes.vault.spaces} />
}
