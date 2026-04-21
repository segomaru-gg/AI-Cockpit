#!/usr/bin/env python3
"""
daily-digest.py

毎日23:00に全ドメインのサマリーを収集して Discord に投稿する。
LaunchAgent (com.aicockpit.daily-digest.plist) から自動実行される。

手動実行:
  python3 scripts/daily-digest.py
"""

import datetime
import os
import sys
import re
import urllib.request
import json

SCRIPT_DIR   = os.path.dirname(os.path.abspath(__file__))
COCKPIT_ROOT = os.path.dirname(SCRIPT_DIR)

try:
    sys.path.insert(0, SCRIPT_DIR)
    from discord_config import WEBHOOK_URL
except ImportError:
    print("[ERROR] scripts/discord_config.py が見つかりません")
    sys.exit(1)

# ── ドメイン定義 ───────────────────────────────────────────────
DOMAINS = [
    {"key": "CLOUD",    "path": "domains/business/cloud/_summary.md",       "active": True},
    {"key": "BoaBASE",  "path": "domains/consulting/boabase/_summary.md",    "active": True},
    {"key": "Oduman",   "path": "domains/consulting/oduman/_summary.md",     "active": True},
    {"key": "Aeternum", "path": "domains/brand/_summary.md",                 "active": True},
    {"key": "Operations","path": "domains/operations/_summary.md",           "active": False},
    {"key": "TOEIC",    "path": "domains/learning/toeic/_summary.md",        "active": False},
]

JOURNAL_DIRS = {
    "CLOUD":     "domains/business/cloud/journal",
    "BoaBASE":   "domains/consulting/boabase/journal",
    "Oduman":    "domains/consulting/oduman/journal",
    "Aeternum":  "domains/brand/journal",
    "Operations":"domains/operations/journal",
    "TOEIC":     "domains/learning/toeic/journal",
}

# ── パーサー ──────────────────────────────────────────────────
def extract_section(content, heading):
    """## heading 以下の最初のセクションを抽出する"""
    lines = content.split('\n')
    start = next((i for i, l in enumerate(lines) if l.startswith(f'## {heading}')), None)
    if start is None:
        return ""
    result = []
    for line in lines[start + 1:]:
        if line.startswith('## '):
            break
        result.append(line)
    return '\n'.join(result).strip()

def get_open_tasks(content, max_items=3):
    """Open tasks セクションから未完了タスクを最大 max_items 件取得"""
    section = extract_section(content, "Open tasks")
    tasks = []
    for line in section.split('\n'):
        t = line.strip()
        if not t or t.startswith('#'):
            continue
        # ラベル行（🔴 🟡 🟢 等）はスキップ
        if re.match(r'^-?\s*[🔴🟡🟢⬜📁]', t):
            continue
        # インデントされたサブタスク（スペース2個以上）はスキップ
        if line.startswith('  ') or line.startswith('\t'):
            continue
        # "- [ ] taskid — 日本語説明" 形式: 説明部分を使う
        m = re.match(r'^-\s+(?:\[[ ]\]\s+)?[a-z][a-z0-9-]+\s+[—–-]\s+(.+)$', t)
        if m:
            clean = m.group(1).strip().split('（')[0].strip()
            if len(clean) > 2:
                tasks.append(clean)
                if len(tasks) >= max_items:
                    break
            continue
        # "- [ ] **タスク名**" または "- タスク名" 形式
        m2 = re.match(r'^-\s+(?:\[[ ]\]\s+)?(?:\*\*)?([^\[\]*🔴🟡🟢]{4,}?)(?:\*\*)?(?:\s*[（(].+)?(?:\s*[—–].+)?$', t)
        if m2:
            clean = m2.group(1).strip().replace('**', '').split('（')[0].split(' — ')[0].strip()
            if len(clean) > 2:
                tasks.append(clean)
        if len(tasks) >= max_items:
            break
    return tasks

def get_today_journal(domain_key, today_str):
    """今日の journal エントリがあれば最初の150文字を返す"""
    journal_dir = os.path.join(COCKPIT_ROOT, JOURNAL_DIRS.get(domain_key, ""))
    if not os.path.isdir(journal_dir):
        return None
    for fname in sorted(os.listdir(journal_dir), reverse=True):
        if fname.startswith(today_str) and fname.endswith('.md'):
            fpath = os.path.join(journal_dir, fname)
            with open(fpath, encoding='utf-8') as f:
                content = f.read()
            # What was done セクションを優先、なければ先頭150文字
            section = extract_section(content, "What was done")
            if section:
                lines = [l.strip() for l in section.split('\n') if l.strip().startswith('-')]
                return ' / '.join(lines[:2])
            return content[:150].replace('\n', ' ').strip()
    return None

# ── Discord 投稿 ───────────────────────────────────────────────
def post_to_discord(message):
    payload = json.dumps({"content": message}).encode('utf-8')
    req = urllib.request.Request(
        WEBHOOK_URL,
        data=payload,
        headers={
            'Content-Type': 'application/json',
            'User-Agent': 'DiscordBot (AI-Cockpit, 1.0)'
        },
        method='POST'
    )
    with urllib.request.urlopen(req, timeout=10) as res:
        return res.status

def split_message(text, limit=2000):
    """Discord の2000文字制限に合わせてメッセージを分割"""
    if len(text) <= limit:
        return [text]
    chunks, current = [], ""
    for line in text.split('\n'):
        if len(current) + len(line) + 1 > limit:
            chunks.append(current.strip())
            current = line + '\n'
        else:
            current += line + '\n'
    if current.strip():
        chunks.append(current.strip())
    return chunks

# ── メイン ────────────────────────────────────────────────────
def is_updated_in_period(updated_str, report_date):
    """
    report_date（前日）の 00:00 〜 翌 03:00（27時）の間に更新されたか判定。
    """
    if not updated_str:
        return False
    next_date = (report_date + datetime.timedelta(days=1)).strftime('%Y-%m-%d')
    return updated_str in (report_date.strftime('%Y-%m-%d'), next_date)

def days_since_update(updated_str, today):
    """最終更新から何日経過しているか"""
    if not updated_str:
        return None
    try:
        updated = datetime.date.fromisoformat(updated_str)
        return (today - updated).days
    except ValueError:
        return None

def staleness_label(days):
    """鮮度に応じたアイコンとラベルを返す"""
    if days is None:
        return "⚪", "更新日不明"
    if days == 0 or days == 1:
        return "🟢", None          # 昨日更新済み → アイコンのみ
    if days < 7:
        return "⚪", f"{days}日更新なし"
    if days < 14:
        return "🔴", f"{days}日更新なし ⚠️"
    return "🔴", f"{days}日更新なし 🚨 要確認"

def main():
    now         = datetime.datetime.now()
    # 朝8時実行 → 前日（〜27時）のレポート
    report_date = now.date() - datetime.timedelta(days=1)
    report_str  = report_date.strftime('%Y-%m-%d')
    weekday_jp  = ['月', '火', '水', '木', '金', '土', '日']
    wd          = weekday_jp[report_date.weekday()]

    lines = []
    lines.append(f"☀️ **AI-Cockpit 前日レポート — {report_str}（{wd}）**")
    lines.append(f"_（〜27時までの活動まとめ）_")
    lines.append("")

    active_domains = [d for d in DOMAINS if d["active"]]
    parked_domains = [d for d in DOMAINS if not d["active"]]
    has_activity   = False

    # ── アクティブドメイン ──
    lines.append("**── Active ──**")
    for domain in active_domains:
        fpath = os.path.join(COCKPIT_ROOT, domain["path"])
        if not os.path.exists(fpath):
            lines.append(f"⚪ **{domain['key']}** — `_summary.md` なし")
            continue

        with open(fpath, encoding='utf-8') as f:
            content = f.read()

        # 更新日チェック
        updated_match = re.search(r'_Updated:\s*(\d{4}-\d{2}-\d{2})', content)
        updated_str   = updated_match.group(1) if updated_match else None
        updated       = is_updated_in_period(updated_str, report_date)
        days          = days_since_update(updated_str, report_date)
        icon, label   = staleness_label(days)
        if updated:
            has_activity = True

        tasks        = get_open_tasks(content, max_items=3)
        journal_note = get_today_journal(domain["key"], report_str)

        if updated:
            lines.append(f"{icon} **{domain['key']}**")
            if journal_note:
                lines.append(f"  📓 {journal_note}")
            if tasks:
                for t in tasks:
                    lines.append(f"  • {t}")
        else:
            suffix = f" — {label}" if label else ""
            lines.append(f"{icon} **{domain['key']}**{suffix}")

    # ── パーク中ドメイン（簡易表示）──
    lines.append("")
    lines.append("**── Parked ──**")
    for domain in parked_domains:
        lines.append(f"⚫ **{domain['key']}** — 対応待ち")

    # ── フッター ──
    lines.append("")
    if not has_activity:
        lines.append("_昨日はセッション活動なし_")
    lines.append(f"_generated by AI-Cockpit @ {now.strftime('%H:%M')}_")

    message = '\n'.join(lines)

    # 投稿
    chunks = split_message(message)
    for i, chunk in enumerate(chunks):
        status = post_to_discord(chunk)
        if status == 204:
            print(f"✅ Discord 投稿完了 ({i+1}/{len(chunks)})")
        else:
            print(f"[ERROR] Discord 投稿失敗 (HTTP {status})")
            sys.exit(1)

if __name__ == '__main__':
    main()
