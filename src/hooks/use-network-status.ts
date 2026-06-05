import { useEffect } from 'react'

import { NetworkStatusService } from '@/services/network/network-status-service'

export const useNetworkStatus = () => {
  useEffect(() => {
    NetworkStatusService.init()
    return () => NetworkStatusService.teardown()
  }, [])
}
