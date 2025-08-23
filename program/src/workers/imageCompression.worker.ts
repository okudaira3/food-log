// Web Worker用の画像圧縮処理
// このファイルはWeb Workerコンテキストで実行される

interface CompressionOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: 'jpeg' | 'png' | 'webp'
  maintainAspectRatio?: boolean
}

interface WorkerMessage {
  type: 'compress'
  file: File | Blob
  options?: CompressionOptions
  id: string // リクエストID
}

interface WorkerResponse {
  type: 'success' | 'error' | 'progress'
  id: string
  blob?: Blob
  error?: string
  progress?: number
}

// デフォルト設定
const DEFAULT_OPTIONS: Required<CompressionOptions> = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 0.8,
  format: 'jpeg',
  maintainAspectRatio: true
}

/**
 * Web Workerでの画像圧縮処理（ImageBitmapとOffscreenCanvasを使用）
 */
async function compressImageInWorker(
  file: File | Blob,
  options: CompressionOptions = {}
): Promise<Blob> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  
  try {
    // createImageBitmapを使用して画像を読み込み
    const imageBitmap = await createImageBitmap(file)
    
    const { width, height } = calculateDimensions(
      imageBitmap.width,
      imageBitmap.height,
      opts.maxWidth,
      opts.maxHeight,
      opts.maintainAspectRatio
    )
    
    // OffscreenCanvasが利用可能か確認
    if (typeof OffscreenCanvas !== 'undefined') {
      const canvas = new OffscreenCanvas(width, height)
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        throw new Error('OffscreenCanvas context not available')
      }
      
      // 背景を白で塗りつぶす（JPEGの場合）
      if (opts.format === 'jpeg') {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, width, height)
      }
      
      // 画像を描画
      ctx.drawImage(imageBitmap, 0, 0, width, height)
      
      // ImageBitmapをクリーンアップ
      imageBitmap.close()
      
      // Blobとして出力
      return await canvas.convertToBlob({
        type: `image/${opts.format}`,
        quality: opts.quality
      })
    } else {
      // OffscreenCanvasが利用できない場合はエラーを投げる
      // メインスレッドでのフォールバック処理に任せる
      throw new Error('OffscreenCanvas not supported')
    }
  } catch (error) {
    console.error('Worker compression error:', error)
    throw error
  }
}

/**
 * アスペクト比を維持してサイズを計算
 */
function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number,
  maintainAspectRatio: boolean
): { width: number; height: number } {
  if (!maintainAspectRatio) {
    return {
      width: Math.min(originalWidth, maxWidth),
      height: Math.min(originalHeight, maxHeight)
    }
  }
  
  const aspectRatio = originalWidth / originalHeight
  
  let width = originalWidth
  let height = originalHeight
  
  // 幅が上限を超える場合
  if (width > maxWidth) {
    width = maxWidth
    height = width / aspectRatio
  }
  
  // 高さが上限を超える場合
  if (height > maxHeight) {
    height = maxHeight
    width = height * aspectRatio
  }
  
  return {
    width: Math.round(width),
    height: Math.round(height)
  }
}

// Web Workerのメッセージハンドラー
self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const { type, file, options, id } = event.data
  
  if (type === 'compress') {
    try {
      // 進行状況を報告
      self.postMessage({
        type: 'progress',
        id,
        progress: 0
      } as WorkerResponse)
      
      // 画像圧縮を実行
      const compressedBlob = await compressImageInWorker(file, options)
      
      // 完了を報告
      self.postMessage({
        type: 'progress',
        id,
        progress: 100
      } as WorkerResponse)
      
      // 結果を送信
      self.postMessage({
        type: 'success',
        id,
        blob: compressedBlob
      } as WorkerResponse)
      
    } catch (error) {
      // エラーを報告
      self.postMessage({
        type: 'error',
        id,
        error: error instanceof Error ? error.message : 'Unknown error'
      } as WorkerResponse)
    }
  }
}

// TypeScript用のexport（実際には使用されない）
export {}