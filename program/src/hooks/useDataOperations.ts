import { useCallback, useRef, useState } from 'react'
import { FoodRecord } from '../types'

interface ExportData {
  version: string
  exportedAt: string
  records: any[]
}

interface OperationState {
  loading: boolean
  progress: number
  error: string | null
}

interface ValidationResult {
  isValid: boolean
  errors: string[]
}

/**
 * データのエクスポート・インポート操作を管理するフック
 */
export function useDataOperations() {
  const [state, setState] = useState<OperationState>({
    loading: false,
    progress: 0,
    error: null
  })
  
  const workerRef = useRef<Worker | null>(null)
  const requestIdRef = useRef<number>(0)

  // Worker初期化
  const initWorker = useCallback(() => {
    if (!workerRef.current) {
      try {
        workerRef.current = new Worker(
          new URL('../workers/dataOperations.worker.ts', import.meta.url),
          { type: 'module' }
        )
      } catch (error) {
        console.error('Failed to initialize data operations worker:', error)
        throw new Error('Web Worker not supported')
      }
    }
    return workerRef.current
  }, [])

  // データエクスポート
  const exportData = useCallback(async (records: FoodRecord[]): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        const worker = initWorker()
        const requestId = `export_${++requestIdRef.current}_${Date.now()}`
        
        setState({
          loading: true,
          progress: 0,
          error: null
        })

        const handleMessage = (event: MessageEvent) => {
          const { type, id, data, error, progress } = event.data
          
          if (id !== requestId) return

          switch (type) {
            case 'progress':
              setState(prev => ({
                ...prev,
                progress: progress || 0
              }))
              break

            case 'success':
              setState({
                loading: false,
                progress: 100,
                error: null
              })

              worker.removeEventListener('message', handleMessage)
              
              // エクスポートデータをJSON文字列として返す
              resolve(JSON.stringify(data, null, 2))
              break

            case 'error':
              const errorMessage = error || 'Export failed'
              setState({
                loading: false,
                progress: 0,
                error: errorMessage
              })
              worker.removeEventListener('message', handleMessage)
              reject(new Error(errorMessage))
              break
          }
        }

        worker.addEventListener('message', handleMessage)
        worker.addEventListener('error', (error) => {
          const errorMsg = `Worker error: ${error.message}`
          setState({
            loading: false,
            progress: 0,
            error: errorMsg
          })
          worker.removeEventListener('message', handleMessage)
          reject(new Error(errorMsg))
        })

        worker.postMessage({
          type: 'export',
          data: records,
          id: requestId
        })

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to start export'
        setState({
          loading: false,
          progress: 0,
          error: errorMsg
        })
        reject(new Error(errorMsg))
      }
    })
  }, [initWorker])

  // データインポート
  const importData = useCallback(async (jsonData: string): Promise<FoodRecord[]> => {
    return new Promise((resolve, reject) => {
      try {
        const exportData: ExportData = JSON.parse(jsonData)
        const worker = initWorker()
        const requestId = `import_${++requestIdRef.current}_${Date.now()}`
        
        setState({
          loading: true,
          progress: 0,
          error: null
        })

        const handleMessage = (event: MessageEvent) => {
          const { type, id, data, error, progress } = event.data
          
          if (id !== requestId) return

          switch (type) {
            case 'progress':
              setState(prev => ({
                ...prev,
                progress: progress || 0
              }))
              break

            case 'success':
              setState({
                loading: false,
                progress: 100,
                error: null
              })

              worker.removeEventListener('message', handleMessage)
              resolve(data as FoodRecord[])
              break

            case 'error':
              const errorMessage = error || 'Import failed'
              setState({
                loading: false,
                progress: 0,
                error: errorMessage
              })
              worker.removeEventListener('message', handleMessage)
              reject(new Error(errorMessage))
              break
          }
        }

        worker.addEventListener('message', handleMessage)
        worker.addEventListener('error', (error) => {
          const errorMsg = `Worker error: ${error.message}`
          setState({
            loading: false,
            progress: 0,
            error: errorMsg
          })
          worker.removeEventListener('message', handleMessage)
          reject(new Error(errorMsg))
        })

        worker.postMessage({
          type: 'import',
          data: exportData,
          id: requestId
        })

      } catch (parseError) {
        const errorMsg = 'Invalid JSON format'
        setState({
          loading: false,
          progress: 0,
          error: errorMsg
        })
        reject(new Error(errorMsg))
      }
    })
  }, [initWorker])

  // データ検証
  const validateData = useCallback(async (jsonData: string): Promise<ValidationResult> => {
    return new Promise((resolve, reject) => {
      try {
        const data = JSON.parse(jsonData)
        const worker = initWorker()
        const requestId = `validate_${++requestIdRef.current}_${Date.now()}`

        const handleMessage = (event: MessageEvent) => {
          const { type, id, data: validationResult, error } = event.data
          
          if (id !== requestId) return

          switch (type) {
            case 'success':
              worker.removeEventListener('message', handleMessage)
              resolve(validationResult as ValidationResult)
              break

            case 'error':
              worker.removeEventListener('message', handleMessage)
              reject(new Error(error || 'Validation failed'))
              break
          }
        }

        worker.addEventListener('message', handleMessage)
        worker.addEventListener('error', (error) => {
          worker.removeEventListener('message', handleMessage)
          reject(new Error(`Worker error: ${error.message}`))
        })

        worker.postMessage({
          type: 'validate',
          data: data,
          id: requestId
        })

      } catch (parseError) {
        resolve({
          isValid: false,
          errors: ['Invalid JSON format']
        })
      }
    })
  }, [initWorker])

  // ファイルダウンロード
  const downloadFile = useCallback((content: string, filename: string, type: string = 'application/json') => {
    try {
      const blob = new Blob([content], { type })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      
      // クリーンアップ
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
      throw new Error('Failed to download file')
    }
  }, [])

  // ファイル読み込み
  const readFile = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (event) => {
        const result = event.target?.result
        if (typeof result === 'string') {
          resolve(result)
        } else {
          reject(new Error('Failed to read file as text'))
        }
      }
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'))
      }
      
      reader.readAsText(file, 'UTF-8')
    })
  }, [])

  // 状態リセット
  const resetState = useCallback(() => {
    setState({
      loading: false,
      progress: 0,
      error: null
    })
  }, [])

  // クリーンアップ
  const cleanup = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate()
      workerRef.current = null
    }
  }, [])

  return {
    // 状態
    loading: state.loading,
    progress: state.progress,
    error: state.error,
    
    // 操作関数
    exportData,
    importData,
    validateData,
    downloadFile,
    readFile,
    resetState,
    cleanup
  }
}