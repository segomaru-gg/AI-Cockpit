---
title: "Aeternum Brand LP Design & Implementation"
date: "2026-03-20"
type: "milestone"
---

# Aeternum Brand LP Design & Implementation

AeternumのブランドLP（世界観の入口）の初回MVP構築が完了した。

## 概要
- **目的**: 販売起点ではなく、「意味ごと収蔵する」思想を表現する静的なギャラリー空間の構築。
- **実装**: HTML/CSS/VanillaJSのみの極限まで軽量な構成。
- **UI/UXの特長**:
  - CSS Scroll Snappingを用いた「1画面＝1パラグラフ」の没入感あるスライドスクロール体験。
  - Intersection Observerとcubic-bezierを活用した、息をするようなテキストのフェードアップアニメーション。
  - Noto Serif JP と Times New Roman を組み合わせた、高級感のあるエディトリアルなタイポグラフィ設計。
  - `word-break: keep-all;` と緻密な `<br>` 設計による、詩のようなアスキーレイアウト。

## 決定事項
- 「Action Plan」という表記を排除し、Aeternumの静かな実践を示す「Practice」に変更。
- 古物販売とtoB支援（ConceptDriven）の2軸を明記。
- ギャラリー的な余白の美を最優先とし、不必要に文字を巨大化させず、空間に対するコントラストでヒエラルキーを構築。

## 次のステップ
- 写真素材・商品画像等の充実によるAestheticな深化。
- 各リンク（Instagram等）を通じた外部との接続。
- Aeternum本業の思想に沿ったさらなるコンテンツ拡張（必要時）。
