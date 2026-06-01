import { AUDIO_POOLS } from './audio-catalog'
import type { AudioAssetKey, AudioPoolId } from './types'

const poolIndex: Record<string, number> = {}
const lastPlayed: Record<string, AudioAssetKey | null> = {}

export const pickFromPool = (poolId: AudioPoolId): AudioAssetKey => {
  const options = AUDIO_POOLS[poolId]
  if (!options?.length) return `${poolId}_a` as AudioAssetKey

  let index = poolIndex[poolId] ?? 0
  let candidate = options[index % options.length]
  const last = lastPlayed[poolId]

  if (options.length > 1 && candidate === last) {
    index += 1
    candidate = options[index % options.length]
  }

  poolIndex[poolId] = index + 1
  lastPlayed[poolId] = candidate
  return candidate
}
