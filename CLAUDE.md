# CLAUDE.md

このファイルは、このリポジトリでコードを扱う際に Claude Code (claude.ai/code)にガイダンスを提供します。

## 最重要！ユーザーとの約束

### コミュニケーション

- 特別な指示がない限り日本語で行う
- 絵文字の使用は控える
- 作業を次々進めない
  - ユーザーの発言に「XXXX ですね」「XXXX と YYY どっちがいいですか？」などと指示が含まれていないときは回答だけする。
  - ユーザーが「XXXX してください」「それで進めてください」などと作業を促したら作業する

## プロジェクト概要

Ever Food ライクなフードログアプリ（Web アプリ PoC 版）です。完全フロントエンド完結型で、バックエンド不要の設計です。

## 技術スタック

- **フロントエンド**: React + Vite + Tailwind CSS
- **データベース**: IndexedDB（Dexie.js 使用）
- **デプロイ**: GitHub Pages 等の静的サイト
- **完全フロントエンド完結型**（バックエンド不要）

## 開発コマンド

プロジェクトが初期化されたら、program ディレクトリ内で以下のコマンドが利用可能になります：

```bash
# programディレクトリに移動
cd program

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# ビルド
npm run build

# プレビュー
npm run preview

# リンター
npm run lint

# テスト
npm run test
```

## アーキテクチャ

### 画面構成とルーティング

```javascript
const routes = [
  { path: "/", element: <HomePage /> }, // メイン画面
  { path: "/create", element: <CreatePage /> }, // 撮影・投稿画面
  { path: "/detail/:id", element: <DetailPage /> }, // 詳細画面
  { path: "/edit/:id", element: <EditPage /> }, // 編集画面
]
```

### データ構造

食事記録オブジェクト：

```javascript
{
  id: number,                    // タイムスタンプベースのID
  photo: Blob,                   // 圧縮済み写真データ
  comment: string,               // コメント
  tags: Array<string>,           // タグ配列
  location: {                    // 位置情報
    lat: number,
    lng: number,
    accuracy: number
  },
  timestamp: Date,               // 投稿日時
  favorite: boolean,             // お気に入りフラグ
  createdAt: Date,               // 作成日時
  updatedAt: Date                // 更新日時
}
```

## 重要な機能要件

### 写真機能

- カメラアクセス（navigator.mediaDevices.getUserMedia）
- ファイルアップロード対応
- 自動圧縮（Canvas 使用）
- 解像度：長方形保持（16:9 または 4:3）
- ファイルサイズ：200-500KB 目標

### 位置情報機能

- GPS 座標取得（navigator.geolocation）
- 座標のまま保存（逆ジオコーディング不要）
- 地図表示機能（GoogleMaps API or OpenStreetMap）

### 検索機能

- 日付絞り込み
- タグ検索
- コメント検索（LIKE 演算子使用）

## 開発優先度

### Phase 1 (MVP)

1. 基本 CRUD 機能
2. 写真撮影・圧縮
3. カード表示
4. 位置情報取得

### Phase 2

1. 検索機能
2. お気に入り機能
3. 地図表示
4. 編集・削除

### Phase 3

1. UI の洗練
2. パフォーマンス最適化
3. PWA 対応

## 技術的考慮事項

- **パフォーマンス**: 画像の遅延読み込み、仮想スクロール、IndexedDB クエリ最適化
- **セキュリティ**: XSS 対策、位置情報の適切な取り扱い
- **互換性**: モダンブラウザ対応、カメラ API 対応ブラウザ必須
- **UI/UX**: モバイルファースト、レスポンシブデザイン、PWA 対応検討

## デザインガイド

- docs\design-guide.md に従って画面を作成する
