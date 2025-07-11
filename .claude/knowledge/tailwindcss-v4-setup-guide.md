# TailwindCSS v4 設定ガイド

**作成日**: 2025-07-04  
**カテゴリ**: 開発環境設定  
**対象**: TailwindCSS v4 + PostCSS + Vite環境  

## 📋 概要

TailwindCSS v4系では、PostCSSプラグインが別パッケージに分離され、CSS記法も変更されました。本ガイドでは、v4系の正しい設定方法と移行手順を記載します。

## 🔧 必要パッケージ

### 基本パッケージ
```json
{
  "dependencies": {
    "tailwindcss": "^4.1.11"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.0.0-alpha.15",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

### インストールコマンド
```bash
npm install @tailwindcss/postcss
```

## ⚙️ 設定ファイル

### 1. postcss.config.js
```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},  // v4系では必須
    autoprefixer: {},
  },
}
```

**重要**: `tailwindcss: {}` ではなく `'@tailwindcss/postcss': {}` を使用

### 2. src/index.css
```css
@import "tailwindcss";

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

* {
  box-sizing: border-box;
}
```

**重要**: `@tailwind base/components/utilities` ではなく `@import "tailwindcss";` を使用

### 3. tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**重要**: `module.exports` 形式を推奨（ES6 export defaultでも動作）

## 🚨 よくあるエラーと対処法

### エラー1: PostCSS プラグインエラー
```
[postcss] It looks like you're trying to use `tailwindcss` directly as a PostCSS plugin.
```

**原因**: TailwindCSS v4でPostCSSプラグインが分離された  
**対処**: `@tailwindcss/postcss` パッケージをインストール

### エラー2: CSS記法エラー
```
Unknown at-rule @tailwind
```

**原因**: v4では `@tailwind` ディレクティブが非推奨  
**対処**: `@import "tailwindcss";` に変更

### エラー3: JIT モード動作不良
```
Classes not being generated
```

**原因**: content 配列の設定不備  
**対処**: ファイルパターンを正確に設定

## ✅ 動作確認方法

### 1. エラー解消確認
```bash
npm run dev
# ブラウザコンソールでPostCSSエラーがないことを確認
```

### 2. Tailwindクラス適用確認
```html
<div className="bg-blue-600 text-white p-4 rounded-lg">
  テストコンポーネント
</div>
```

### 3. JIT モード確認
開発者ツールでCSSが以下のように生成されることを確認：
```css
.bg-blue-600 { background-color: var(--color-blue-600); }
.text-white { color: var(--color-white); }
.p-4 { padding: calc(var(--spacing) * 4); }
.rounded-lg { border-radius: var(--radius-lg); }
```

## 🔄 v3からv4への移行手順

### 1. パッケージ更新
```bash
npm install @tailwindcss/postcss
```

### 2. postcss.config.js 修正
```javascript
// 修正前（v3）
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

// 修正後（v4）
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
```

### 3. CSS記法更新
```css
/* 修正前（v3） */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* 修正後（v4） */
@import "tailwindcss";
```

### 4. 設定ファイル確認
```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // ...
}
```

## 🎯 最適化のポイント

### 1. JIT モード効率化
- content配列を正確に設定
- 未使用クラスの自動削除
- ビルド時間の短縮

### 2. パフォーマンス向上
- CSS変数の活用
- 必要最小限のCSSのみ生成
- Hot Module Replacementの高速化

### 3. 開発体験改善
- エラーメッセージの明確化
- IDE支援の向上
- デバッグの簡素化

## 📚 参考リンク

- [TailwindCSS v4 Migration Guide](https://tailwindcss.com/docs/v4-beta)
- [@tailwindcss/postcss Documentation](https://www.npmjs.com/package/@tailwindcss/postcss)
- [PostCSS Configuration](https://postcss.org/docs/postcss-config)

## 🔍 トラブルシューティング

### Vite環境での注意事項
- サーバー再起動が必要な場合がある
- HMRが正常に動作しない場合は `npm run dev` を再実行
- WSL2環境では `host: '0.0.0.0'` の設定を確認

### Windows + WSL2 環境
- ファイルパスの大文字小文字に注意
- Windows側ブラウザからのアクセス確認
- パーミッション設定の確認

## 📝 備考

このガイドは2025-07-04時点でのTailwindCSS v4.1.11での動作確認済みです。将来のバージョンアップ時は公式ドキュメントを確認してください。