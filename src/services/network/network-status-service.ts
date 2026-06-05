import NetInfo, { type NetInfoState } from '@react-native-community/netinfo'

import { NETWORK_STATUS_UI } from '@/constants/network-status-ui'
import { showGameToast } from '@/features/feedback'
import { useNetworkStatusStore } from '@/store/network-status-store'

import { resolveIsOffline } from './network-status-utils'

let initialized = false
let unsubscribe: (() => void) | null = null
let wasOffline = false

const applyNetInfoState = (state: NetInfoState) => {
  const isConnected = state.isConnected
  const isInternetReachable = state.isInternetReachable
  const isOffline = resolveIsOffline(isConnected, isInternetReachable)

  if (wasOffline && !isOffline) {
    showGameToast(NETWORK_STATUS_UI.reconnectToast, 'success')
  }

  wasOffline = isOffline

  useNetworkStatusStore.getState().setNetworkState({
    isConnected,
    isInternetReachable,
  })
}

export const NetworkStatusService = {
  init: () => {
    if (initialized) return
    initialized = true

    unsubscribe = NetInfo.addEventListener(applyNetInfoState)

    void NetInfo.fetch().then(applyNetInfoState).catch(() => {
      useNetworkStatusStore.getState().setReady(true)
    })
  },

  refresh: async () => {
    const state = await NetInfo.fetch()
    applyNetInfoState(state)
    return state
  },

  teardown: () => {
    unsubscribe?.()
    unsubscribe = null
    initialized = false
    wasOffline = false
  },
}
