# フードログアプリ設計書

## 概要

フードログアプリは、ユーザーが日々の食事を写真と共に記録し、後から振り返ることができる Web アプリケーションです。このドキュメントでは、アプリケーションの技術的な設計と実装の詳細について説明します。

## アーキテクチャ

### 全体アーキテクチャ

このアプリケーションは完全にフロントエンド完結型で、以下の技術スタックを使用します：

- **フロントエンドフレームワーク**: React + Vite
- **スタイリング**: Tailwind CSS
- **データストレージ**: IndexedDB (Dexie.js)
- **ルーティング**: React Router
- **デプロイ**: GitHub Pages 等の静的サイトホスティング

アプリケーションは以下の主要なレイヤーで構成されます：

1. **UI レイヤー**: React コンポーネント
2. **ロジックレイヤー**: カスタムフック、ユーティリティ関数
3. **データレイヤー**: Dexie.js を使用した IndexedDB アクセス

### ディレクトリ構造

```
src/
├── components/       # 再利用可能なUIコンポーネント
├── db/               # データベース関連のコード
├── hooks/            # カスタムReactフック
├── pages/            # ページコンポーネント
├── types/            # TypeScript型定義
├── utils/            # ユーティリティ関数
├── App.tsx           # メインアプリケーションコンポーネント
└── main.tsx          # エントリーポイント
```

## コンポーネントと界面

### ページコンポーネント

1. **HomePage**: メイン画面、食事記録のカード一覧を表示

   - 検索バー
   - フィルター機能
   - フローティング追加ボタン

2. **CreatePage**: 新規記録作成画面

   - カメラ/ファイルアップロードインターフェース
   - フォーム（コメント、タグ、位置情報）

3. **DetailPage**: 詳細表示画面

   - 写真拡大表示
   - 詳細情報表示
   - 地図表示
   - 編集・削除ボタン

4. **EditPage**: 編集画面
   - フォーム（コメント、タグ、位置情報）

### 共通コンポーネント

1. **FoodCard**: 食事記録カード

   - 写真サムネイル
   - コメント（一部）
   - タグ
   - 日時
   - お気に入りボタン

2. **PhotoCapture**: 写真撮影/アップロードコンポーネント

   - カメラプレビュー
   - ファイルアップロード
   - 写真圧縮処理

3. **TagInput**: タグ入力コンポーネント

   - タグの追加/削除

4. **LocationPicker**: 位置情報取得コンポーネント

   - 現在位置取得ボタン
   - 位置情報表示

5. **SearchBar**: 検索バーコンポーネント

   - テキスト検索
   - 日付フィルター
   - タグフィルター
   - お気に入りフィルター

6. **MapView**: 地図表示コンポーネント
   - 位置情報ピン表示

## データモデル

### データベーススキーマ

Dexie.js を使用して、以下のようなデータベーススキーマを定義します：

```typescript
// db/database.ts
import Dexie, { Table } from "dexie"
import { FoodEntry, Location } from "../types"

export class FoodLogDatabase extends Dexie {
  foodEntries!: Table<FoodEntry, number>

  constructor() {
    super("FoodLogDatabase")

    this.version(1).stores({
      foodEntries: "++id, timestamp, favorite, *tags",
    })
  }
}

export const db = new FoodLogDatabase()
```

### 型定義

```typescript
// types/index.ts
export interface Location {
  lat: number
  lng: number
  accuracy: number
}

export interface FoodEntry {
  id?: number
  photo: Blob
  comment: string
  tags: string[]
  location?: Location
  timestamp: Date
  favorite: boolean
  createdAt: Date
  updatedAt: Date
}
```

## エラー処理

### データベースエラー

Dexie.js のエラーハンドリングを活用し、以下のようなエラーを処理します：

- データベース接続エラー
- トランザクションエラー
- スキーマバージョンエラー

```typescript
// db/database.ts
db.on("error", (error) => {
  console.error("Database error:", error)
  // ユーザーへのエラー通知
})
```

### カメラ/位置情報アクセスエラー

ブラウザ API へのアクセス権限がない場合のエラー処理：

```typescript
// hooks/useCamera.ts
const startCamera = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true })
    // カメラストリームの処理
  } catch (error) {
    console.error("Camera access error:", error)
    // ユーザーへのエラー通知
  }
}
```

## テスト戦略

### ユニットテスト

- **対象**: ユーティリティ関数、カスタムフック
- **ツール**: Jest, React Testing Library

### コンポーネントテスト

- **対象**: UI コンポーネント
- **ツール**: React Testing Library

### 統合テスト

- **対象**: ページコンポーネント、データフロー
- **ツール**: React Testing Library, MSW (Mock Service Worker)

### E2E テスト

- **対象**: 主要なユーザーフロー
- **ツール**: Cypress

## パフォーマンス最適化

### 画像最適化

1. **画像圧縮**:

   - Canvas API を使用して画像サイズを縮小
   - 画質調整によるファイルサイズ最適化

2. **遅延読み込み**:
   - Intersection Observer API を使用した画像の遅延読み込み

### データ取得最適化

1. **インデックス活用**:

   - 頻繁に検索される項目（タグ、日付、お気に入り）にインデックスを設定

2. **ページネーション**:
   - 大量のデータを扱う場合、無限スクロールまたはページネーションを実装

## UI/UX デザイン

### デザインシステム

Tailwind CSS を使用して、一貫性のあるデザインシステムを実装します：

```js
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#4169E1",
        accent: {
          DEFAULT: "#32CD32",
          dark: "#228B22",
        },
        secondary: "#FF6347",
        textColor: "#FFFFFF",
        bgColor: "#1E3A8A",
        cardBg: "#3B82F6",
      },
      fontFamily: {
        sans: ['"Helvetica Neue"', "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
}
```

### レスポンシブデザイン

モバイルファーストのアプローチを採用し、以下のブレークポイントでレスポンシブデザインを実装します：

- **sm**: 640px 以上
- **md**: 768px 以上
- **lg**: 1024px 以上
- **xl**: 1280px 以上

```jsx
// レスポンシブデザインの例
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{/* カードコンポーネント */}</div>
```

## セキュリティ考慮事項

### データ保護

- IndexedDB に保存されるデータはユーザーのローカルデバイスに保存されるため、サーバーサイドのセキュリティリスクは最小限
- 将来的にバックエンド連携を行う場合は、適切な認証・認可メカニズムを実装

### 位置情報の取り扱い

- 位置情報へのアクセスは明示的なユーザー許可を必要とする
- 位置情報の精度は必要最小限に制限することを検討

## 将来の拡張性

### オフライン対応

- Service Worker を使用したオフライン機能の実装
- PWA（Progressive Web App）対応

### バックエンド連携

- クラウドストレージとの同期機能
- ユーザー認証の追加

### 追加機能

- カレンダービュー
- 統計・分析機能
- ソーシャル共有機能
