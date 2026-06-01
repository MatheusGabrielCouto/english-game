import { useCallback, useState } from 'react'

type ClaimResult = boolean | void

/**
 * Tracks which reward claim is in flight (one at a time per screen).
 */
export const useClaimLoading = () => {
  const [claimingId, setClaimingId] = useState<string | null>(null)

  const isClaiming = useCallback((id: string) => claimingId === id, [claimingId])

  const isBusy = claimingId !== null

  const runClaim = useCallback(
    async (id: string, claimFn: () => Promise<ClaimResult>): Promise<boolean> => {
      if (claimingId !== null) return false

      setClaimingId(id)
      try {
        const result = await claimFn()
        return result !== false
      } finally {
        setClaimingId(null)
      }
    },
    [claimingId],
  )

  return { claimingId, isClaiming, isBusy, runClaim }
}
