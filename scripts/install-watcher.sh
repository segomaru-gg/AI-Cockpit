#!/bin/bash
# ============================================================
# install-watcher.sh
#
# AI-Cockpit の LaunchAgent を一括登録する:
#   1. Dashboard Watcher  — .md 変更を監視して DASHBOARD.md を自動更新
#   2. Daily Digest       — 毎日23:00に全ドメインサマリーを Discord 投稿
#
# 使い方:
#   chmod +x scripts/install-watcher.sh
#   ./scripts/install-watcher.sh
# ============================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
COCKPIT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
LAUNCH_AGENTS="$HOME/Library/LaunchAgents"

echo "🔧 AI-Cockpit LaunchAgent セットアップ"
echo "   AI-Cockpit: $COCKPIT_DIR"
echo ""

# node の存在確認
NODE_PATH=$(command -v node 2>/dev/null || echo "")
if [ -z "$NODE_PATH" ]; then
  echo "❌ node が見つかりません。Node.js をインストールしてください。"
  exit 1
fi
echo "✅ node: $NODE_PATH ($(node --version))"

# python3 の存在確認
PYTHON_PATH=$(command -v python3 2>/dev/null || echo "")
if [ -z "$PYTHON_PATH" ]; then
  echo "❌ python3 が見つかりません。"
  exit 1
fi
echo "✅ python3: $PYTHON_PATH ($(python3 --version))"
echo ""

mkdir -p "$LAUNCH_AGENTS"

# ── 1. Dashboard Watcher ──────────────────────────────────────
WATCHER_LABEL="com.aicockpit.dashboard-watcher"
WATCHER_SRC="$SCRIPT_DIR/com.aicockpit.dashboard-watcher.plist"
WATCHER_DST="$LAUNCH_AGENTS/$WATCHER_LABEL.plist"

launchctl unload "$WATCHER_DST" 2>/dev/null || true
cp "$WATCHER_SRC" "$WATCHER_DST"

echo "🔄 動作テスト: sync-dashboard.js を実行中..."
node "$SCRIPT_DIR/sync-dashboard.js"

launchctl load "$WATCHER_DST"
echo "✅ Dashboard Watcher を登録しました（ログイン時自動起動）"
echo ""

# ── 2. Daily Digest ───────────────────────────────────────────
DIGEST_LABEL="com.aicockpit.daily-digest"
DIGEST_SRC="$SCRIPT_DIR/com.aicockpit.daily-digest.plist"
DIGEST_DST="$LAUNCH_AGENTS/$DIGEST_LABEL.plist"

launchctl unload "$DIGEST_DST" 2>/dev/null || true
cp "$DIGEST_SRC" "$DIGEST_DST"
launchctl load "$DIGEST_DST"
echo "✅ Daily Digest を登録しました（毎日 23:00 に Discord 投稿）"
echo ""

# ── 完了 ──────────────────────────────────────────────────────
echo "🎉 セットアップ完了！"
echo ""
echo "管理コマンド:"
echo "  状態確認    : launchctl list | grep aicockpit"
echo "  Watcher ログ: tail -f /tmp/aicockpit-dashboard-watcher.log"
echo "  Digest ログ : tail -f /tmp/aicockpit-daily-digest.log"
echo "  手動テスト  : python3 $SCRIPT_DIR/daily-digest.py"
echo "  全停止      : launchctl unload $WATCHER_DST && launchctl unload $DIGEST_DST"
