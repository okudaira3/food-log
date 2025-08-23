import { useCallback, useRef, useState } from 'react'

interface CompressionOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: 'jpeg' | 'png' | 'webp'
  maintainAspectRatio?: boolean
}

interface CompressionState {
  loading: boolean
  progress: number
  error: string | null
}

interface CompressionResult {
  blob: Blob
  originalSize: number
  compressedSize: number
  compressionRatio: number
}

/**
 * Web Workerを使用した画像圧縮フック
 */
export function useImageCompression() {
  const [state, setState] = useState<CompressionState>({
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
          new URL('../workers/imageCompression.worker.ts', import.meta.url),
          { type: 'module' }
        )
      } catch (error) {
        console.error('Failed to initialize image compression worker:', error)
        throw new Error('Web Worker not supported')
      }
    }
    return workerRef.current
  }, [])

  // 画像圧縮実行
  const compressImage = useCallback(async (
    file: File | Blob,
    options: CompressionOptions = {}
  ): Promise<CompressionResult> => {
    const originalSize = file.size
    
    return new Promise((resolve, reject) => {
      try {
        const worker = initWorker()
        const requestId = `req_${++requestIdRef.current}_${Date.now()}`
        
        setState({
          loading: true,
          progress: 0,
          error: null
        })

        const handleMessage = (event: MessageEvent) => {
          const { type, id, blob, error, progress } = event.data
          
          // 他のリクエストのレスポンスは無視
          if (id !== requestId) return

          switch (type) {
            case 'progress':
              setState(prev => ({
                ...prev,
                progress: progress || 0
              }))
              break

            case 'success':
              if (blob) {
                const compressionRatio = originalSize > 0 ? (originalSize - blob.size) / originalSize : 0
                
                setState({
                  loading: false,
                  progress: 100,
                  error: null
                })

                worker.removeEventListener('message', handleMessage)
                
                resolve({
                  blob,
                  originalSize,
                  compressedSize: blob.size,
                  compressionRatio
                })
              } else {
                const errorMsg = 'No compressed blob received'
                setState({
                  loading: false,
                  progress: 0,
                  error: errorMsg
                })
                worker.removeEventListener('message', handleMessage)
                reject(new Error(errorMsg))
              }
              break

            case 'error':
              const errorMessage = error || 'Unknown compression error'
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
        
        // エラーハンドリング
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

        // 圧縮リクエストを送信
        worker.postMessage({
          type: 'compress',
          file,
          options,
          id: requestId
        })

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to start compression'
        setState({
          loading: false,
          progress: 0,
          error: errorMsg
        })
        reject(new Error(errorMsg))
      }
    })
  }, [initWorker])

  // フォールバック：Web Workerが使用できない場合のメインスレッド処理
  const compressImageFallback = useCallback(async (
    file: File | Blob,
    options: CompressionOptions = {}
  ): Promise<CompressionResult> => {
    // 既存のimageProcessing.tsのcompressImage関数を使用
    const { compressImage: mainThreadCompress } = await import('../utils/imageProcessing')
    
    setState({
      loading: true,
      progress: 50, // 中間進捗
      error: null
    })

    try {
      const blob = await mainThreadCompress(file, options)
      const originalSize = file.size
      const compressionRatio = originalSize > 0 ? (originalSize - blob.size) / originalSize : 0

      setState({
        loading: false,
        progress: 100,
        error: null
      })

      return {
        blob,
        originalSize,
        compressedSize: blob.size,
        compressionRatio
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Compression failed'
      setState({
        loading: false,
        progress: 0,
        error: errorMsg
      })
      throw error
    }
  }, [])

  // 安全な圧縮関数（Workerに失敗した場合はフォールバック）
  const safeCompressImage = useCallback(async (
    file: File | Blob,
    options: CompressionOptions = {}
  ): Promise<CompressionResult> => {
    try {
      return await compressImage(file, options)
    } catch (workerError) {
      console.warn('Worker compression failed, falling back to main thread:', workerError)
      return await compressImageFallback(file, options)
    }
  }, [compressImage, compressImageFallback])

  // クリーンアップ
  const cleanup = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate()
      workerRef.current = null
    }
  }, [])

  // コンポーネントのアンマウント時のクリーンアップ
  const resetState = useCallback(() => {
    setState({
      loading: false,
      progress: 0,
      error: null
    })
  }, [])

  return {
    // 状態
    loading: state.loading,
    progress: state.progress,
    error: state.error,
    
    // 関数
    compressImage: safeCompressImage,
    resetState,
    cleanup
  }
}