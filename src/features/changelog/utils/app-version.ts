import Constants from 'expo-constants'

export const resolveAppVersion = (): string =>
  Constants.expoConfig?.version ?? Constants.nativeAppVersion ?? '1.0.0'
