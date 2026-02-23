# AI-Cockpit: Life Operating System

[日本語版はこちら](#ai-cockpit-日本語)

**AI-Cockpit** is a unified workspace that manages every domain of life—business, operations, learning, and brand—as a single, cohesive **Life Operating System**, powered by an AI agent partnership.

---

## � Repository Structure

```text
AI-Cockpit/
├── domains/                    # All life domains live here
│   ├── cockpit-core/           # Master Dashboard (Astro)
│   ├── consulting/             # Business & strategy
│   │   ├── oduman/             #   └ Oduman (EC / shisha business)
│   │   └── boabase/            #   └ BoaBASE (consulting ops)
│   ├── brand/                  # Personal brand & portfolio (Aeternum)
│   ├── learning/               # Studies & skill acquisition
│   │   └── toeic/              #   └ TOEIC study tracker
│   └── operations/             # Admin, finance, life management
├── docs/                       # Documentation & charter
├── config/                     # Global configuration
├── scripts/                    # Maintenance & sync scripts
├── inbox/                      # Mobile notes landing zone (from Obsidian)
└── cockpit.yaml                # Global goals & quarter config
```

Each domain directory contains a `blueprint.yaml` identity file, a `tasks/` directory for task management, and a `journal/` directory for decision logs. This is the **Blueprint Protocol** — see [docs/STRUCTURE.md](docs/STRUCTURE.md) for details.

---

## 🚀 Getting Started

Launch the Master Control Dashboard:

```bash
cd domains/cockpit-core
npm install
npm run dev
```

The dashboard is available at `http://localhost:4321/`.

---

## 📱 Obsidian Integration (SegoOS Vault)

AI-Cockpit integrates with **Obsidian** via iCloud for seamless mobile access and capture.

### Prerequisites

| Requirement | Description |
|:---|:---|
| **Obsidian** | Desktop & mobile app installed |
| **iCloud Drive** | Enabled and syncing on Mac / iPhone |
| **SegoOS Vault** | An Obsidian vault stored in iCloud (`~/Library/Mobile Documents/iCloud~md~obsidian/Documents/SegoOS`) |

### How It Works

AI-Cockpit uses a **bidirectional sync** between the repository and your Obsidian Vault:

```
 ┌──────────────┐     sync-obsidian.sh      ┌──────────────┐     iCloud      ┌──────────────┐
 │  AI-Cockpit  │  ──── .md / .yaml ────▶   │  SegoOS      │  ◀──────────▶  │  Obsidian    │
 │  (PC)        │  ◀── 00_Inbox notes ───   │  Vault       │                │  Mobile      │
 └──────────────┘                            └──────────────┘                └──────────────┘
```

**PC → Mobile** : All `.md` and `.yaml` files are mirrored into the vault so you can browse tasks, journals, and blueprints on your phone.

**Mobile → PC** : Notes written in Obsidian's `00_Inbox` folder are pulled into `AI-Cockpit/inbox/`. The AI agent automatically checks this folder at session start and processes your raw input.

### Running the Sync

```bash
# Option 1: Run from terminal
./scripts/sync-obsidian.sh

# Option 2: Double-click the macOS command file
# Use "Sync Obsidian.command" from Finder / Dock
```

The script uses `rsync` and excludes `node_modules`, `.git`, and build artifacts.

### Obsidian Tips

- **Graph View** — Visualize connections between business domains, tasks, and journals.
- **Offline Access** — Review all project data anywhere via iCloud, no internet required.
- **Quick Capture** — Open Obsidian on your phone, write a note in `00_Inbox`, and let the AI agent process it when you return to your PC.
- **Search** — Use Obsidian's powerful search to find tasks across all domains instantly.

---

## 🛡 Charter & Global Goals

- **[Charter v2.0](docs/charter/AI_Cockpit_Charter_v2.0.md)** — Operational spec defining the structural hierarchy: `Project → QuarterGoal → Phase → Task`.
- **[cockpit.yaml](cockpit.yaml)** — Global goals & quarter configuration (current: 2026-Q1).

---

## 📜 Blueprint Protocol (Summary)

Every domain project follows a standard protocol:

1. **`blueprint.yaml`** — Project identity (name, category, status, priority).
2. **`tasks/`** — Markdown task files with frontmatter (`status`, `priority`, `phase`).
3. **`journal/`** — Immutable decision logs (`YYYY-MM-DD-description.md`).

The Cockpit Core dashboard automatically discovers and aggregates data from all domain projects.

---

---

# AI-Cockpit (日本語)

**AI-Cockpit** は、ビジネス・実務・学習・ブランドなど人生のあらゆる領域を統合管理する「**Life Operating System**」です。AIエージェントとのパートナーシップにより運用されます。

## � リポジトリ構成

```text
AI-Cockpit/
├── domains/                    # 全ての活動領域
│   ├── cockpit-core/           # マスター・ダッシュボード (Astro)
│   ├── consulting/             # ビジネス・戦略
│   │   ├── oduman/             #   └ Oduman (EC / シーシャ事業)
│   │   └── boabase/            #   └ BoaBASE (コンサルティング)
│   ├── brand/                  # パーソナルブランド (Aeternum)
│   ├── learning/               # 学習・スキル習得
│   │   └── toeic/              #   └ TOEIC 学習トラッカー
│   └── operations/             # 事務・財務・生活管理
├── docs/                       # ドキュメント・チャーター
├── config/                     # グローバル設定
├── scripts/                    # メンテナンス・同期スクリプト
├── inbox/                      # モバイルメモの受信箱 (Obsidian から)
└── cockpit.yaml                # グローバル目標・四半期設定
```

各ドメインには `blueprint.yaml`（プロジェクト定義）、`tasks/`（タスク管理）、`journal/`（意思決定ログ）が含まれます。詳細は [docs/STRUCTURE.md](docs/STRUCTURE.md) を参照してください。

## 🚀 起動方法

```bash
cd domains/cockpit-core
npm install
npm run dev
```

ダッシュボードは `http://localhost:4321/` で利用できます。

## 📱 Obsidian 連携 (SegoOS Vault)

AI-Cockpit は **Obsidian** と iCloud を通じて連携し、モバイルからのアクセスとメモ取り込みを実現します。

### 仕組み

- **PC → モバイル**: リポジトリ内の `.md` / `.yaml` ファイルを Obsidian Vault にミラーリング。スマホからタスクやジャーナルを閲覧可能。
- **モバイル → PC**: Obsidian の `00_Inbox` フォルダに書いたメモが `AI-Cockpit/inbox/` に取り込まれ、AIエージェントがセッション開始時に自動処理。

### 同期の実行

```bash
# ターミナルから実行
./scripts/sync-obsidian.sh

# または Finder / Dock から「Sync Obsidian.command」をダブルクリック
```

### Obsidian 活用法

- **Graph View** でドメイン間の関連性を可視化
- **オフラインアクセス** で外出先からプロジェクト状況を確認
- **クイックキャプチャ** で思いついたことを `00_Inbox` にメモ → 帰宅後 AI が処理
- **検索** で全ドメインのタスクを横断検索
