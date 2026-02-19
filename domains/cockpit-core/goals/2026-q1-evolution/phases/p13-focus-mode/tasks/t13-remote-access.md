---
title: "リモートアクセス（Cloudflare Tunnel）"
phase: "Phase 13: Remote Access"
status: "pending"
priority: "high"
deadline: "2026-02-17"
order: 13
---

**背景**:
Phase 12でモバイル表示を最適化したが、現在ローカルネットワーク（localhost）でしかアクセスできない。
外出先やテザリング環境下でもダッシュボードを確認できるようにするため、Cloudflare Tunnelを導入して安全に外部公開する。

**要件**:
- ポート開放不要で、NAT配下からでも外部アクセス可能にする
- 固定のURL（Cloudflare Tryまたはカスタムドメイン）でアクセスできること
- Mac再起動後も自動的にトンネルが復帰すること（デーモン化）

**完了条件**:
- [ ] `cloudflared` のインストール確認 <!-- id: 19 -->
- [ ] トンネルの起動と動作確認（localhost:4321へのプロキシ） <!-- id: 20 -->
- [ ] 外部URLからのアクセス確認（スマホ実機） <!-- id: 21 -->
- [ ] 自動起動設定（launchd / service install） <!-- id: 22 -->
