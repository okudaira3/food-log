# GitHub Actions を使ったGitHub Pages デプロイ手順書

## 前提条件
- GitHubにリポジトリが作成済み
- ローカル環境に Node.js がインストール済み
- プロジェクトが program フォルダに配置されている

## 手順1: GitHub Actions ワークフローファイルの作成

### 1.1 ディレクトリ構造の準備
プロジェクトのルートディレクトリに以下のフォルダを作成します：

```
food-log/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── program/
│   ├── src/
│   ├── package.json
│   └── ...
└── docs/
    └── このファイル
```

### 1.2 ワークフローファイルの作成
`.github/workflows/deploy.yml` を作成し、以下の内容を記述：

```yaml
name: Deploy to GitHub Pages

# トリガー設定：mainブランチにpushされたときに実行
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

# GitHub Pagesへの書き込み権限を設定
permissions:
  contents: read
  pages: write
  id-token: write

# 同じワークフローが同時に実行されないように制御
concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  # ビルドジョブ
  build:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout repository
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
        cache-dependency-path: program/package-lock.json

    - name: Install dependencies
      run: |
        cd program
        npm ci

    - name: Build project
      run: |
        cd program
        npm run build

    - name: Setup Pages
      uses: actions/configure-pages@v4

    - name: Upload artifact
      uses: actions/upload-pages-artifact@v3
      with:
        path: program/dist

  # デプロイジョブ
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
    - name: Deploy to GitHub Pages
      id: deployment
      uses: actions/deploy-pages@v4
```

## 手順2: GitHub Pages の設定

### 2.1 リポジトリ設定画面への移動
1. GitHub のリポジトリページを開く
2. 上部タブの「Settings」をクリック
3. 左サイドバーの「Pages」をクリック

### 2.2 GitHub Pages の有効化
1. **Source** セクションで「**GitHub Actions**」を選択
2. 「Save」ボタンをクリック

## 手順3: デプロイの実行

### 3.1 ファイルをコミット・プッシュ
```bash
# プロジェクトのルートディレクトリで実行
git add .github/workflows/deploy.yml
git commit -m "Add GitHub Actions workflow for deployment"
git push origin main
```

### 3.2 デプロイ状況の確認
1. GitHub リポジトリページの「Actions」タブをクリック
2. 最新のワークフロー実行を確認
3. 緑色のチェックマークが表示されれば成功

### 3.3 サイトの確認
1. Settings → Pages で表示される URL にアクセス
2. 通常 `https://ユーザー名.github.io/リポジトリ名/` の形式

## 手順4: 今後の運用

### 4.1 自動デプロイ
- main ブランチに push するたびに自動でデプロイされます
- 通常 2-5分でデプロイが完了します

### 4.2 デプロイ失敗時の対処
1. Actions タブでエラーログを確認
2. 主な原因：
   - ビルドエラー（npm run build の失敗）
   - 依存関係の問題
   - Node.js バージョンの不一致

### 4.3 手動でのデプロイ確認
ローカルでビルドが成功することを事前確認：
```bash
cd program
npm run build
# エラーが出ないことを確認
```

## トラブルシューティング

### Q1: Actions タブが表示されない
- リポジトリがPrivateの場合でも GitHub Free プランで利用可能
- 権限設定を確認

### Q2: デプロイは成功するがサイトが表示されない
- Settings → Pages で正しい URL を確認
- ブラウザキャッシュをクリア
- 5-10分待ってから再アクセス

### Q3: カメラや位置情報が動作しない
- HTTPS でアクセスしていることを確認
- ブラウザの権限設定を確認

### Q4: ビルドエラーが発生する
```bash
# ローカルで確認
cd program
npm run build

# エラーが出る場合は修正してからpush
```

## 参考情報
- [GitHub Actions Documentation](https://docs.github.com/ja/actions)
- [GitHub Pages Documentation](https://docs.github.com/ja/pages)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)