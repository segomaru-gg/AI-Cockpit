---
title: "Dashboard Refinement & Phase Logic Update"
date: "2026-02-18"
tags: ["dashboard", "refinement", "logic", "phases"]
---

# Dashboard Refinement & Phase Logic Update

本セッションでは、ダッシュボードの視認性と実用性を向上させるための大規模な改修を行いました。
プロジェクト管理の粒度を「Task」から「Goal > Phase」へと引き上げ、より大局的な進捗管理が可能になりました。

## 主な変更点

### 1. Dashboard UI Refinement
-   **Task Listの非表示化**: 個別のTaskCardを非表示にし、GoalとPhaseのタイムライン表示にフォーカスしました。
-   **Phase Modalの実装**: Phaseカードをクリックすることで、タスク一覧をモーダルで確認できるようにしました（ホバー表示から変更）。これにより、誤操作を防ぎつつ詳細情報へのアクセスを確保しました。

### 2. Logic Updates (`src/lib/projects.ts`)
-   **Overall Progress**: 各プロジェクトの `Active Goal` の進捗率の平均を、全体の進捗率として算出するロジックに変更しました。
-   **Phase Progress**: Phase内のタスク消化率に基づいて自動計算されます。
-   **Phase Deadline**: `phase.yaml` に `deadline` フィールドを追加し、Dashboard上で期限表示と遅延警告を行う機能を実装しました。

### 3. Agent Advice Logic
-   Phaseの期限（Deadline）をベースにしたアドバイス生成ロジックを導入。
-   2週間以内の期限、または期限切れのPhaseがある場合、`[URGENT]` や `[CRITICAL]` として優先的に通知されます。

## Migrated Tasks (Next Steps)
以下のタスクは本セッションのスコープ外とし、次回の計画に移行します。

-   **Strict Directory Structure Enforcer**: プロジェクトディレクトリ構造（`goals/`, `phases/`）を強制するツールの実装。
-   **Journal Automation Scripts**: Phaseのステータス変更（active -> done）をトリガーに、自動的にJournalの下書きを作成・記録するスクリプトの開発。

## 今後の展望
今後は、この新しいGoal/Phase構造をベースに、エージェントがより自律的に各フェーズの進捗を支援できるような仕組み（Auto-prompting, Resource allocation suggestions）を検討していきます。
