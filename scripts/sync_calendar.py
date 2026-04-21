#!/usr/bin/env python3
"""
AI-Cockpit / Calendar Sync (macOS Calendar.app版)
対象: macOSのカレンダー.app内「R SEGO」カレンダーのみ
出力: AI-Cockpit/_intake/YYYY-MM-DD-calendar.md
依存: macOS のみ。APIキー・OAuth不要。
"""

import subprocess
import datetime
import os
import sys

# ── 設定 ────────────────────────────────────────────────────
TARGET_CALENDAR = "segomaru1013@gmail.com"   # カレンダー名（完全一致）

SCRIPT_DIR   = os.path.dirname(os.path.abspath(__file__))
COCKPIT_ROOT = os.path.dirname(SCRIPT_DIR)
INTAKE_DIR   = os.path.join(COCKPIT_ROOT, '_intake')

# ── AppleScript でカレンダーから取得 ─────────────────────────
APPLESCRIPT = """
set targetCalName to "{cal_name}"
set todayStart to current date
set time of todayStart to 0

set todayEnd to current date
set time of todayEnd to 86399

set output to ""

tell application "Calendar"
    set targetCal to missing value
    repeat with c in calendars
        if name of c is targetCalName then
            set targetCal to c
            exit repeat
        end if
    end repeat

    if targetCal is missing value then
        return "ERROR: カレンダー '" & targetCalName & "' が見つかりません"
    end if

    set evList to (every event of targetCal whose start date ≥ todayStart and start date ≤ todayEnd)

    if (count of evList) is 0 then
        return "NONE"
    end if

    repeat with ev in evList
        set evTitle to summary of ev
        set evStart to start date of ev
        set evEnd to end date of ev
        set evLoc to location of ev

        set startHour to hours of evStart
        set startMin to minutes of evStart
        set endHour to hours of evEnd
        set endMin to minutes of evEnd

        -- allday check
        if (startHour = 0 and startMin = 0 and endHour = 0 and endMin = 0) then
            set timeStr to "ALLDAY"
        else
            if startHour < 10 then set startHour to "0" & startHour
            if startMin < 10 then set startMin to "0" & startMin
            if endHour < 10 then set endHour to "0" & endHour
            if endMin < 10 then set endMin to "0" & endMin
            set timeStr to (startHour as text) & ":" & (startMin as text) & "-" & (endHour as text) & ":" & (endMin as text)
        end if

        if evLoc is missing value then set evLoc to ""

        set output to output & timeStr & "|" & evTitle & "|" & evLoc & "\\n"
    end repeat
end tell

return output
""".format(cal_name=TARGET_CALENDAR)


def fetch_events():
    result = subprocess.run(
        ['osascript', '-e', APPLESCRIPT],
        capture_output=True, text=True
    )
    if result.returncode != 0:
        print(f"[ERROR] AppleScript失敗: {result.stderr}")
        sys.exit(1)

    raw = result.stdout.strip()

    if raw.startswith("ERROR:"):
        print(raw)
        sys.exit(1)

    if raw == "NONE" or raw == "":
        return []

    events = []
    for line in raw.split('\n'):
        line = line.strip()
        if not line:
            continue
        parts = line.split('|')
        if len(parts) >= 2:
            events.append({
                'time': parts[0],
                'title': parts[1],
                'location': parts[2] if len(parts) > 2 else ''
            })
    return events


def format_markdown(events):
    today = datetime.date.today()
    weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    weekday_jp = ['月', '火', '水', '木', '金', '土', '日']
    wd = today.weekday()

    now_str = datetime.datetime.now().strftime('%H:%M')
    lines = [
        f"# 今日の予定 — {today.strftime('%Y-%m-%d')}（{weekday_jp[wd]}）",
        f"_取得元: {TARGET_CALENDAR} | 生成: {now_str}_",
        ""
    ]

    if not events:
        lines.append("予定なし")
        return '\n'.join(lines)

    # 終日イベントを後ろに
    timed   = [e for e in events if e['time'] != 'ALLDAY']
    alldays = [e for e in events if e['time'] == 'ALLDAY']

    timed.sort(key=lambda e: e['time'])

    for e in timed:
        t = e['time'].replace('-', '〜')
        loc = f" 📍{e['location']}" if e['location'] else ''
        lines.append(f"- {t} **{e['title']}**{loc}")

    for e in alldays:
        lines.append(f"- （終日）{e['title']}")

    return '\n'.join(lines)


def write_intake(content):
    today = datetime.date.today()
    os.makedirs(INTAKE_DIR, exist_ok=True)
    filepath = os.path.join(INTAKE_DIR, f"{today.strftime('%Y-%m-%d')}-calendar.md")
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    return filepath


def main():
    print(f"カレンダー取得中: [{TARGET_CALENDAR}]...")
    events  = fetch_events()
    content = format_markdown(events)
    path    = write_intake(content)
    print(f"✅ 完了: {path}")
    print(f"   予定: {len(events)} 件")
    if events:
        for e in events:
            t = e['time'].replace('-', '〜') if e['time'] != 'ALLDAY' else '終日'
            print(f"   - {t} {e['title']}")


if __name__ == '__main__':
    main()
