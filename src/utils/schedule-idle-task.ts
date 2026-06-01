import { InteractionManager } from 'react-native'

type IdleTask = {
  cancel: () => void
}

export const scheduleIdleTask = (callback: () => void): IdleTask => {
  const handle = InteractionManager.runAfterInteractions(() => {
    callback()
  })

  return {
    cancel: () => handle.cancel(),
  }
}
