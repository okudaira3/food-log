import { useRef, useState, useEffect } from 'react'
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { Button } from '../Common'
import { useImageCompression } from '../../hooks/useImageCompression'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  onCompressedBlobReady?: (blob: Blob, originalFile: File) => void
  accept?: string
  maxSize?: number // MB
  preview?: string | null
  onClearPreview?: () => void
  enableCompression?: boolean
  compressionOptions?: {
    maxWidth?: number
    maxHeight?: number
    quality?: number
    format?: 'jpeg' | 'png' | 'webp'
  }
}

export default function FileUpload({ 
  onFileSelect,
  onCompressedBlobReady,
  accept = "image/*", 
  maxSize = 10,
  preview,
  onClearPreview,
  enableCompression = true,
  compressionOptions = {}
}: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const { 
    compressImage, 
    loading: compressing, 
    progress: compressionProgress, 
    error: compressionError,
    resetState: resetCompressionState,
    cleanup: cleanupCompression
  } = useImageCompression()

  // クリーンアップ
  useEffect(() => {
    return () => {
      cleanupCompression()
    }
  }, [cleanupCompression])

  const validateFile = (file: File): boolean => {
    setError(null)
    
    // ファイルタイプチェック
    if (!file.type.startsWith('image/')) {
      setError('画像ファイルのみアップロードできます')
      return false
    }
    
    // ファイルサイズチェック
    if (file.size > maxSize * 1024 * 1024) {
      setError(`ファイルサイズが${maxSize}MBを超えています`)
      return false
    }
    
    return true
  }

  const handleFileSelect = async (file: File) => {
    if (!validateFile(file)) return
    
    resetCompressionState()
    
    try {
      if (enableCompression) {
        // 圧縮処理を実行
        const result = await compressImage(file, compressionOptions)
        
        // 圧縮結果をコールバックで通知
        onCompressedBlobReady?.(result.blob, file)
        
        console.log(`Image compressed: ${result.originalSize} -> ${result.compressedSize} bytes (${Math.round(result.compressionRatio * 100)}% reduction)`)
      } else {
        // 圧縮無しでそのまま通知
        onFileSelect(file)
      }
    } catch (error) {
      console.error('Image compression failed:', error)
      setError(error instanceof Error ? error.message : '画像の処理に失敗しました')
      
      // 圧縮に失敗した場合、元ファイルを使用
      onFileSelect(file)
    }
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(false)
    
    const file = event.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const clearPreview = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onClearPreview?.()
    setError(null)
  }

  return (
    <div className="space-y-4">
      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="プレビュー"
            className="w-full h-64 object-cover rounded-lg"
          />
          <button
            onClick={clearPreview}
            className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-75"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver
              ? 'border-green-500 bg-green-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">
              ファイルをドラッグ&ドロップまたは
            </p>
            <Button onClick={openFileDialog} variant="outline">
              ファイルを選択
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            サポート形式: JPG, PNG, GIF (最大{maxSize}MB)
          </p>
        </div>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
      />
      
      {/* 圧縮進捗表示 */}
      {compressing && (
        <div className="space-y-2">
          <div className="text-sm text-gray-600">画像を圧縮中...</div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${compressionProgress}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500">{compressionProgress}%</div>
        </div>
      )}
      
      {/* エラー表示 */}
      {(error || compressionError) && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
          {error || compressionError}
        </div>
      )}
    </div>
  )
}