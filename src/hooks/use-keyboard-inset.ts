import { useEffect, useState } from 'react'
import { Keyboard, Platform, type KeyboardEvent } from 'react-native'

export const useKeyboardInset = (): number => {
  const [inset, setInset] = useState(0)

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide'

    const handleShow = (event: KeyboardEvent) => {
      setInset(event.endCoordinates.height)
    }

    const handleHide = () => {
      setInset(0)
    }

    const showSub = Keyboard.addListener(showEvent, handleShow)
    const hideSub = Keyboard.addListener(hideEvent, handleHide)

    return () => {
      showSub.remove()
      hideSub.remove()
    }
  }, [])

  return inset
}
