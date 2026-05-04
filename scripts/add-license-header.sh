#!/usr/bin/env bash
# Add the MIT license header to any source file that's missing it.
# Idempotent.
set -euo pipefail

cd "$(dirname "$0")/.."

HEADER='/**
 * @license MIT
 * Copyright (c) 2026 Firat Gomi
 * See LICENSE in the project root.
 */
'

count=0
while IFS= read -r -d '' file; do
  if ! head -n 1 "$file" | grep -q '@license'; then
    tmp="$(mktemp)"
    printf '%s' "$HEADER" > "$tmp"
    cat "$file" >> "$tmp"
    mv "$tmp" "$file"
    count=$((count + 1))
    echo "→ added header to $file"
  fi
done < <(find prototype/src prototype/server -type f \( -name '*.ts' -o -name '*.tsx' \) -print0)

echo "✅ Headers ensured on $count files."
