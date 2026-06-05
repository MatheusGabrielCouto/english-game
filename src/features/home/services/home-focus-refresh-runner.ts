import { CityEventService } from '@/features/city/services/city-event-service'
import { CityService } from '@/features/city/services/city-service'
import { ContractService } from '@/features/contracts/services/contract-service'
import { useVaultMetaStore } from '@/features/english-journal/store/vault-meta-store'
import { FarmService } from '@/features/farm/services/farm-service'
import { InventoryService } from '@/features/inventory/services/inventory-service'
import { MetagameService } from '@/features/metagame/services/metagame-service'
import { usePlayerStore } from '@/features/player/store/player-store'
import { PetService } from '@/features/pet/services/pet-service'
import { useRoutinesStore } from '@/features/routines/store/routines-store'

import type { HomeFocusRefreshDomain } from '../constants/home-focus-refresh-ui'
import {
  getStaleHomeFocusDomains,
  markHomeFocusDomainsRefreshed,
  type HomeFocusRefreshStamps,
} from '../utils/home-focus-refresh-policy'

let refreshStamps: HomeFocusRefreshStamps = {}

const runDomainRefresh = (domain: HomeFocusRefreshDomain): void => {
  switch (domain) {
    case 'vault':
      void useVaultMetaStore.getState().refresh()
      break
    case 'routines':
      void useRoutinesStore.getState().refresh()
      break
    case 'pet':
      void (async () => {
        await PetService.refresh()
        await PetService.updateMood(usePlayerStore.getState().currentStreak)
      })()
      break
    case 'farm':
      void FarmService.refresh()
      break
    case 'city':
      void CityService.refresh()
      break
    case 'cityEvents':
      void CityEventService.syncActiveEvent()
      break
    case 'metagame':
      void MetagameService.refresh()
      break
    case 'contracts':
      void ContractService.refresh()
      break
    case 'inventory':
      void InventoryService.refresh()
      break
    default: {
      const _exhaustive: never = domain
      return _exhaustive
    }
  }
}

/** Runs only domains outside the focus TTL (P-38). */
export const runThrottledHomeFocusRefresh = (now: number = Date.now()): HomeFocusRefreshDomain[] => {
  const staleDomains = getStaleHomeFocusDomains(refreshStamps, now)
  if (staleDomains.length === 0) return []

  refreshStamps = markHomeFocusDomainsRefreshed(refreshStamps, staleDomains, now)

  for (const domain of staleDomains) {
    runDomainRefresh(domain)
  }

  return staleDomains
}

/** Test helper — clears in-memory TTL stamps. */
export const resetHomeFocusRefreshStampsForTests = (): void => {
  refreshStamps = {}
}
