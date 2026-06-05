import { useLocalSearchParams } from 'expo-router'

import { ProfileScreen } from '@/features/profile'

export default function ProfileRoute() {
  const { edit } = useLocalSearchParams<{ edit?: string | string[] }>()
  const shouldOpenEdit = edit === '1' || (Array.isArray(edit) && edit[0] === '1')

  return <ProfileScreen showBack autoOpenEdit={shouldOpenEdit} />
}
