import {
  FocusBlockedAppCategory,
  type FocusBlockedApp,
} from '@/types/focus-mode';

export const DEFAULT_BLOCKED_APPS: Omit<FocusBlockedApp, 'enabled'>[] = [
  { packageName: 'com.instagram.android', label: 'Instagram', category: FocusBlockedAppCategory.SOCIAL, isDefault: true },
  { packageName: 'com.zhiliaoapp.musically', label: 'TikTok', category: FocusBlockedAppCategory.VIDEO, isDefault: true },
  { packageName: 'com.ss.android.ugc.trill', label: 'TikTok (Alt)', category: FocusBlockedAppCategory.VIDEO, isDefault: true },
  { packageName: 'com.google.android.youtube', label: 'YouTube', category: FocusBlockedAppCategory.VIDEO, isDefault: true },
  { packageName: 'com.facebook.katana', label: 'Facebook', category: FocusBlockedAppCategory.SOCIAL, isDefault: true },
  { packageName: 'com.twitter.android', label: 'X (Twitter)', category: FocusBlockedAppCategory.SOCIAL, isDefault: true },
  { packageName: 'com.reddit.frontpage', label: 'Reddit', category: FocusBlockedAppCategory.SOCIAL, isDefault: true },
  { packageName: 'com.android.chrome', label: 'Chrome', category: FocusBlockedAppCategory.BROWSER, isDefault: true },
  { packageName: 'org.mozilla.firefox', label: 'Firefox', category: FocusBlockedAppCategory.BROWSER, isDefault: true },
  { packageName: 'com.sec.android.app.sbrowser', label: 'Samsung Internet', category: FocusBlockedAppCategory.BROWSER, isDefault: true },
];

/** Game packages use category prefix matching in native layer for installed games. */
export const GAME_PACKAGE_HINT = 'game';
