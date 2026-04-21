# Work Timer Protocol 導入
_Date: 2026-04-22_

## ⏱ 作業時間
| タスク | 時間 |
|--------|------|
| 時間計測システム構築（設計・実装） | 33分 |
| 合計 | **33分** |

## What was done
- `time-tracking/time-log.csv` を新設（全ドメイン共通の作業ログ台帳）
- `AGENTS.md` Section 10 に Work Timer Protocol を追加
  - `Start: [キーワード]` / `Stop` コマンドでタスクファイルに時間が蓄積される
  - `time_spent_min`（累積）と `## ⏱ 作業ログ` テーブルをタスクMDに自動書き込み
  - チャット外タスクは「未計測」として明示
- `agents/session_closer.md` に Step 2（未計測確認）を追加
  - Close Session 時に未計測タスクを検出してユーザーに時間を確認する
- `agents/journal_generator.md` に `### ⏱ 作業時間` セクションを追加
  - 日報に各タスクの時間（または「未計測」）が自動で入る

## Decisions
- 時間はタスクファイル本体に持たせる（Obsidianからも確認可能）
- 計測できなかったタスクは `未計測` と明示して隠さない
- Close Session が未計測確認のゲートとなる

## Next focus
明日から各ドメインでの実運用開始。使いにくい点が出たら随時改善。
