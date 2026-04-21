# Work Timer Log

## コンセプト
**各タスクファイルに作業時間が蓄積される。**  
`Stop` のたびに、該当タスクの `.md` ファイルが自動更新される。

---

## 使い方（CoWorkチャットで話しかけるだけ）

### 計測開始
```
Start: [タスクのキーワード or ファイル名]
```
例:
- `Start: T-001` — タスクIDで指定
- `Start: Vape` — キーワードで検索（候補が複数あれば確認される）
- `Start: Oduman ミーティング準備`

### 計測終了
```
Stop
```

### 集計・確認
```
今日の時間まとめて
今週の時間まとめて
businessの時間を見せて
```

---

## Stop 時に自動で起きること

1. **タスクの .md ファイルが更新される**
   - frontmatter に `time_spent_min` が追記/加算される
   - ファイル末尾に `## ⏱ 作業ログ` テーブルが追記される

2. **time-log.csv に1行追記される**（全ログの台帳）

---

## ドメイン一覧
- `consulting` — Oduman, boabase
- `brand` — boabase-shop, nexus, aeternum 等
- `learning` — TOEIC 等
- `business` — CLOUD 等
- `operations` — オペレーション
- `cockpit-core` — AI-Cockpit 整備

---

## データ形式（time-log.csv）
| 列 | 内容 |
|----|------|
| date | 日付（YYYY-MM-DD） |
| start_time | 開始時刻（HH:MM、JST） |
| end_time | 終了時刻（HH:MM、JST） |
| duration_min | 作業時間（分） |
| domain | ドメイン名 |
| task_file | タスクファイルの相対パス |
| task_title | タスクのタイトル |
| notes | メモ（任意） |
