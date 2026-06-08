const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

const MODEL_DIR = path.join(__dirname, "../assets/models");
const MODEL_FILENAME = "qwen2.5-1.5b-instruct-q4_k_m.gguf";
const MODEL_SRC = path.join(MODEL_DIR, MODEL_FILENAME);

const RELEASE_GRADLE_PROPERTIES = {
  "org.gradle.jvmargs":
    "-Xmx4096m -XX:MaxMetaspaceSize=1024m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8",
  "org.gradle.workers.max": "2",
  "android.lint.checkReleaseBuilds": "false",
};

const upsertGradleProperty = (contents, key, value) => {
  const line = `${key}=${value}`;
  const pattern = new RegExp(`^${key.replace(/\./g, "\\.")}=.*$`, "m");

  if (pattern.test(contents)) {
    return contents.replace(pattern, line);
  }

  return `${contents.trimEnd()}\n${line}\n`;
};

const patchReleaseGradleProperties = (platformProjectRoot) => {
  const gradlePropertiesPath = path.join(
    platformProjectRoot,
    "gradle.properties",
  );
  let contents = fs.readFileSync(gradlePropertiesPath, "utf8");

  for (const [key, value] of Object.entries(RELEASE_GRADLE_PROPERTIES)) {
    contents = upsertGradleProperty(contents, key, value);
  }

  fs.writeFileSync(gradlePropertiesPath, contents);
  console.log(
    "[withMentorModel] gradle.properties ajustado para release com LLM",
  );
};

const withMentorModel = (config) =>
  withDangerousMod(config, [
    "android",
    async (cfg) => {
      patchReleaseGradleProperties(cfg.modRequest.platformProjectRoot);

      const destDir = path.join(
        cfg.modRequest.platformProjectRoot,
        "app/src/main/assets/models",
      );
      fs.mkdirSync(destDir, { recursive: true });

      if (!fs.existsSync(MODEL_SRC)) {
        console.warn(
          `[withMentorModel] Modelo não encontrado em ${MODEL_SRC}. ` +
            "O APK será gerado sem LLM embutido (motor pedagógico como fallback).",
        );
        return cfg;
      }

      const dest = path.join(destDir, MODEL_FILENAME);
      console.log(`[withMentorModel] Copiando modelo para ${dest}`);
      fs.copyFileSync(MODEL_SRC, dest);
      return cfg;
    },
  ]);

module.exports = withMentorModel;
