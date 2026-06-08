#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DEST_DIR="$ROOT_DIR/assets/models"
FILENAME="qwen2.5-1.5b-instruct-q4_k_m.gguf"
DEST="$DEST_DIR/$FILENAME"

# Hugging Face direct file (Qwen2.5-1.5B-Instruct-GGUF)
URL="https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF/resolve/main/qwen2.5-1.5b-instruct-q4_k_m.gguf"

mkdir -p "$DEST_DIR"

if [[ -f "$DEST" && -s "$DEST" ]]; then
  echo "Modelo já existe: $DEST"
  ls -lh "$DEST"
  exit 0
fi

echo "Baixando Qwen 2.5 1.5B Instruct (Q4_K_M)..."
echo "Destino: $DEST"
echo "Isso pode levar alguns minutos (~1 GB)."

if command -v curl >/dev/null 2>&1; then
  curl -L --fail --progress-bar -o "$DEST" "$URL"
elif command -v wget >/dev/null 2>&1; then
  wget -O "$DEST" "$URL"
else
  echo "Instale curl ou wget para baixar o modelo."
  exit 1
fi

echo "Download concluído."
ls -lh "$DEST"
