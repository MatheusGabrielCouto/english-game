import { useFocusEffect } from 'expo-router'
import { useCallback } from 'react'

import { CityEventService } from '@/features/city/services/city-event-service'
import { CityService } from '@/features/city/services/city-service'
import { MetagameService } from '@/features/metagame/services/metagame-service'
import { ContractService } from '@/features/contracts/services/contract-service'
import { useEnglishJournalStore } from '@/features/english-journal/store/english-journal-store'
import { FarmService } from '@/features/farm/services/farm-service'
import { InventoryService } from '@/features/inventory/services/inventory-service'
import { usePet } from '@/features/pet/hooks/use-pet'
import { useRoutinesStore } from '@/features/routines/store/routines-store'

export const useHomeFocusRefresh = (): void => {
  const refreshVault = useEnglishJournalStore((s) => s.refresh)
  const refreshRoutines = useRoutinesStore((s) => s.refresh)
  const { refresh: refreshPet } = usePet()

  useFocusEffect(
    useCallback(() => {
      void refreshVault()
      void refreshRoutines()
      void refreshPet()
      void FarmService.refresh()
      void CityService.refresh()
      void CityEventService.syncActiveEvent()
      void MetagameService.refresh()
      void ContractService.refresh()
      void InventoryService.refresh()
    }, [refreshPet, refreshRoutines, refreshVault]),
  )
}
