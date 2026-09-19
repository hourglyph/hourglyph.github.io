#!/bin/sh
# Hourglyph uninstaller — https://hourglyph.github.io/setup/
#
# 1. Backs up ~/.claude/settings.json to ~/.claude/settings.json.hourglyph-bak
# 2. Removes only Hourglyph hook entries (commands containing "hourglyph.sh" or
#    the old "rpc/checkin" curl); every other setting and hook is kept
# 3. Deletes ~/.claude/hooks/hourglyph.sh
#
# Needs python3 or node to edit the JSON safely. If neither is available it
# changes nothing and tells you what to remove by hand.

set -e
SETTINGS="$HOME/.claude/settings.json"
SCRIPT="$HOME/.claude/hooks/hourglyph.sh"

if [ -f "$SETTINGS" ]; then
  if command -v python3 >/dev/null 2>&1; then
    EDITOR_CMD=python3
  elif command -v node >/dev/null 2>&1; then
    EDITOR_CMD=node
  else
    echo "Neither python3 nor node found — nothing was changed."
    echo "Remove the entries mentioning hourglyph.sh from $SETTINGS by hand, then: rm -f $SCRIPT"
    exit 1
  fi

  cp -p "$SETTINGS" "$SETTINGS.hourglyph-bak"

  if [ "$EDITOR_CMD" = python3 ]; then
    python3 - "$SETTINGS" <<'PY'
import json, sys
path = sys.argv[1]
with open(path) as f:
    s = json.load(f)
markers = ("hourglyph.sh", "rpc/checkin")
hooks = s.get("hooks") or {}
removed = 0
for event in list(hooks):
    kept = []
    for group in hooks[event]:
        inner = group.get("hooks", [])
        left = [h for h in inner if not any(m in h.get("command", "") for m in markers)]
        removed += len(inner) - len(left)
        if left:
            kept.append({**group, "hooks": left})
    if kept:
        hooks[event] = kept
    else:
        del hooks[event]
if "hooks" in s and not hooks:
    del s["hooks"]
with open(path, "w") as f:
    json.dump(s, f, ensure_ascii=False, indent=2)
    f.write("\n")
print(f"Removed {removed} Hourglyph hook(s) from {path}")
PY
  else
    node - "$SETTINGS" <<'JS'
const fs = require('fs');
const path = process.argv[2];
const s = JSON.parse(fs.readFileSync(path, 'utf8'));
const markers = ['hourglyph.sh', 'rpc/checkin'];
const hooks = s.hooks || {};
let removed = 0;
for (const event of Object.keys(hooks)) {
  const kept = [];
  for (const group of hooks[event]) {
    const inner = group.hooks || [];
    const left = inner.filter((h) => !markers.some((m) => (h.command || '').includes(m)));
    removed += inner.length - left.length;
    if (left.length) kept.push({ ...group, hooks: left });
  }
  if (kept.length) hooks[event] = kept; else delete hooks[event];
}
if (s.hooks && !Object.keys(hooks).length) delete s.hooks;
fs.writeFileSync(path, JSON.stringify(s, null, 2) + '\n');
console.log(`Removed ${removed} Hourglyph hook(s) from ${path}`);
JS
  fi
  echo "Backup: $SETTINGS.hourglyph-bak"
else
  echo "No $SETTINGS — nothing to edit."
fi

if [ -f "$SCRIPT" ]; then
  rm -f "$SCRIPT"
  echo "Deleted $SCRIPT"
fi
echo "Hourglyph is uninstalled."
