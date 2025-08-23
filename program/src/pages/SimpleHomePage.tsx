export default function SimpleHomePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🍽️ フードログアプリ
          </h1>
          <div className="space-y-4">
            <p className="text-gray-600">
              フードログアプリが正常に起動しています！
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h2 className="font-medium text-green-800 mb-2">✅ 実装完了機能</h2>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• データベース（IndexedDB + Dexie.js）</li>
                <li>• 画像圧縮（Web Workers）</li>
                <li>• 権限管理（カメラ・位置情報）</li>
                <li>• データエクスポート・インポート</li>
                <li>• エラーハンドリング</li>
              </ul>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h2 className="font-medium text-blue-800 mb-2">🚀 次回テスト予定</h2>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 全機能の動作確認</li>
                <li>• パフォーマンステスト</li>
                <li>• ブラウザ互換性確認</li>
              </ul>
            </div>
            <div className="flex space-x-4 mt-6">
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                食事を記録する（準備中）
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                データ管理（準備中）
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}