import { create } from 'zustand'

type NetworkStatusState = {
  isConnected: boolean | null
  isInternetReachable: boolean | null
  isOffline: boolean
  isReady: boolean
  setNetworkState: (payload: {
    isConnected: boolean | null
    isInternetReachable: boolean | null
  }) => void
  setReady: (ready: boolean) => void
}

export const useNetworkStatusStore = create<NetworkStatusState>()((set) => ({
  isConnected: null,
  isInternetReachable: null,
  isOffline: false,
  isReady: false,

  setNetworkState: ({ isConnected, isInternetReachable }) =>
    set({
      isConnected,
      isInternetReachable,
      isOffline: isConnected === false || isInternetReachable === false,
      isReady: true,
    }),

  setReady: (ready) => set({ isReady: ready }),
}))
