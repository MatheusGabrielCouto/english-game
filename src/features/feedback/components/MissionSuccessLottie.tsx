import { StyleSheet, View } from 'react-native'

import { CelebrationLottie } from './CelebrationLottie'

type MissionSuccessLottieProps = {
  active: boolean
}

/** Mini burst Lottie para reward bursts (missão / foco / revisão). */
export const MissionSuccessLottie = ({ active }: MissionSuccessLottieProps) => {
  if (!active) return null

  return (
    <View style={styles.burst} pointerEvents="none">
      <CelebrationLottie kind="success" active={active} style={styles.burstFrame} />
    </View>
  )
}

const styles = StyleSheet.create({
  burst: {
    position: 'absolute',
    right: -6,
    top: -10,
    width: 72,
    height: 72,
    zIndex: 2,
  },
  burstFrame: {
    position: 'relative',
  },
})
