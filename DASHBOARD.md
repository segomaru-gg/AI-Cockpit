# AI-Cockpit Dashboard
_Phase: Stabilization | Updated: 2026-04-22_

## Active domains

| Priority | Domain | 1-line status | Next action |
|----------|--------|---------------|-------------|
| #1 | **CLOUD** | 2027年3月末にボードメンバー参画の可否判断。現在Phase 1（業務理解・基盤参加）進行中（〜2026-07-01） | — |
| #2 | **BoaBASE** | 2ゴール並走: ①Ops→Culture/Brand経営への移行（自律運営状態の確立）②Concept Driven（ブランド拡張者）ポジションの制度化 | Slackログbot導入 |
| #3 | **Oduman** | Phase 1: Recovery Flow — 71%完了（元DUE: 2026-03-15） | 競合価格差分調査 |
| #4 | **Aeternum** | Brand LP（Aeternum）は `done`。CozyNight展示は完了済み | Concept Driven思想の構造抽出フェーズ |

## Parked (no action needed this week)

- **Operations** — 初年度の確定申告を対象に、提出目標2026-03-09で立ち上げ
- **TOEIC** — Phase 1: Gold Phrase学習（文法特急の読破）が `doing` で進行中
- **Cockpit Control** — ゴール: 2026-q1-evolution（期限切れ）。モバイル対応・フォーカスモード・活動ログ等を開発中

## Today's intent
<!-- セッション開始時にここを1〜2行で書き換える -->

## AI session protocol (condensed)
- **Start here. Do NOT scan domains/ on startup.**
- Ask user: "今日のフォーカスドメインは？"
- Load `_summary.md` for that domain only (Layer 2).
- Load `tasks/*.md` only when explicitly requested (Layer 3).
- Token budget: Layer1 ≤1500 / Layer2 ≤500 per domain / Layer3 ≤3000 per session.
