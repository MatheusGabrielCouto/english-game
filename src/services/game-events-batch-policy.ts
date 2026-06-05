/**
 * Política de batch para GameEvents (P-43).
 * Código puro — sem imports nativos — para testes Node.
 */
export const shouldScheduleGameEventFlush = (flushScheduled: boolean): boolean => !flushScheduled

export const appendGameEventToBatch = <T>(batch: readonly T[], event: T): T[] => [...batch, event]

export const drainGameEventBatch = <T>(batch: readonly T[]): { events: T[]; next: T[] } => ({
  events: [...batch],
  next: [],
})

export const registerCoalescedTask = <T>(tasks: ReadonlySet<T>, task: T): Set<T> => new Set([...tasks, task])
