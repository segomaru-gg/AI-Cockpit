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
  - Mobile → PC: `00_Inbox` のメモが `AI-Cockpit/inbox/` に取り込まれる。
- **エージェントの責務**:
  - セッション開始時に `inbox/` ディレクトリを確認する。
  - 新しいメモがあれば、ユーザーの最新の思考として最優先で処理する。
  - 処理済みのファイルはアーカイブまたは削除し、inbox を清潔に保つ。
