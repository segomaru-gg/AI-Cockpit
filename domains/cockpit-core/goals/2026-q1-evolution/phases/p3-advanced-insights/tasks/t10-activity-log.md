---
title: "GitHubスタイル・アクティビティログの実装"
phase: "Phase 10: Visual Activity Log"
status: "done"
priority: "medium"
deadline: "2026-02-16"
order: 10
---

**背景**:
プロジェクト全体の進捗状況を、GithubのContribution Graphのような「草」のビジュアルで可視化したい。

**要件**:
- ダッシュボード上部に52週分のグローバル・アクティビティを表示
- 各プロジェクトカードにも18週分の個別アクティビティを表示
- ジャーナルおよびタスクの更新日時を活動データとして集計
- デザインはGitHubライクなダークモード（黒背景に緑のグラデーション）

**完了条件**:
- [x] `projects.ts` でのアクティビティ集計ロジック実装
- [x] `ActivityGrid.astro` コンポーネントの作成
- [x] ダッシュボードへの統合と表示確認
