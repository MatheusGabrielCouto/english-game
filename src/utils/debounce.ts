export const debounce = <Args extends unknown[]>(
  fn: (...args: Args) => void,
  waitMs: number,
): ((...args: Args) => void) => {
  let timer: ReturnType<typeof setTimeout> | null = null

  return (...args: Args) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      timer = null
      fn(...args)
    }, waitMs)
  }
}

export const debounceAsync = <Args extends unknown[]>(
  fn: (...args: Args) => Promise<void>,
  waitMs: number,
): ((...args: Args) => void) => {
  let timer: ReturnType<typeof setTimeout> | null = null
  let inFlight: Promise<void> | null = null

  return (...args: Args) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      timer = null
      inFlight = fn(...args).finally(() => {
        inFlight = null
      })
    }, waitMs)
  }
}
