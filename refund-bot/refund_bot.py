#!/usr/bin/env python3
"""
返金ステータス Discord 通知 Bot
----------------------------------------
Google スプレッドシートから返金申請データを読み取り、
未対応・遅延案件を毎朝 Discord に通知します。

設定方法: config.json を編集してください
"""

import json
import os
import sys
import requests
from datetime import datetime
import gspread
from google.oauth2.service_account import Credentials

# ========================
# 設定ファイルの読み込み
# ========================
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_PATH = os.path.join(SCRIPT_DIR, "config.json")

def load_config():
    if not os.path.exists(CONFIG_PATH):
        print(f"❌ 設定ファイルが見つかりません: {CONFIG_PATH}")
        print("   config.json.example をコピーして config.json を作成してください。")
        sys.exit(1)
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

# ========================
# Google Sheets 読み取り
# ========================
SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets.readonly",
    "https://www.googleapis.com/auth/drive.readonly",
]

def get_sheet_data(config):
    """Google Sheets からデータを取得して辞書のリストで返す"""
    creds_path = os.path.join(SCRIPT_DIR, config["google"]["credentials_file"])
    creds = Credentials.from_service_account_file(creds_path, scopes=SCOPES)
    client = gspread.authorize(creds)

    spreadsheet_id = config["google"]["spreadsheet_id"]
    sheet_name = config["google"]["sheet_name"]

    sheet = client.open_by_key(spreadsheet_id).worksheet(sheet_name)
    records = sheet.get_all_records()
    print(f"  📄 スプレッドシートから {len(records)} 行取得しました")
    return records

# ========================
# データ分析
# ========================

def parse_date(date_str):
    """複数フォーマットに対応した日付パース"""
    for fmt in ["%Y/%m/%d", "%Y-%m-%d", "%m/%d/%Y", "%Y年%m月%d日"]:
        try:
            return datetime.strptime(str(date_str).strip(), fmt)
        except ValueError:
            continue
    return None

def analyze_refunds(records, config):
    """
    返金データを分析して3種類に分類する
    - pending   : 未対応（ステータスが未対応系）
    - delayed   : 遅延（処理中 かつ N日以上経過）
    - processing: 処理中（通常）
    """
    col = config["columns"]
    status_cfg = config["statuses"]

    pending_keywords    = status_cfg["pending"]
    processing_keywords = status_cfg["processing"]
    delay_days          = status_cfg["delay_threshold_days"]

    today = datetime.today()
    pending    = []
    processing = []
    delayed    = []

    for row in records:
        status   = str(row.get(col["status"],   "")).strip()
        customer = str(row.get(col["customer"], "")).strip()
        amount   = row.get(col["amount"], "")
        date_str = str(row.get(col["date"],     "")).strip()
        notes    = str(row.get(col["notes"],    "")).strip()

        if not customer or not status:
            continue

        request_date  = parse_date(date_str)
        days_elapsed  = (today - request_date).days if request_date else None

        item = {
            "customer":     customer,
            "amount":       amount,
            "date":         date_str,
            "status":       status,
            "notes":        notes,
            "days_elapsed": days_elapsed,
        }

        if any(kw in status for kw in pending_keywords):
            pending.append(item)
        elif any(kw in status for kw in processing_keywords):
            if days_elapsed is not None and days_elapsed >= delay_days:
                delayed.append(item)
            else:
                processing.append(item)

    return pending, processing, delayed

# ========================
# Discord メッセージ生成
# ========================

def fmt_amount(amount):
    try:
        return f"¥{int(amount):,}"
    except (ValueError, TypeError):
        return str(amount) if amount else "金額不明"

def build_message(pending, processing, delayed, config):
    today_str = datetime.today().strftime("%Y年%m月%d日")
    delay_days = config["statuses"]["delay_threshold_days"]

    lines = [f"## 📋 返金ステータス日次レポート（{today_str}）\n"]

    # ── 未対応 ──
    if pending:
        lines.append(f"### 🔴 未対応の返金申請（{len(pending)}件）")
        for item in pending:
            lines.append(f"- **{item['customer']}** | {fmt_amount(item['amount'])} | 申請日: {item['date']}")
            if item["notes"]:
                lines.append(f"  > {item['notes']}")
    else:
        lines.append("### ✅ 未対応の返金申請: なし")

    lines.append("")

    # ── 遅延 ──
    if delayed:
        lines.append(f"### 🟡 処理中・遅延案件（{len(delayed)}件）※{delay_days}日以上経過")
        for item in delayed:
            days_str = f"（{item['days_elapsed']}日経過）" if item["days_elapsed"] is not None else ""
            lines.append(f"- **{item['customer']}** | {fmt_amount(item['amount'])} | {item['status']}{days_str}")
            if item["notes"]:
                lines.append(f"  > {item['notes']}")
    else:
        lines.append("### ✅ 処理中・遅延案件: なし")

    lines.append("")
    lines.append(f"*処理中（遅延なし）: {len(processing)}件*")

    return "\n".join(lines)

# ========================
# Discord 送信
# ========================

def send_to_discord(message, webhook_url):
    """2000文字を超える場合は分割して送信"""
    chunks = []
    while len(message) > 1900:
        split_at = message.rfind("\n", 0, 1900)
        if split_at == -1:
            split_at = 1900
        chunks.append(message[:split_at])
        message = message[split_at:].lstrip("\n")
    chunks.append(message)

    for chunk in chunks:
        resp = requests.post(webhook_url, json={"content": chunk})
        resp.raise_for_status()

    print(f"  ✅ Discord に送信完了 ({len(chunks)} メッセージ)")

# ========================
# メイン
# ========================

def main():
    print(f"\n[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] 返金ステータスチェック開始")

    config = load_config()
    webhook_url = config["discord"]["webhook_url"]

    try:
        records = get_sheet_data(config)
        pending, processing, delayed = analyze_refunds(records, config)

        print(f"  分類結果: 未対応={len(pending)}件, 遅延={len(delayed)}件, 処理中={len(processing)}件")

        message = build_message(pending, processing, delayed, config)
        send_to_discord(message, webhook_url)

    except Exception as e:
        print(f"  ❌ エラー発生: {e}")
        error_msg = f"⚠️ **返金Botエラー**\n```\n{e}\n```"
        try:
            send_to_discord(error_msg, webhook_url)
        except Exception:
            pass
        raise

    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] 完了\n")

if __name__ == "__main__":
    main()
