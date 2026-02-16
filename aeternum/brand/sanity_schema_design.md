# Sanity スキーマ設計 (Shushuan DB)

Aeternum の「意味・構造・表現」を管理するためのデータ構造です。

## タイプ: `shushuanItem`

### 1. Core (意味)
- **name**: string (名称)
- **category**: string (カテゴリ: 古物, 音楽, 言葉, 記憶, 思想, 空間, 体験)

### 2. Structure (構造)
- **description**: portableText (詳細記述 - ChatGPTとの対話結果)
- **tags**: array of strings (文脈タグ)
- **relatedItems**: array of references (他の shushuanItem への紐付け)

### 3. Public (表現)
- **mainImage**: image (メインビジュアル)
- **audioFile**: file (背景音・音声データ)
- **isPublic**: boolean (公開状態)

### 4. Commerce (実行)
- **isForSale**: boolean (販売フラグ)
- **inventoryStatus**: string (ステータス: 販売中, 商談中, 売約済, 非売品)
- **price**: number (日本円)
- **stripeProductId**: string (Stripe管理ID)

---
*Created by Caesar (2026-02-15)*
