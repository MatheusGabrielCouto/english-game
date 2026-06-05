export const resolveIsOffline = (
  isConnected: boolean | null,
  isInternetReachable: boolean | null,
): boolean => {
  if (isConnected === false) return true
  if (isInternetReachable === false) return true
  return false
}
