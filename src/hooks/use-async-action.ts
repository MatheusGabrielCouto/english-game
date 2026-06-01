import { useCallback, useState } from 'react'

type UseAsyncActionOptions = {
  /** Prevent overlapping runs of the same action. */
  guard?: boolean
}

/**
 * Wraps async UI actions with a pending flag for buttons / cards.
 */
export const useAsyncAction = <Args extends unknown[]>(
  action: (...args: Args) => Promise<void>,
  options: UseAsyncActionOptions = {},
) => {
  const { guard = true } = options
  const [isPending, setIsPending] = useState(false)

  const run = useCallback(
    async (...args: Args) => {
      if (guard && isPending) return
      setIsPending(true)
      try {
        await action(...args)
      } finally {
        setIsPending(false)
      }
    },
    [action, guard, isPending],
  )

  return { run, isPending }
}
