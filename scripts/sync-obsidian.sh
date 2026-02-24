#!/bin/bash
# =============================================================
# AI-Cockpit ↔ Obsidian (iCloud) Sync Script
# =============================================================
# 使い方: ./scripts/sync-obsidian.sh
#
# 何をするか:
#   1. AI-Cockpit の .md/.yaml を SegoOS Vault に同期 (PC → 携帯)
#   2. SegoOS の 00_Inbox を AI-Cockpit/inbox に同期 (携帯 → PC)
# =============================================================

set -e

# パス定義
COCKPIT_DIR="$HOME/AI-Cockpit"
VAULT_DIR="$HOME/Library/Mobile Documents/iCloud~md~obsidian/Documents/SegoOS"
VAULT_COCKPIT="$VAULT_DIR/AI-Cockpit"
INBOX_SRC="$VAULT_DIR/00_Inbox"
INBOX_DST="$COCKPIT_DIR/inbox"

echo "📊 Dashboard MD を生成中..."
node "$COCKPIT_DIR/domains/cockpit-core/scripts/generate-dashboard-md.js"
echo ""

echo "🔄 AI-Cockpit → Obsidian 同期中..."
rsync -av --delete \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='.obsidian' \
  --exclude='.DS_Store' \
  --include='*/' \
  --include='*.md' \
  --include='*.yaml' \
  --exclude='*' \
  "$COCKPIT_DIR/" "$VAULT_COCKPIT/"

echo ""
echo "📱 Obsidian Inbox → AI-Cockpit 同期中..."
mkdir -p "$INBOX_DST"
if [ -d "$INBOX_SRC" ] && [ "$(ls -A "$INBOX_SRC" 2>/dev/null)" ]; then
  rsync -av "$INBOX_SRC/" "$INBOX_DST/"
  echo "✅ Inbox のメモを取り込みました"
else
  echo "📭 Inbox は空です"
fi

echo ""
echo "✅ 同期完了！"
echo "   Vault: $VAULT_COCKPIT"
echo "   Inbox: $INBOX_DST"
