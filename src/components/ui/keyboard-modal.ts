import { Platform } from 'react-native';

export const MODAL_KEYBOARD_BEHAVIOR = Platform.OS === 'ios' ? 'padding' : 'height';
