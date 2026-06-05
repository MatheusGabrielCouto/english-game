import { PressStart2P_400Regular, useFonts } from '@expo-google-fonts/press-start-2p'

export const useAppFonts = () => {
  const [loaded, error] = useFonts({
    PressStart2P_400Regular,
  })

  return loaded || Boolean(error)
}
