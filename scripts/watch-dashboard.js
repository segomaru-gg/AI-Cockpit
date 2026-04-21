#!/usr/bin/env node
/**
 * watch-dashboard.js
 *
 * ファイル監視デーモン。
 * 各ドメインの _summary.md または tasks/ 配下の .md が変更されると
 * sync-dashboard.js を実行して DASHBOARD.md を自動更新する。
 *
 * 起動:
 *   node scripts/watch-dashboard.js
 *
 * LaunchAgent 経由でログイン時に自動起動する場合は
 *   scripts/com.aicockpit.dashboard-watcher.plist を使用。
 */

import fs   from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename   = fileURLToPath(import.meta.url);
const __dirname    = path.dirname(__filename);
const COCKPIT_ROOT = path.resolve(__dirname, '..');
const SYNC_SCRIPT  = path.join(__dirname, 'sync-dashboard.js');

// ──────────────────────────────────────────────
// 監視対象ディレクトリ（再帰的に監視）
// ──────────────────────────────────────────────
const WATCH_DIRS = [
  'domains/business/cloud',
  'domains/consulting/boabase',
  'domains/consulting/oduman',
  'domains/brand',
  'domains/operations',
  'domains/learning/toeic',
  'domains/cockpit-core',
];

// ──────────────────────────────────────────────
// デバウンス（連続変更をまとめて1回のみ実行）
// ──────────────────────────────────────────────
let debounceTimer = null;
const DEBOUNCE_MS = 600;

function triggerSync(changedFile) {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    const ts = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
    console.log(`[${ts}] 📝 変更検知: ${changedFile}`);

    const result = spawnSync(process.execPath, [SYNC_SCRIPT], {
      cwd: COCKPIT_ROOT,
      encoding: 'utf8',
    });

    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
    if (result.status !== 0) {
      console.error(`  ⚠ sync-dashboard.js がエラーで終了 (code ${result.status})`);
    }
  }, DEBOUNCE_MS);
}

// ──────────────────────────────────────────────
// ウォッチャー起動
// ──────────────────────────────────────────────
let watcherCount = 0;
for (const relDir of WATCH_DIRS) {
  const absDir = path.join(COCKPIT_ROOT, relDir);
  if (!fs.existsSync(absDir)) {
    console.warn(`  ⚠ 監視対象が存在しません: ${relDir}`);
    continue;
  }

  fs.watch(absDir, { recursive: true }, (eventType, filename) => {
    if (!filename) return;
    // .md ファイルの変更のみ対象（DASHBOARD.md 自身の更新ループを防止）
    if (!filename.endsWith('.md')) return;
    if (filename === 'DASHBOARD.md') return;

    triggerSync(path.join(relDir, filename));
  });

  watcherCount++;
}

const ts = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
console.log(`[${ts}] 🔍 AI-Cockpit Dashboard Watcher 起動`);
console.log(`   監視ディレクトリ: ${watcherCount} 件`);
console.log(`   更新先: DASHBOARD.md`);
console.log(`   停止: Ctrl+C\n`);

// 起動時に即時同期
triggerSync('(startup)');
