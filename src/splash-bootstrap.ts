import * as SplashScreen from 'expo-splash-screen'

import { StartupPerfService } from '@/services/startup-perf-service'

StartupPerfService.markBoot()

void SplashScreen.preventAutoHideAsync()

SplashScreen.setOptions({
  duration: 420,
  fade: true,
})
