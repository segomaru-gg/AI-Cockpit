---
title: "boabase ECショップ 静的ページ実装"
date: "2026-03-29"
tags: ["boabase", "shop", "ec", "frontend"]
---

## 概要

`boabaseshisha.sakura.ne.jp` の既存サイトに溶け込むギャラリー型ECページを静的HTML/CSS/JSで実装。

## 成果物

`domains/brand/boabase-shop/shop/` に以下を生成:

- `index.html` — 商品一覧（3列グリッド / SP1列、SOLD OUT対応）
- `item.html` — 商品詳細テンプレ（URLパラメータ `?id=N` でデータ切り替え）
- `shop.css` — 専用スタイル。プレフィックス `shop-` で既存サイトと完全分離
- `shop.js` — フェードイン＋IntersectionObserver によるスクロールリビール
- `images/README.md` — 商品画像配置ガイド

## デザイン方針

- 配色: `#0d0d0d` ベースのダークテーマ
- アクセント: `#c8a882`（ブラウンゴールド）
- フォント: Noto Serif JP + Helvetica Neue
- 美術館・ギャラリー的な余白重視レイアウト

## 次のアクション

1. サーバーの `/shop/` ディレクトリに4ファイルをFTPアップロード
2. `images/` に実商品写真を配置（命名規則: `item-01.jpg` 〜）
3. `item.html` 内の `ITEMS` オブジェクトを実際の商品情報に更新
4. 購入ボタンの `href="#"` を注文フォームURLに差し替え
