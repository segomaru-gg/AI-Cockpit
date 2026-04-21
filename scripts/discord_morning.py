#!/usr/bin/env python3
"""
AI-Cockpit / Discord 朝礼投稿
- 今日のカレンダー（_intake/から読み込み）
- CLOUDオープンタスク（_summary.mdから読み込み）
を Discord Webhook に投稿する
"""

import datetime
import os
import sys
import urllib.request
import urllib.parse
import json

SCRIPT_DIR   = os.path.dirname(os.path.abspath(__file__))
COCKPIT_ROOT = os.path.dirname(SCRIPT_DIR)
INTAKE_DIR   = os.path.join(COCKPIT_ROOT, '_intake')
CLOUD_SUMMARY = os.path.join(COCKPIT_ROOT, 'domains', 'business', 'cloud', '_summary.md')

# Webhook URL を設定ファイルから読み込み
try:
    sys.path.insert(0, SCRIPT_DIR)
    from discord_config import WEBHOOK_URL
except ImportError:
    print("[ERROR] scripts/discord_config.py が見つかりません")
    sys.exit(1)

# ── カレンダー読み込み ────────────────────────────────────────
def load_calendar():
    today = datetime.date.today().strftime('%Y-%m-%d')
    filepath = os.path.join(INTAKE_DIR, f"{today}-calendar.md")
    if not os.path.exists(filepath):
        return "（カレンダーデータなし — `cockpit` を先に実行してください）"
    with open(filepath, encoding='utf-8') as f:
        lines = f.readlines()
    # ヘッダー行を除いてイベント行だけ返す
    events = [l.rstrip() for l in lines if l.startswith('- ')]
    if not events:
        return "予定なし"
    return '\n'.join(events)

# ── CLOUDタスク読み込み ───────────────────────────────────────
def load_cloud_tasks():
    if not os.path.exists(CLOUD_SUMMARY):
        return "（_summary.md が見つかりません）"
    with open(CLOUD_SUMMARY, encoding='utf-8') as f:
        content = f.read()
    # "## Open tasks" セクションだけ抽出
    lines = content.split('\n')
    in_section = False
    tasks = []
    for line in lines:
        if line.startswith('## Open tasks'):
            in_section = True
            continue
        if in_section:
            if line.startswith('## '):
                break
            if line.strip():
                tasks.append(line.rstrip())
    if not tasks:
        return "オープンタスクなし"
    return '\n'.join(tasks)

# ── Discord メッセージ生成 ────────────────────────────────────
def build_message():
    today = datetime.date.today()
    weekday_jp = ['月', '火', '水', '木', '金', '土', '日']
    wd = weekday_jp[today.weekday()]
    now = datetime.datetime.now().strftime('%H:%M')

    calendar_text = load_calendar()
    tasks_text    = load_cloud_tasks()

    message = f"""🌅 **おはようございます — {today.strftime('%Y/%m/%d')}（{wd}）**

**📅 今日の予定**
{calendar_text}

**✅ CLOUD オープンタスク**
{tasks_text}

_posted by AI-Cockpit @ {now}_"""
    return message

# ── Webhook 送信 ─────────────────────────────────────────────
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
    with urllib.request.urlopen(req) as res:
        return res.status

# ── メイン ──────────────────────────────────────────────────
def main():
    print("Discord に朝礼を投稿中...")
    message = build_message()
    status  = post_to_discord(message)
    if status == 204:
        print("✅ 投稿完了")
    else:
        print(f"[ERROR] 投稿失敗 (HTTP {status})")

if __name__ == '__main__':
    main()
