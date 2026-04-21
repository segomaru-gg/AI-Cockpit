#!/usr/bin/env node
/**
 * sync-dashboard.js
 *
 * 全ドメインの _summary.md を読み取り、ルートの DASHBOARD.md を自動再生成する。
 *
 * 単独実行:
 *   node scripts/sync-dashboard.js
 *
 * watch-dashboard.js からも呼び出される。
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const COCKPIT_ROOT   = path.resolve(__dirname, '..');
const DASHBOARD_PATH = path.join(COCKPIT_ROOT, 'DASHBOARD.md');

// ──────────────────────────────────────────────
// ドメイン定義
//   active: true  → "Active domains" テーブルに掲載
//   active: false → "Parked" セクションに掲載
// ──────────────────────────────────────────────
const DOMAINS = [
  { key: 'CLOUD',           summaryPath: 'domains/business/cloud/_summary.md',       active: true,  priority: 1 },
  { key: 'BoaBASE',         summaryPath: 'domains/consulting/boabase/_summary.md',    active: true,  priority: 2 },
  { key: 'Oduman',          summaryPath: 'domains/consulting/oduman/_summary.md',     active: true,  priority: 3 },
  { key: 'Aeternum',        summaryPath: 'domains/brand/_summary.md',                 active: true,  priority: 4 },
  { key: 'Operations',      summaryPath: 'domains/operations/_summary.md',            active: false, priority: 5 },
  { key: 'TOEIC',           summaryPath: 'domains/learning/toeic/_summary.md',        active: false, priority: 6 },
  { key: 'Cockpit Control', summaryPath: 'domains/cockpit-core/_summary.md',          active: false, priority: 7 },
];

// ──────────────────────────────────────────────
// _summary.md パーサー
// ──────────────────────────────────────────────
function parseSummary(content) {
  const lines = content.split('\n');

  // Context セクションから2〜3行目（フェーズ・状態情報）を取得
  const ctxStart = lines.findIndex(l => l.startsWith('## Context'));
  const contextLines = [];
  if (ctxStart >= 0) {
    for (let i = ctxStart + 1; i < lines.length; i++) {
      if (lines[i].startsWith('##')) break;
      const t = lines[i].trim();
      if (t) contextLines.push(t);
    }
  }
  // 1行目=説明、2行目以降=状態。2行目があれば優先、なければ1行目
  const statusLine = (contextLines[1] || contextLines[0] || '状態不明')
    .replace(/。$/, '');  // 末尾の句点を除去

  // Open tasks セクションから最初の実タスクを取得
  const taskStart = lines.findIndex(l => l.startsWith('## Open tasks'));
  let nextAction = '—';
  if (taskStart >= 0) {
    for (let i = taskStart + 1; i < lines.length; i++) {
      if (lines[i].startsWith('##')) break;
      const t = lines[i].trim();
      // スキップ: 見出し行・空行・セクションラベル（🔴 等）
      if (!t || /^[#*]/.test(t) || /^[🔴🟡🟢⬜📁]/.test(t)) continue;
      // "- [ ] taskid — 日本語説明" 形式: 説明部分を優先
      const withDesc = t.match(/^-\s+(?:\[[ x]\]\s+)?[a-z][a-z0-9-]+\s+[—–-]\s+(.+)$/);
      if (withDesc) {
        nextAction = withDesc[1].trim().split(/\s*[（(]/)[0].trim();
        if (nextAction.length > 2) break;
      }
      // "- [ ] **タスク名**" または "- [ ] タスク名" 形式
      const plain = t.match(/^-\s+(?:\[[ x]\]\s+)?(?:\*\*)?([^\[\]*]{4,}?)(?:\*\*)?(?:\s*[（(].+)?(?:\s*—.+)?$/);
      if (plain) {
        nextAction = plain[1].trim().replace(/\*\*/g, '').split(/\s*[（(]/)[0].split(/\s+—/)[0].trim();
        if (nextAction.length > 2) break;
      }
    }
  }

  return { statusLine, nextAction };
}

// ──────────────────────────────────────────────
// DASHBOARD.md 生成
// ──────────────────────────────────────────────
function generateDashboard(domainData) {
  const today = new Date();
  const dateStr = today.toLocaleDateString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric', month: '2-digit', day: '2-digit'
  }).replace(/\//g, '-');

  // 既存ダッシュボードから "Today's intent" を保持
  let todayIntent = '<!-- セッション開始時にここを1〜2行で書き換える -->';
  if (fs.existsSync(DASHBOARD_PATH)) {
    const existing = fs.readFileSync(DASHBOARD_PATH, 'utf8');
    const m = existing.match(/## Today's intent\n([\s\S]*?)(?=\n## )/);
    if (m) todayIntent = m[1].trim();
  }

  const active = domainData.filter(d => d.active);
  const parked = domainData.filter(d => !d.active);

  let md = `# AI-Cockpit Dashboard\n`;
  md += `_Phase: Stabilization | Updated: ${dateStr}_\n\n`;

  md += `## Active domains\n\n`;
  md += `| Priority | Domain | 1-line status | Next action |\n`;
  md += `|----------|--------|---------------|-------------|\n`;
  for (const d of active) {
    md += `| #${d.priority} | **${d.key}** | ${d.statusLine} | ${d.nextAction} |\n`;
  }

  md += `\n## Parked (no action needed this week)\n\n`;
  for (const d of parked) {
    md += `- **${d.key}** — ${d.statusLine}\n`;
  }

  md += `\n## Today's intent\n`;
  md += `${todayIntent}\n\n`;

  md += `## AI session protocol (condensed)\n`;
  md += `- **Start here. Do NOT scan domains/ on startup.**\n`;
  md += `- Ask user: "今日のフォーカスドメインは？"\n`;
  md += `- Load \`_summary.md\` for that domain only (Layer 2).\n`;
  md += `- Load \`tasks/*.md\` only when explicitly requested (Layer 3).\n`;
  md += `- Token budget: Layer1 ≤1500 / Layer2 ≤500 per domain / Layer3 ≤3000 per session.\n`;

  return md;
}

// ──────────────────────────────────────────────
// メイン
// ──────────────────────────────────────────────
export function syncDashboard() {
  const domainData = DOMAINS.map(domain => {
    const summaryPath = path.join(COCKPIT_ROOT, domain.summaryPath);
    let statusLine = '状態不明';
    let nextAction  = '—';

    if (fs.existsSync(summaryPath)) {
      try {
        const content = fs.readFileSync(summaryPath, 'utf8');
        ({ statusLine, nextAction } = parseSummary(content));
      } catch (e) {
        console.error(`  ⚠ ${domain.key} の読み込みエラー: ${e.message}`);
      }
    } else {
      statusLine = `_summary.md 未作成`;
    }

    return { ...domain, statusLine, nextAction };
  });

  const markdown = generateDashboard(domainData);
  fs.writeFileSync(DASHBOARD_PATH, markdown, 'utf8');

  const ts = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
  console.log(`[${ts}] ✅ DASHBOARD.md を更新しました`);
  return domainData;
}

// 直接実行時
syncDashboard();
