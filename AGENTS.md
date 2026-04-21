# AI-Cockpit: Agent Handbook

> このファイルは、AI-Cockpit リポジトリで作業する **すべてのAIエージェント** が従うべきプロトコルです。
> Gemini, Claude, ChatGPT, Cursor — ツールに関係なく、このルールが適用されます。

---

## 1. Project Identification

- `blueprint.yaml` を含むディレクトリが「プロジェクト」である。
- `blueprint.yaml` はエージェントが勝手に変更しないこと（明示的に依頼された場合を除く）。

## 2. Task Management（必須）

- すべてのタスクは各プロジェクトの `tasks/` ディレクトリに Markdown ファイルとして保存する。
- 各タスクには以下の frontmatter を含めること:
  ```markdown
  ---
  title: "タスクの説明"
  phase: "フェーズ名"
  status: "pending" | "doing" | "done"
  priority: "high" | "medium" | "low"
  order: 1
  deadline: "YYYY-MM-DD"
  ---
  ```
- `doing` は現在作業中のタスクに使用。
- **進捗計算ルール**: `doing` タスクは **50% 完了** として計上する。
- **期限ルール**: すべてのタスクに `deadline` フィールドを含めること。不明な場合はプロジェクトの文脈から推定する。
- `done` は完全に検証済みのタスクにのみ使用。

## 3. Decision Logging（必須）

- すべての重要な変更・決定・マイルストーンは `journal/` ディレクトリに記録する。
- 命名規則: `YYYY-MM-DD-short-description.md`
- 簡潔かつ記述的に。最初の 150 文字がダッシュボードのプレビューに使用される。

## 4. Cross-Project Operations

- プロジェクト間を移動する場合（例: Cockpit → Oduman）、対象プロジェクトのプロトコル状態を最初に確認する。
- プロトコル要素が不足している場合、Blueprint Protocol に従い初期化する。

## 5. Dashboard Alignment

- `domains/cockpit-core/` の Master Dashboard が人間向けの **真実の源泉（Single Source of Truth）** である。
- `tasks/` と `journal/` の更新が正しく行われ、ダッシュボードに反映されることを確認する。

## 6. Autonomous Lifecycle Management（重要）

- **人間からの指示を待たないこと**: マイルストーン完了後・重要な変更後・セッション終了時に、以下を **自発的に** 実行すること:
  1. 関連するタスクの status を `done` に更新。
  2. `journal/` に作業サマリーのエントリを作成。
  3. 必要に応じて GitHub への push を提案。

## 7. Session Initialization（必須）

- セッション開始時の **最初のアクション** として:
  1. 現在のプロジェクトの `tasks/` をスキャン。
  2. `status: "doing"` または `status: "pending"` の最優先タスクを特定。
  3. ユーザーに報告: 「[プロジェクト名] の現在のフォーカス: **[タスク名]**」

## 8. Obsidian Mobile Sync (SegoOS)

- ユーザーは **Obsidian Mobile**（iCloud 経由）で外出先からメモを取り、プロジェクト状況を確認する。
- **Sync Protocol**:
  - PC → Mobile: `.md` / `.yaml` ファイルが Obsidian Vault にミラーリングされる。
  - Mobile → PC: `00_Inbox` のメモが `AI-Cockpit/_intake/` に取り込まれる。
- **エージェントの責務**:
  - セッション開始時に `_intake/` ディレクトリを確認する。
  - 新しいメモがあれば、ユーザーの最新の思考として最優先で処理する。
  - 処理済みのファイルはアーカイブまたは削除し、inbox を清潔に保つ。

## 9. Phase 1 Manual Agent Simulation

- 現在は **Phase 1: Manual Agent Simulation** にあります。
- ユーザーが以下のトリガーフレーズを発行した場合、`agents/` ディレクトリ内の対応するプロンプト定義に従い、手動エージェントとして振る舞ってください。
  - **"Run Inbox"** → `agents/inbox_processor.md`
  - **"Update Tasks"** → `agents/task_updater.md`
  - **"Generate Journal"** → `agents/journal_generator.md`
  - **"Update Dashboard"** → `agents/dashboard_updater.md`
  - **"Close Session"** → `agents/session_closer.md`
  - **"Resume"** → `agents/reentry.md`

---

## 10. Work Timer Protocol（added 2026-04-22）

### コンセプト
**各タスクファイルに作業時間が蓄積される。** ドメインのどのタスクに何時間使ったかが、タスクを開けばわかる状態を目指す。

### トリガーコマンド

| ユーザー入力 | エージェントの動作 |
|---|---|
| `Start: [タスクのキーワードやファイル名]` | 対象タスクファイルを検索・特定し、現在時刻を記録。「⏱ 計測開始: [タスク名]」と返答 |
| `Stop` | 経過時間を計算し、①タスクファイルを更新 ②time-log.csvに追記。「✅ [X分] 記録しました」と返答 |
| `今日の時間まとめて` | `time-log.csv` を読み、ドメイン別・タスク別集計をチャットに表示 |
| `今週の時間まとめて` | 同上、今週分を集計 |
| `[ドメイン]の時間を見せて` | 指定ドメインのタスク別時間一覧を表示 |

### Stop 時のタスクファイル更新手順

**1. frontmatter に `time_spent_min` を追記/更新する**
```yaml
---
title: "タスク名"
status: "doing"
time_spent_min: 145   ← 累積分数（なければ追記、あれば加算して更新）
---
```

**2. ファイル末尾に `## ⏱ 作業ログ` セクションを追記/更新する**
```markdown
## ⏱ 作業ログ
| 日付 | 開始 | 終了 | 時間 | メモ |
|------|------|------|------|------|
| 2026-04-22 | 00:20 | 00:53 | 33分 | - |
| 2026-04-23 | 10:00 | 11:52 | 112分 | - |
```
（セクションが既に存在する場合は新しい行を追加する）

**3. `/AI-Cockpit/time-tracking/time-log.csv` に1行追記する**
CSV列: `date,start_time,end_time,duration_min,domain,task_file,task_title,notes`

### タスクファイル検索ルール
- `Start: T-001` → `domains/[domain]/tasks/` 以下のファイルからタイトルやIDで検索
- `Start: Vape` → タイトルに"Vape"を含むタスクファイルを検索
- 複数候補がある場合はユーザーに確認する
- 見つからない場合はフリーテキストとして `time-log.csv` のみに記録する

### ドメイン識別子
`consulting` / `brand` / `learning` / `business` / `operations` / `cockpit-core`

### 未計測タスクの扱い
- チャット外で実施したタスク（会議、電話、外出先での作業など）は `Start/Stop` なしで完了することがある
- そのようなタスクは `time_spent_min` が存在しない状態になる → **「未計測」扱い**
- 日報（journal）・Close Session 報告では「未計測」として明示的に表示する
- Close Session 時に未計測タスクが検出された場合、エージェントはユーザーに時間を確認する（`agents/session_closer.md` Step 2 参照）

### その他のルール
- 日付・時刻はJST（日本時間）で記録する
- `Stop` なしで次の `Start` が来た場合は、前のセッションを自動的に終了して記録する
- `time_spent_min` は累積値（セッションごとに加算）
- 手動入力された時間は CSV の `notes` 列に「手動入力」と記載する

---

## 11. Session Startup Protocol（Token Efficiency — added 2026-04-21）

### Startup sequence
1. `/AI-Cockpit/DASHBOARD.md` のみ読み込む（Layer 1）
2. ユーザーに確認: 「今日のフォーカスドメインは？」
3. 指定ドメインの `_summary.md` のみ読み込む（Layer 2）
4. `tasks/*.md` の詳細読み込みはユーザーの明示的な要求があった場合のみ（Layer 3）

### Startup 時の禁止事項
- 明示的な指示なしに `domains/*/tasks/` を全スキャンすること
- 明示的な指示なしに `blueprint.yaml` を読み込むこと
- 同時に2ドメイン以上の `_summary.md` を読み込むこと

### Token budget targets
- Layer 1（DASHBOARD.md + AGENTS condensed）: ≤ 1,500 tokens
- Layer 2（対象ドメインの `_summary.md`）: ≤ 500 tokens per domain
- Layer 3（tasks/journal 詳細）: ≤ 3,000 tokens per session
- 警告閾値: 合計 6,000 tokens
