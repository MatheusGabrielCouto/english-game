/**
 * Widget handler must register before expo-router loads so headless updates
 * (periodic refresh / first paint) use the same render tree as the app.
 */
const { Platform } = require("react-native");

if (Platform.OS === "android") {
  require("./src/widgets/android/register");
}

require("expo-router/entry");
