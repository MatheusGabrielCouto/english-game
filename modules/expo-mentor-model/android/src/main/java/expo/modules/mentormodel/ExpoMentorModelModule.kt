package expo.modules.mentormodel

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.File
import java.io.IOException

class ExpoMentorModelModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExpoMentorModel")

    Function("hasBundledModel") { fileName: String ->
      val context = appContext.reactContext ?: return@Function false
      try {
        context.assets.open("models/$fileName").close()
        true
      } catch (_: Exception) {
        false
      }
    }

    AsyncFunction("copyBundledModelIfNeeded") { destDir: String, fileName: String ->
      val context =
              appContext.reactContext ?: throw IllegalStateException("React context unavailable")

      val normalizedDestDir = normalizeNativePath(destDir)
      val outputDir = File(normalizedDestDir)
      if (!outputDir.exists() && !outputDir.mkdirs()) {
        throw IOException("Não foi possível criar a pasta do modelo: $normalizedDestDir")
      }

      val outputFile = File(outputDir, fileName)
      if (outputFile.exists() && outputFile.length() > 0L) {
        return@AsyncFunction outputFile.absolutePath
      }

      if (outputFile.exists()) {
        outputFile.delete()
      }

      try {
        context.assets.open("models/$fileName").use { input ->
          outputFile.outputStream().use { output -> input.copyTo(output, bufferSize = 1024 * 1024) }
        }
      } catch (error: Exception) {
        if (outputFile.exists()) {
          outputFile.delete()
        }

        val reason = error.message ?: error.javaClass.simpleName
        throw IOException(
                "Falha ao copiar modelo do APK ($fileName). Verifique espaço livre (~1,2 GB). Causa: $reason",
                error,
        )
      }

      if (!outputFile.exists() || outputFile.length() <= 0L) {
        throw IOException("Cópia do modelo terminou vazia: ${outputFile.absolutePath}")
      }

      outputFile.absolutePath
    }
  }

  private fun normalizeNativePath(path: String): String {
    val trimmed = path.trim()
    if (trimmed.startsWith("file://")) {
      return trimmed.removePrefix("file://")
    }
    return trimmed
  }
}
