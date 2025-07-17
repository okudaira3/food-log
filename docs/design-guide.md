# Food-Log Tailwind デザインガイド 完全版

## 1. Tailwind の設定

### 1-1. tailwind.config.js の設定

```js
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}", // プロジェクト構造に合わせて調整
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // メインカラー
        primary: "#4169E1",
        accent: {
          DEFAULT: "#32CD32",
          dark: "#228B22",
        },
        secondary: "#FF6347",
        // テキスト・背景色
        textColor: "#FFFFFF",
        bgColor: "#1E3A8A",
        cardBg: "#3B82F6",
      },
      // フォント設定追加
      fontFamily: {
        sans: ['"Helvetica Neue"', "Arial", "sans-serif"],
        serif: ["Georgia", "serif"],
      },
      // スペーシング設定追加
      spacing: {
        128: "32rem",
      },
    },
  },
  plugins: [],
}
```

### 1-2. globals.css での Tailwind 適用

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## 2. カスタムコンポーネント

### 2-1. 基本的なスタイリング（インライン記法）

Tailwind の Utility Class を直接 className に記述する方法は、小規模なコンポーネントや一度しか使わないスタイルに適しています。

```jsx
// カードコンポーネントの例
<div className="bg-cardBg shadow-lg rounded-lg p-6 m-4">
  <h2 className="text-2xl mb-2 text-textColor font-bold">Card Title</h2>
  <p className="text-textColor">Card content goes here</p>
</div>
```

### 2-2. スタイルの共通化（@apply の活用）

ボタンのように、サイト内で何度も使われるコンポーネントのスタイルは、@apply を使ってカスタムクラスとして定義することを推奨します。これにより、保守性が大幅に向上します。

```css
/* globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .btn-primary {
    @apply bg-accent text-white font-bold py-2 px-4 rounded;
  }

  .btn-primary:hover {
    @apply bg-accent-dark;
  }
}
```

```jsx
// ボタンコンポーネントでの使用例
<button className="btn-primary">Click me</button>
```

インラインでのスタイリングと@apply を使った方法は、状況に応じて適切に使い分けることが重要です。

## 3. レスポンシブレイアウト

Tailwind の utility class を活用することで、レスポンシブデザインを実現できます。

```jsx
<div className="flex flex-col md:flex-row">
  <div className="w-full md:w-1/2 p-4">Left</div>
  <div className="w-full md:w-1/2 p-4">Right</div>
</div>
```

## 4. ベストプラクティス

- utility class が複雑になりがちな場合は、頻出パターンをコンポーネント化することを検討してください。
- 色の指定は config 設定から参照するようにし、直接の色指定は避けてください。
- レスポンシブデザインはモバイルファースト（min-width）で統一することを推奨します。
- 一貫性のあるスペーシングを実現するため、spacing は config で設定するようにしてください。

## 5. アイコン

本プロジェクトでは、アイコンライブラリとして「Heroicons」を使用します。
Heroicons は、Tailwind CSS との親和性が高く、豊富なアイコンを提供しています。

```jsx
import { BeakerIcon } from "@heroicons/react/24/solid"

function MyComponent() {
  return (
    <div>
      <BeakerIcon className="h-5 w-5 text-accent" />
      <p>...</p>
    </div>
  )
}
```

Heroicons の特徴は以下の通りです。

- 2 つのスタイルを用意（Solid と Outline）
- SVG ベースで、サイズと色を自在にカスタマイズ可能
- React, Vue, Svelte 用のコンポーネントを提供
- 24x24 の統一サイズで、一貫性のあるデザインが実現可能

アイコンは、UI の印象を大きく左右する重要な要素です。
Heroicons を効果的に活用し、「コンビニナイト」のデザインに一体感を持たせることを推奨します。

## 6. ダークモード対応

tailwind.config.js で darkMode: 'class' を設定することで、要素に dark:bg-xx などのクラスを付与するだけでダークモードに対応できます。

## 7. パフォーマンス最適化

不要なスタイルの削除: tailwind.config.js の content プロパティに指定されたファイルを監視し、ビルド時に使用されていない Utility Class は自動的に削除されます。これにより、CSS ファイルは常に最小限のサイズに保たれます。

画像の最適化: プロジェクトで使用する画像は、可能な限り圧縮してファイルサイズを軽量化しましょう。また、ページの初期表示速度を向上させるため、画像の遅延読み込み（Lazy Loading）の導入を検討します。

## 8. 実装チェックリスト

- [ ] 全ページでレスポンシブ対応ができているか確認する。
- [ ] 不要な utility class を使用していないか再チェックする。
- [ ] カラーの指定が config から行われており、直接の指定がないか確認する。
- [ ] アクセシビリティ(ALT 属性、ARIA 属性)が適切に設定されているか確認する。

## 9. 更新履歴

- 2025/07/17 v1.1 レビューを反映し、内容を改善
- 2025/07/17 v1.0 初版リリース

以上が「コンビニナイト Tailwind デザインガイド」の完全版となります。
設定ファイルの書き方からコンポーネントの実装、パフォーマンス最適化まで、Tailwind を効果的に活用するための重要ポイントを網羅しています。

本ガイドラインが、「コンビニナイト」プロジェクトの開発に役立つことを願っております。
