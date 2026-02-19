---
title: "Phase 14: デジタルツインの器を用意する (Discord Bot)"
date: 2026-02-17
category: "Engineering Log"
---

## 🤖 Phase 14: Discord Bot Integration
外出先から自宅の最強コックピット（BluePrint OS）を操作するための「リモコン」として、Discord Botの開発に着手しました。

### コンセプト: "Keep It Simple"
Phase 13（トンネル自動起動の難航）での教訓を活かし、今回のBotも**「必要なときだけ手動で起動する」**設計を採用しました。
常駐サービス化による複雑さを避け、メンテナンス性と確実性を最優先にします。

### 実装状況
Botの「身体（コード）」はすでに完成しており、あとは「魂（認証情報）」を入れるだけの状態です。

#### 1. 技術スタック
- **Runtime**: Node.js
- **Library**: `discord.js` (v14)
- **Commands**: Slash Commands (`/status` etc.)

#### 2. ファイル構成
- `scripts/discord-bot.js`: Botのメインロジック。
- `scripts/register-commands.js`: Discordサーバーにコマンドを登録するスクリプト。
- `start_bot.sh`: 一発起動用のシェルスクリプト。

#### 3. 実装済みの機能
- **/ping**: 生存確認（Pong!と返します）。
- **/status**: システムの稼働状況とダッシュボードURL（`cockpit.aeternum-gg.jp`）を返します。
- **/log**: （準備中）最新のアクティビティログを取得する予定です。

### Next Step
ユーザーにてDiscord Developer Portalでのアプリケーション作成・Token取得が完了次第、認証情報を設定して起動テストを行います。
これが完了すれば、スマホのDiscordアプリから自宅のOSと対話できるようになります。
