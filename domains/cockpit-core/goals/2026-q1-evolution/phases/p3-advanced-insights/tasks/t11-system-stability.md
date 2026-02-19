---
title: "システム全体の安定化と可観測性向上"
phase: "Phase 11: System Stability"
status: "done"
priority: "high"
deadline: "2026-02-16"
order: 11
---

**背景**:
アクティビティログ実装時に、タイムゾーンの不一致やファイル名パターンのズレによりデータが表示されない問題が発生した。
今後同様の「見えないバグ」を防ぐため、システム基盤を強化する必要がある。

**要件**:
- アプリ全体での日付処理の統一（JST/Local Time厳守）
- データ読み込み時のログ強化（スキップ理由の明示）
- 本番環境でも使用可能なデバッグ機能の提供
- 既存データの監査と規格化

**完了条件**:
- [x] system/local timeベースの `dateUtils.ts` 作成と適用
- [x] `projects.ts` リファクタリング（堅牢なエラーハンドリング）
- [x] ActivityGridへの "God Mode" (`?debug=true`) 実装
- [x] 全ジャーナルファイルのファイル名監査完了
