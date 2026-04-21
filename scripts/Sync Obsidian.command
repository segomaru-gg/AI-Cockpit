#!/bin/bash
# ダブルクリックで AI-Cockpit ↔ Obsidian を同期するボタン
cd "$(dirname "$0")/.."
./scripts/sync-obsidian.sh
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ 同期完了！このウィンドウは閉じてOK"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
read -p "Enterで閉じる..."
