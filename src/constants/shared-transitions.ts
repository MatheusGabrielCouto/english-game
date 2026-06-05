import { SharedTransition } from 'react-native-reanimated'

export type { SharedTransitionTag } from './shared-transitions-keys'
export {
  SHARED_ELEMENT_TRANSITIONS_ENABLED,
  SHARED_TRANSITION_TAGS,
  SHARED_TRANSITION_TAG_VALUES,
} from './shared-transitions-keys'

/**
 * @see https://docs.swmansion.com/react-native-reanimated/docs/shared-element-transitions/overview/
 */
export const heroCardSharedTransition = SharedTransition.duration(420)
