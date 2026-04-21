# BoaBASE — Agent Instructions

> Global protocol: [AGENTS.md](../../../AGENTS.md)
> This session is scoped to **BoaBASE** only.

## Session Startup

1. Read `_summary.md` in this folder — current phase, open tasks, blockers
2. If deeper context is needed: `tasks/2026-Q2-active.md` or `journal/`
3. Do NOT load other domains

## Key files

| ファイル | 用途 |
|---|---|
| `_summary.md` | 現状サマリー（毎セッション更新） |
| `tasks/2026-Q2-active.md` | Q2 アクティブタスク一覧 |
| `journal/` | 意思決定・MTG記録 |
| `docs/` | イベント・インフラ設計ドキュメント |
| `MTG議事録_*.md` | 定例MTG議事録 |

## Context（3行）

シーシャバー「BoaBASE」の経営支援。月5万円＋別途契約。
Ops→Culture移行 と Concept Driven制度化 の2ゴール並走。
4/21 MTGでQ2再始動。インフラ整備完了、LP制作・物販フェーズへ。

## Session Close（必須）

セッション終了時は **"Close Session"** と入力する。

しばらく離れていた場合は **"Resume"** と入力する。
エージェントが離脱期間・期限切れタスク・優先度を整理して再始動ブリーフィングを出す。
エージェントが `_summary.md` 更新 + journal 記録 を自動で実行する。
→ ルート `DASHBOARD.md` が自動再生成され、23:00の日次レポートに反映される。
