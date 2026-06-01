const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push("wasm");
config.resolver.sourceExts.push("sql");

module.exports = withNativeWind(config, {
  input: "./src/global.css",
  // Avoid css-interop virtual module haste.emit crash on Metro 0.82+
  forceWriteFileSystem: true,
});
