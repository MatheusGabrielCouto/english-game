#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APK_PATH="$ROOT_DIR/android/app/build/outputs/apk/release/app-release.apk"
PACKAGE_ID="com.englishquest.app"

cd "$ROOT_DIR"

echo "▶ Build APK release…"
NODE_ENV=production pnpm run android:apk:release

if [[ ! -f "$APK_PATH" ]]; then
  echo "✗ APK não encontrado: $APK_PATH" >&2
  exit 1
fi

APK_SIZE="$(du -h "$APK_PATH" | awk '{print $1}')"
echo "✓ APK gerado ($APK_SIZE)"

if ! command -v adb >/dev/null 2>&1; then
  echo "✗ adb não encontrado. Instale Android platform-tools." >&2
  exit 1
fi

echo "▶ Verificando dispositivo USB…"
DEVICE_COUNT="$(adb devices | awk 'NR>1 && $2=="device" { count++ } END { print count+0 }')"

if [[ "$DEVICE_COUNT" -eq 0 ]]; then
  echo "✗ Nenhum dispositivo conectado." >&2
  echo "  1. Conecte o celular via USB" >&2
  echo "  2. Ative Depuração USB" >&2
  echo "  3. Aceite a permissão no aparelho" >&2
  echo "  4. Rode: adb devices" >&2
  exit 1
fi

echo "▶ Instalando no dispositivo…"
if adb install -r "$APK_PATH"; then
  echo "✓ Instalado: $PACKAGE_ID"
  exit 0
fi

echo "⚠ Instalação falhou. Tentando desinstalar versão antiga e reinstalar…"
adb uninstall "$PACKAGE_ID" >/dev/null 2>&1 || true

if adb install "$APK_PATH"; then
  echo "✓ Instalado após desinstalar versão anterior: $PACKAGE_ID"
  exit 0
fi

echo "✗ Não foi possível instalar o APK." >&2
exit 1
