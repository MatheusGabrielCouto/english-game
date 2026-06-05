import { useEffect } from 'react'

import { DeepLinkService } from '@/services/deep-link-service'

export const useDeepLinking = (isReady: boolean) => {
  useEffect(() => {
    DeepLinkService.init()
  }, [])

  useEffect(() => {
    DeepLinkService.setAppReady(isReady)
  }, [isReady])
}
