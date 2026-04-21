# Google Calendar 同期 — セットアップ手順

## 概要
`sync_calendar.py` を実行すると、**R SEGO（プライマリカレンダー）のみ**から
当日の予定を取得し `_intake/YYYY-MM-DD-calendar.md` に書き出します。

---

## Step 1: Pythonパッケージをインストール

ターミナルで以下を実行：

```bash
pip3 install google-api-python-client google-auth-httplib2 google-auth-oauthlib pytz
```

---

## Step 2: Google Cloud Console で認証情報を作成

1. https://console.cloud.google.com/ を開く
2. 新規プロジェクトを作成（例: `ai-cockpit-calendar`）
3. 左メニュー → **APIとサービス** → **ライブラリ**
4. 「Google Calendar API」を検索 → **有効にする**
5. 左メニュー → **APIとサービス** → **認証情報**
6. **認証情報を作成** → **OAuthクライアントID**
7. アプリケーションの種類: **デスクトップアプリ**
8. 名前: `AI-Cockpit`（なんでもOK）
9. **作成** → **JSONをダウンロード**
10. ダウンロードしたファイルを以下の名前にリネームして配置：

```
AI-Cockpit/scripts/calendar_credentials.json
```

> ⚠️ このファイルは `.gitignore` に追加済み。Gitにはコミットしないこと。

---

## Step 3: 初回認証（初回のみ）

ターミナルで以下を実行：

```bash
cd /path/to/AI-Cockpit
python3 scripts/sync_calendar.py
```

ブラウザが自動で開くので、Googleアカウントでログイン → アクセスを許可。
完了すると `scripts/calendar_token.json` が自動生成される（以後は不要）。

動作確認：

```bash
cat _intake/$(date +%Y-%m-%d)-calendar.md
```

---

## Step 4: Mac起動時に自動実行する設定

### plistファイルのパスを修正

`scripts/com.aicockpit.calendar-sync.plist` を開き、
`/Users/YOURNAME/AI-Cockpit/` の部分を実際のパスに変更する。

実際のパスを確認するには：

```bash
cd /path/to/AI-Cockpit && pwd
```

### LaunchAgentとして登録

```bash
cp /path/to/AI-Cockpit/scripts/com.aicockpit.calendar-sync.plist \
   ~/Library/LaunchAgents/com.aicockpit.calendar-sync.plist

launchctl load ~/Library/LaunchAgents/com.aicockpit.calendar-sync.plist
```

次回のMacログイン時から自動実行されます。

---

## 手動実行（任意）

Coworkセッション開始前に手動で実行する場合：

```bash
python3 /path/to/AI-Cockpit/scripts/sync_calendar.py
```

---

## 出力ファイルの例

```markdown
# 今日の予定 — 2026-04-21 (Tuesday)
_取得元: R SEGO (primary) | 生成: 09:03_

- 10:00〜11:00 **CLOUD mtg**
- 14:00〜15:30 **BoaBASE オーナー打合せ** 📍BoaBASE
- （終日）**誕生日: ○○さん**
```

---

## トラブルシューティング

| 症状 | 対処 |
|------|------|
| `ModuleNotFoundError` | Step 1のpip3コマンドを再実行 |
| ブラウザが開かない | ターミナルに表示されるURLを手動でブラウザに貼る |
| 予定が0件になる | Google Cloud ConsoleでCalendar APIが有効か確認 |
| token期限切れエラー | `scripts/calendar_token.json` を削除して再認証 |
