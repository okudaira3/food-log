# ViteサーバーWSL起動トラブルシューティングガイド

**作成日**: 2025-07-04  
**対象**: WSL2環境でのVite開発サーバー起動問題

## 概要

WSL2環境でViteの開発サーバーが「起動したように見えるが実際には接続できない」問題の解決ノウハウ集です。

## 症状パターン

### 🚨 典型的な症状
```bash
npm run dev
# ↓ 以下のメッセージが表示される
VITE v6.3.5  ready in 830 ms
➜  Local:   http://localhost:3000/
➜  Network: http://10.255.255.254:3000/
➜  Network: http://172.24.145.243:3000/

# しかし接続テストは失敗
curl http://localhost:3000/
# → curl: (7) Failed to connect to localhost port 3000: Connection refused
```

### 🔍 問題の特徴
- Viteが起動メッセージを表示
- ネットワークアドレスも正しく表示
- しかし実際のHTTP接続は失敗

## 診断手順

### 1. プロセス確認
```bash
# Viteプロセスが実際に動いているか確認
ps aux | grep vite | grep -v grep

# 期待する結果例:
# user 12345 ... node node_modules/.bin/vite --host 0.0.0.0 --port 3000
```

**重要**: 起動メッセージが表示されても、プロセスが存在しない場合がある

### 2. ポート監視確認
```bash
# ポートでリスニングしているプロセス確認
ss -tlnp | grep :3000
# または
lsof -i :3000

# 何も表示されない = ポートでリスニングしていない
```

### 3. 詳細デバッグログ実行
```bash
# Viteの内部動作を完全に可視化
DEBUG=vite:* npm run dev

# または直接Node実行
DEBUG=vite:* node node_modules/.bin/vite --host 0.0.0.0 --port 5173
```

### 4. 段階的接続テスト
```bash
# 1. 基本接続テスト
curl -v http://localhost:5173/

# 2. HTTPヘッダー確認
curl -I http://localhost:5173/

# 3. レスポンス内容確認
curl -s http://localhost:5173/ | head -10
```

## 一般的な解決方法

### Method 1: 完全リセット
```bash
# 1. 既存プロセス停止
pkill -f vite

# 2. キャッシュクリア
rm -rf node_modules/.vite
rm -rf node_modules package-lock.json

# 3. npmキャッシュクリア
npm cache clean --force

# 4. 依存関係再インストール
npm install

# 5. 起動
npm run dev
```

### Method 2: 設定確認・修正

#### vite.config.ts の確認
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,          // ポート明示
    host: '0.0.0.0',     // WSL2でのアクセス許可
    strictPort: false    // ポート競合時の自動変更
  }
})
```

#### package.json の確認
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  }
}
```

### Method 3: 代替ポートでの実行
```bash
# デフォルトポート以外で試行
npm run dev -- --port 5173
npm run dev -- --port 8080

# 直接Node実行
node node_modules/.bin/vite --host 0.0.0.0 --port 5173
```

## デバッグログの読み方

### 正常な起動パターン
```
2025-07-04T00:39:11.716Z vite:config config file loaded in 149.45ms
2025-07-04T00:39:11.716Z vite:deps (client) Hash is consistent. Skipping.

VITE v6.3.5  ready in 830 ms
➜  Local:   http://localhost:5173/
```

### HTTP処理ログ例
```
2025-07-04T00:39:43.298Z vite:html-fallback Rewriting GET / to /index.html
2025-07-04T00:39:43.332Z vite:time 36.01ms /index.html
2025-07-04T00:39:43.333Z vite:resolve 5.71ms /src/main.tsx
```

**このログが見える = HTTPサーバーが正常動作**

## 設定エラーパターンと対処

### Tailwind CSS PostCSS エラー
```
[postcss] It looks like you're trying to use `tailwindcss` directly as a PostCSS plugin.
The PostCSS plugin has moved to a separate package
```

**対処法**:
```bash
npm install @tailwindcss/postcss
```

### TypeScript設定エラー
```bash
# tsconfig.jsonの確認
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx"
  }
}
```

## WSL2特有の注意点

### ネットワーク設定
```bash
# WSLのIPアドレス確認
hostname -I

# Windows側からのアクセス用URL
# http://172.24.145.243:5173/ (例)
```

### ファイアウォール確認
Windows側のファイアウォールがWSL2のポートをブロックしている可能性

### ポートフォワーディング
必要に応じてWindowsでのポートフォワーディング設定

## 確実な動作確認手順

### 1. WSL内での確認
```bash
# プロセス確認
ps aux | grep vite

# HTTP接続確認
curl -v http://localhost:5173/

# HTMLレスポンス確認
curl -s http://localhost:5173/ | grep -i "<!doctype\|html\|title"
```

### 2. Windows側での確認
```powershell
# WSLのIPアドレスを取得
wsl hostname -I

# ブラウザでアクセス
# http://localhost:5173/
# http://[WSL_IP]:5173/
```

## よくある間違い

### ❌ 起動メッセージを信じすぎる
- 起動メッセージが表示されても実際のサーバーが動いていない場合がある
- 必ずプロセス確認とHTTP接続テストを実行

### ❌ 接続テストのタイミング
- Vite起動直後は初期化処理中の場合がある
- 数秒待ってから接続テストを実行

### ❌ ポート競合の見落とし
- 他のプロセスがポートを使用している可能性
- `ss -tlnp | grep :PORT` で確認

## 成功の判定基準

### ✅ 正常動作の証拠
1. **プロセス存在**: `ps aux | grep vite` でプロセス確認
2. **ポート監視**: `ss -tlnp | grep :5173` でリスニング確認  
3. **HTTP接続**: `curl -v http://localhost:5173/` で接続成功
4. **HTMLレスポンス**: HTMLが正常に返される
5. **デバッグログ**: HTTP処理ログが出力される

### 🎯 最終目標
- WSL内からの接続成功
- Windows側ブラウザからの接続成功
- React アプリケーションの正常表示

## まとめ

ViteのWSL2問題は表面的には複雑に見えるが、系統的にデバッグすることで必ず解決できる。**デバッグログと段階的テスト**が解決の鍵である。