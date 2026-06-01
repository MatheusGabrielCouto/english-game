package expo.modules.focusmode

import android.accessibilityservice.AccessibilityService
import android.content.Intent
import android.net.Uri
import android.view.accessibility.AccessibilityEvent

class FocusAccessibilityService : AccessibilityService() {
  companion object {
    const val APP_PACKAGE = "com.englishquest.app"
    private const val FOCUS_SESSION_DEEP_LINK = "englishquest://focus-mode/session"
    private const val BLOCK_COOLDOWN_MS = 1200L

    @Volatile var blockedPackages: Set<String> = emptySet()

    @Volatile var monitoring: Boolean = false

    @Volatile var strictBlocking: Boolean = true

    @Volatile var eventEmitter: ((String) -> Unit)? = null

    @Volatile private var lastPackage: String? = null

    @Volatile private var lastBlockAtMs: Long = 0L

    @Volatile private var isDistracted: Boolean = false

    @Volatile private var distractionPackage: String? = null

    @Volatile private var distractionStartMs: Long = 0L

    @Volatile private var accumulatedDistractionSec: Long = 0L

    @Volatile private var foregroundPackage: String = ""

    private val allowedPackages =
            setOf(
                    APP_PACKAGE,
                    "com.android.systemui",
                    "com.android.launcher",
                    "com.android.launcher3",
                    "com.google.android.apps.nexuslauncher",
                    "com.sec.android.app.launcher",
                    "com.miui.home",
                    "com.huawei.android.launcher",
                    "com.oppo.launcher",
                    "com.oneplus.launcher",
            )

    fun resetTracking() {
      lastPackage = null
      lastBlockAtMs = 0L
      isDistracted = false
      distractionPackage = null
      distractionStartMs = 0L
      accumulatedDistractionSec = 0L
      foregroundPackage = ""
    }

    private fun isInputMethodPackage(packageName: String): Boolean {
      if (packageName.contains("inputmethod", ignoreCase = true)) return true
      if (packageName.contains("keyboard", ignoreCase = true)) return true
      if (packageName.contains("honeyboard", ignoreCase = true)) return true
      if (packageName.contains("swiftkey", ignoreCase = true)) return true
      if (packageName.endsWith(".ime", ignoreCase = true)) return true
      return false
    }

    private fun isSystemOverlayPackage(packageName: String): Boolean {
      if (isInputMethodPackage(packageName)) return true
      if (packageName == "android") return true
      if (packageName.startsWith("com.android.systemui")) return true
      return false
    }

    fun isAllowedPackage(packageName: String): Boolean {
      if (allowedPackages.contains(packageName)) return true
      if (isSystemOverlayPackage(packageName)) return true
      if (packageName.startsWith("com.android.settings")) return true
      return packageName.contains("launcher", ignoreCase = true)
    }

    fun shouldBlock(packageName: String): Boolean {
      if (!monitoring) return false
      if (isAllowedPackage(packageName)) return false
      if (blockedPackages.contains(packageName)) return true
      return strictBlocking
    }

    fun handleForegroundPackage(packageName: String) {
      if (!monitoring) return
      if (packageName == lastPackage) return
      lastPackage = packageName
      foregroundPackage = packageName

      if (isDistracted && !blockedPackages.contains(packageName)) {
        accumulatedDistractionSec += (System.currentTimeMillis() - distractionStartMs) / 1000
        isDistracted = false
        distractionPackage = null
      }

      if (blockedPackages.contains(packageName) && !isDistracted) {
        isDistracted = true
        distractionPackage = packageName
        distractionStartMs = System.currentTimeMillis()
      }

      eventEmitter?.invoke(packageName)
    }

    fun getTrackingSnapshot(): Map<String, Any> {
      var distractedSec = accumulatedDistractionSec
      if (isDistracted) {
        distractedSec += (System.currentTimeMillis() - distractionStartMs) / 1000
      }

      val trackingState =
              when {
                isDistracted -> "distracted"
                foregroundPackage == APP_PACKAGE -> "focusing"
                foregroundPackage.isNotEmpty() -> "idle"
                else -> "idle"
              }

      return mapOf(
              "isDistracted" to isDistracted,
              "packageName" to (distractionPackage ?: foregroundPackage),
              "foregroundPackage" to foregroundPackage,
              "distractedSeconds" to distractedSec,
              "trackingState" to trackingState,
      )
    }
  }

  private fun redirectToFocusSession() {
    val now = System.currentTimeMillis()
    if (now - lastBlockAtMs < BLOCK_COOLDOWN_MS) return
    lastBlockAtMs = now

    val context = applicationContext

    try {
      val deepLink =
              Intent(Intent.ACTION_VIEW, Uri.parse(FOCUS_SESSION_DEEP_LINK)).apply {
                setPackage(APP_PACKAGE)
                addFlags(
                        Intent.FLAG_ACTIVITY_NEW_TASK or
                                Intent.FLAG_ACTIVITY_CLEAR_TOP or
                                Intent.FLAG_ACTIVITY_SINGLE_TOP or
                                Intent.FLAG_ACTIVITY_REORDER_TO_FRONT,
                )
              }
      context.startActivity(deepLink)
      return
    } catch (_: Exception) {
      // fall through to launcher intent
    }

    val fallback =
            context.packageManager.getLaunchIntentForPackage(APP_PACKAGE)?.apply {
              addFlags(
                      Intent.FLAG_ACTIVITY_NEW_TASK or
                              Intent.FLAG_ACTIVITY_CLEAR_TOP or
                              Intent.FLAG_ACTIVITY_SINGLE_TOP or
                              Intent.FLAG_ACTIVITY_REORDER_TO_FRONT,
              )
            }
    fallback?.let { context.startActivity(it) }
  }

  override fun onAccessibilityEvent(event: AccessibilityEvent?) {
    if (!monitoring || event == null) return
    if (event.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) return

    val packageName = event.packageName?.toString() ?: return

    if (shouldBlock(packageName)) {
      handleForegroundPackage(packageName)
      performGlobalAction(GLOBAL_ACTION_HOME)
      redirectToFocusSession()
      return
    }

    handleForegroundPackage(packageName)
  }

  override fun onInterrupt() {}
}
