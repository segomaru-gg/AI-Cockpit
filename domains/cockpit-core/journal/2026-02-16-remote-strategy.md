---
title: "Remote Evolution Strategy: Cloudflare & Discord"
date: "2026-02-16"
tags: ["strategy", "remote", "mobile", "architecture"]
---

# 概要
本日策定した「コックピットのモバイル運用戦略」についての記録。
移動の多いワークスタイル（MacBook Air + テザリング/BoaBASE/自宅）踏まえ、VPNではなくトンネリング技術とChatOpsを採用する。

## 課題
- **Roaming Network**: 自宅、店舗、テザリングとIPアドレスが頻繁に変わる環境下で、安定してローカルサーバー（localhost）にアクセスしたい。
- **Lightweight Ops**: スマホからリッチなダッシュボードを見るだけでなく、通知を受け取って「承認（Approve）」するだけの軽量なアクションを完結させたい。

## 決定事項

### 1. Inbound Access: Cloudflare Tunnel (Phase 13)
- **採用理由**:
    - ポート開放不要で、NAT配下やテザリング環境でも外部公開が可能。
    - `cloudflared` デーモンをMac上で動かすだけで、固定のURL（`https://cockpit-ryosaigo...`）を維持できる。
    - Tailscale（VPN）のように、スマホ側での接続オン/オフ切り替えが不要（URLを叩くだけ）。

### 2. Command & Control: Discord Bot (Phase 14)
- **採用理由**:
    - プッシュ通知基盤として優秀。
    - Interactive Components（ボタン）により、コマンド入力なしで「ワンタップ承認」が実装可能。
- **アーキテクチャ**:
    - Mac上のNode.jsプロセスがファイルシステム（`tasks/*.md`）を監視。
    - エージェントからの承認依頼（`status: doing -> verify`）を検知し、Discordに通知。
    - スマホからのボタン操作を受け取り、ローカルファイルを書き換える。

## ロードマップ
1.  **Phase 12 (Done)**: モバイル表示の最適化（レスポンシブ対応）。
2.  **Phase 13**: `cloudflared` の導入と自動起動設定。
3.  **Phase 14**: Discord Botアカウント作成とローカルサーバー実装。

これで「物理的な場所」と「デバイスの制約」から解放された、真の Life Operating System へと進化する。
