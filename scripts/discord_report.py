#!/usr/bin/env python3
"""
AI-Cockpit / Discord 日報投稿
Claude chatの日報をターミナルに貼り付けてDiscordに投稿する
"""

import datetime
import os
import sys
import urllib.request
import json

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

try:
    sys.path.insert(0, SCRIPT_DIR)
    from discord_config import WEBHOOK_URL
except ImportError:
    print("[ERROR] scripts/discord_config.py が見つかりません")
    sys.exit(1)

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

def main():
    now = datetime.datetime.now()
    # 27時（=翌3時）までは前日扱い
    if now.hour < 3:
        today = now.date() - datetime.timedelta(days=1)
    else:
        today = now.date()
    weekday_jp = ['月', '火', '水', '木', '金', '土', '日']
    wd = weekday_jp[today.weekday()]

    print(f"📋 日報投稿 — {today.strftime('%Y/%m/%d')}（{wd}）")
    print("Claude chatの日報を貼り付けてください。")
    print("貼り付け完了後、Enterを2回押してください。")
    print("─" * 40)

    lines = []
    empty_count = 0
    while True:
        try:
            line = input()
            if line == "":
                empty_count += 1
                if empty_count >= 2:
                    break
                lines.append(line)
            else:
                empty_count = 0
                lines.append(line)
        except EOFError:
            break

    report_body = '\n'.join(lines).strip()

    if not report_body:
        print("内容がありません。終了します。")
        sys.exit(0)

    # Discord用フォーマット（2000文字制限対応）
    header = f"📊 **日報 — {today.strftime('%Y/%m/%d')}（{wd}）**\n"
    full_message = header + report_body

    # 2000文字を超える場合は分割
    if len(full_message) <= 2000:
        messages = [full_message]
    else:
        messages = [header]
        chunk = ""
        for line in report_body.split('\n'):
            if len(chunk) + len(line) + 1 > 1900:
                messages.append(chunk.strip())
                chunk = line + '\n'
            else:
                chunk += line + '\n'
        if chunk.strip():
            messages.append(chunk.strip())

    print("─" * 40)
    print(f"Discordに投稿中... ({len(messages)}件)")

    for i, msg in enumerate(messages):
        status = post_to_discord(msg)
        if status == 204:
            print(f"✅ 投稿完了 ({i+1}/{len(messages)})")
        else:
            print(f"[ERROR] 投稿失敗 (HTTP {status})")
            sys.exit(1)

if __name__ == '__main__':
    main()
