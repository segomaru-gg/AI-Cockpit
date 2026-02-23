---
title: "ドメイン構造リファクタリング & グローバル目標システム導入"
date: 2026-02-23
type: session-log
---

## 概要

AI-Cockpit のドメイン構造を大幅にリファクタリングし、グローバル目標（四半期目標）システムを新たに導入した。

## 実施内容

### ドメイン構造の再編成
- **consulting** をマルチプロジェクトドメインに変更（oduman/, boabase/ をサブプロジェクト化）
- **learning** も同様にマルチプロジェクト化（toeic/ をサブプロジェクト化）
- **portfolio** → **brand** にリネーム
- **operations** を事務・雑務ドメインとして再定義
- `discoverProjects()` を2階層対応に拡張

### カテゴリのドメイン統一
- `blueprint.yaml` の `category` フィールドを廃止
- カテゴリをフォルダ構造（ドメイン名）から自動検出する方式に変更
- ダッシュボードのフィルタータグを動的生成に

### グローバル目標システム
- `cockpit.yaml`（リポジトリルート）でQ単位のグローバル目標を定義
- 各ドメインの alignment スコア（1-5）を設定
- `loadGlobalGoals()` 関数で読み込み、各プロジェクトに加重平均スコアを自動計算
- ダッシュボードに GLOBAL_OBJECTIVE セクション追加（P1/P2バッジ付き）
- プロジェクトを alignment スコア順にソート
- AIアドバイスに [STRATEGY]/[BALANCE] ルールを追加

### その他の改善
- `index.astro` の `cockpitRoot` をハードコードから `path.resolve` に修正
- タスクカードの内容を全文表示に変更（300文字制限を撤廃）
- プロジェクトカードのリンクを削除

## 最終構造

```
AI-Cockpit/
├── cockpit.yaml              # グローバル目標定義
├── config/                    # 将来の設定ファイル用
├── domains/
│   ├── brand/                 # Aeternum Portfolio
│   ├── cockpit-core/          # ダッシュボード本体
│   ├── consulting/
│   │   ├── boabase/           # BoaBASE Management
│   │   └── oduman/            # Oduman Consulting
│   ├── learning/
│   │   └── toeic/             # TOEIC Mastery
│   └── operations/            # 事務・雑務
└── docs/
```
