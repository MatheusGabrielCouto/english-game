package expo.modules.focusmode

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.provider.Settings
import android.text.TextUtils
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoFocusModeModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExpoFocusMode")

    Events("onForegroundAppChange")

    OnCreate {
      FocusAccessibilityService.eventEmitter = { packageName ->
        sendEvent("onForegroundAppChange", mapOf("packageName" to packageName))
      }
    }

    AsyncFunction("isAccessibilityServiceEnabled") {
      val context = appContext.reactContext ?: return@AsyncFunction false
      isServiceEnabled(context)
    }

    AsyncFunction<Unit>("openAccessibilitySettings") {
      val context = appContext.reactContext ?: return@AsyncFunction
      val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
      intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
      context.startActivity(intent)
    }

    AsyncFunction("startMonitoring") { packages: List<String>, strictBlocking: Boolean? ->
      FocusAccessibilityService.resetTracking()
      FocusAccessibilityService.blockedPackages = packages.toSet()
      FocusAccessibilityService.strictBlocking = strictBlocking ?: true
      FocusAccessibilityService.monitoring = true
    }

    AsyncFunction<Unit>("stopMonitoring") {
      FocusAccessibilityService.monitoring = false
      FocusAccessibilityService.strictBlocking = false
      FocusAccessibilityService.blockedPackages = emptySet()
      FocusAccessibilityService.resetTracking()
    }

    AsyncFunction("getTrackingSnapshot") {
      FocusAccessibilityService.getTrackingSnapshot()
    }
  }

  private fun isServiceEnabled(context: Context): Boolean {
    val expectedComponent = ComponentName(context, FocusAccessibilityService::class.java)
    val enabledServices =
      Settings.Secure.getString(context.contentResolver, Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES)
        ?: return false

    val splitter = TextUtils.SimpleStringSplitter(':')
    splitter.setString(enabledServices)

    while (splitter.hasNext()) {
      val component = ComponentName.unflattenFromString(splitter.next()) ?: continue
      if (component == expectedComponent) return true
    }

    return false
  }
}
