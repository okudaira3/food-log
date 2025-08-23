import { useState, useRef } from 'react'
import { 
  ArrowDownTrayIcon, 
  ArrowUpTrayIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline'
import { Button } from '../Common'
import { useDataOperations } from '../../hooks/useDataOperations'
import { useFoodRecords, useFoodRecordActions } from '../../db/hooks'

interface DataManagementProps {
  onClose?: () => void
}

export default function DataManagement({ onClose }: DataManagementProps) {
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importStatus, setImportStatus] = useState<'idle' | 'validating' | 'ready' | 'importing' | 'success' | 'error'>('idle')
  const [validationResult, setValidationResult] = useState<{ isValid: boolean; errors: string[] } | null>(null)
  const [importCount, setImportCount] = useState<number>(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const records = useFoodRecords()
  const { createRecord } = useFoodRecordActions()
  
  const {
    loading,
    progress,
    error,
    exportData,
    importData,
    validateData,
    downloadFile,
    readFile,
    resetState,
    cleanup: _cleanup
  } = useDataOperations()

  // エクスポート処理
  const handleExport = async () => {
    try {
      resetState()
      
      if (records.length === 0) {
        alert('エクスポートするデータがありません')
        return
      }

      const jsonData = await exportData(records)
      
      const filename = `food-log-backup-${new Date().toISOString().split('T')[0]}.json`
      downloadFile(jsonData, filename)
      
      alert(`${records.length}件のデータをエクスポートしました`)
    } catch (err) {
      console.error('Export error:', err)
      alert('エクスポートに失敗しました: ' + (err instanceof Error ? err.message : '未知のエラー'))
    }
  }

  // ファイル選択処理
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImportFile(file)
    setImportStatus('validating')
    setValidationResult(null)

    try {
      const content = await readFile(file)
      const result = await validateData(content)
      
      setValidationResult(result)
      setImportStatus(result.isValid ? 'ready' : 'error')
      
      if (result.isValid) {
        // 有効なデータの場合、レコード数を表示用に取得
        const parsedData = JSON.parse(content)
        setImportCount(parsedData.records?.length || 0)
      }
    } catch (err) {
      console.error('File validation error:', err)
      setValidationResult({
        isValid: false,
        errors: [err instanceof Error ? err.message : 'ファイルの読み込みに失敗しました']
      })
      setImportStatus('error')
    }
  }

  // インポート実行
  const handleImport = async () => {
    if (!importFile) return

    setImportStatus('importing')

    try {
      const content = await readFile(importFile)
      const importedRecords = await importData(content)
      
      // 既存のデータベースに追加
      for (const record of importedRecords) {
        await createRecord(record)
      }

      setImportStatus('success')
      setImportCount(importedRecords.length)
      
      // 成功時は少し遅延してファイル選択をリセット
      setTimeout(() => {
        setImportFile(null)
        setImportStatus('idle')
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }, 3000)
    } catch (err) {
      console.error('Import error:', err)
      setImportStatus('error')
      setValidationResult({
        isValid: false,
        errors: [err instanceof Error ? err.message : 'インポートに失敗しました']
      })
    }
  }

  // ファイル選択リセット
  const handleResetFile = () => {
    setImportFile(null)
    setImportStatus('idle')
    setValidationResult(null)
    setImportCount(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getStatusIcon = () => {
    switch (importStatus) {
      case 'validating':
        return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500" />
      case 'ready':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'importing':
        return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500" />
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
      default:
        return null
    }
  }

  const getStatusText = () => {
    switch (importStatus) {
      case 'validating':
        return 'ファイルを検証中...'
      case 'ready':
        return `インポート準備完了（${importCount}件のレコード）`
      case 'importing':
        return 'データをインポート中...'
      case 'success':
        return `${importCount}件のレコードをインポートしました`
      case 'error':
        return 'エラーが発生しました'
      default:
        return ''
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">データ管理</h2>
              <p className="text-sm text-gray-600 mt-1">
                フードログデータのバックアップと復元
              </p>
            </div>
            {onClose && (
              <Button onClick={onClose} variant="outline" size="sm">
                閉じる
              </Button>
            )}
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* エクスポートセクション */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <ArrowDownTrayIcon className="h-5 w-5 text-gray-500" />
              <h3 className="text-md font-medium text-gray-900">データのエクスポート</h3>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <InformationCircleIcon className="h-5 w-5 text-blue-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-blue-800">
                    現在のフードログデータをJSONファイルとしてエクスポートできます。
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    エクスポートされたファイルは、他のデバイスや将来のデータ復旧に使用できます。
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  現在のデータ: {records.length}件
                </p>
                <p className="text-xs text-gray-600">
                  最終更新: {records.length > 0 ? new Date(Math.max(...records.map(r => r.updatedAt.getTime()))).toLocaleString() : '---'}
                </p>
              </div>
              <Button 
                onClick={handleExport} 
                disabled={records.length === 0 || loading}
                className="flex items-center space-x-2"
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                <span>エクスポート</span>
              </Button>
            </div>

            {loading && (
              <div className="space-y-2">
                <div className="text-sm text-gray-600">エクスポート進行中...</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500">{progress}%</div>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200"></div>

          {/* インポートセクション */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <ArrowUpTrayIcon className="h-5 w-5 text-gray-500" />
              <h3 className="text-md font-medium text-gray-900">データのインポート</h3>
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-yellow-800 font-medium">注意</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    インポートされたデータは既存のデータに追加されます。
                    重複したデータが作成される可能性があります。
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  disabled={loading || importStatus === 'importing'}
                  className="flex items-center space-x-2"
                >
                  <ArrowUpTrayIcon className="h-4 w-4" />
                  <span>ファイルを選択</span>
                </Button>
              </div>

              {importFile && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon()}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{importFile.name}</p>
                        <p className="text-xs text-gray-600">{getStatusText()}</p>
                      </div>
                    </div>
                    <Button onClick={handleResetFile} variant="outline" size="sm">
                      削除
                    </Button>
                  </div>

                  {loading && importStatus === 'importing' && (
                    <div className="space-y-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500">{progress}%</div>
                    </div>
                  )}

                  {validationResult && !validationResult.isValid && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="text-sm text-red-800 font-medium mb-2">検証エラー:</div>
                      <ul className="text-xs text-red-600 space-y-1">
                        {validationResult.errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {importStatus === 'ready' && (
                    <Button 
                      onClick={handleImport}
                      disabled={loading}
                      className="flex items-center space-x-2"
                    >
                      <ArrowUpTrayIcon className="h-4 w-4" />
                      <span>インポート実行</span>
                    </Button>
                  )}

                  {importStatus === 'success' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        <p className="text-sm text-green-800 font-medium">
                          インポートが完了しました
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}