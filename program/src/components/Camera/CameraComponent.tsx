import { useState, useRef, useEffect, useCallback } from 'react'
import { XMarkIcon, CameraIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import { Button } from '../Common'
import { usePermission } from '../../hooks/usePermissions'
import DebugPanel from '../DebugPanel'

interface CameraComponentProps {
  onCapture: (blob: Blob) => void
  onClose: () => void
}

export default function CameraComponent({ onCapture, onClose }: CameraComponentProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const {
    status: permissionStatus,
    requestPermission,
    isSupported
  } = usePermission('camera')

  // デバッグ情報
  const debugInfo = {
    protocol: window.location.protocol,
    hostname: window.location.hostname,
    isHttps: window.location.protocol === 'https:',
    isLocalhost: window.location.hostname === 'localhost' || 
                 window.location.hostname === '127.0.0.1' ||
                 window.location.hostname.startsWith('192.168.'),
    permissionStatus,
    isSupported,
    hasNavigator: !!navigator,
    hasMediaDevices: !!navigator.mediaDevices,
    hasGetUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
    userAgent: navigator.userAgent.substring(0, 50) + '...',
    isLoading,
    error: error || 'なし',
    streamActive: !!stream
  }

  const getConstraints = useCallback((facing: 'user' | 'environment') => {
    return {
      video: {
        width: { ideal: 1920, max: 1920 },
        height: { ideal: 1080, max: 1080 },
        facingMode: { ideal: facing },
        aspectRatio: { ideal: 16/9 }
      },
      audio: false
    }
  }, [])

  const startCamera = useCallback(async (facing: 'user' | 'environment') => {
    setIsLoading(true)
    setError(null)

    try {
      // 既存のストリームを停止
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }

      // 権限を確認・要求
      if (permissionStatus === 'denied') {
        throw new Error('カメラのアクセスが拒否されています。ブラウザの設定で許可してください。')
      }

      if (permissionStatus === 'prompt' || permissionStatus === 'unknown') {
        const status = await requestPermission()
        if (status !== 'granted') {
          throw new Error('カメラの使用権限が必要です')
        }
      }

      // カメラストリームを取得
      const constraints = getConstraints(facing)
      
      // モバイルデバイスでfacingModeがサポートされていない場合の回避策
      let mediaStream: MediaStream
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      } catch (err) {
        // facingModeが失敗した場合、基本的な設定で再試行
        console.warn('Facing mode failed, trying basic constraints:', err)
        const basicConstraints = {
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        }
        mediaStream = await navigator.mediaDevices.getUserMedia(basicConstraints)
      }
      
      setStream(mediaStream)
      
      // ビデオ要素にストリームを設定
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        await videoRef.current.play()
      }
      
    } catch (err) {
      console.error('Camera start error:', err)
      let errorMessage = 'カメラの起動に失敗しました'
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          errorMessage = 'カメラのアクセスが拒否されています。ブラウザの設定で許可してください。'
        } else if (err.name === 'NotFoundError') {
          errorMessage = 'カメラが見つかりません。デバイスにカメラが接続されていることを確認してください。'
        } else if (err.name === 'NotSupportedError') {
          errorMessage = 'お使いのブラウザはカメラ機能をサポートしていません。'
        } else if (err.name === 'NotReadableError') {
          errorMessage = 'カメラが他のアプリケーションで使用中の可能性があります。'
        } else {
          errorMessage = err.message
        }
      }
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [stream, permissionStatus, requestPermission, getConstraints])

  const switchCamera = useCallback(() => {
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user'
    setFacingMode(newFacingMode)
    startCamera(newFacingMode)
  }, [facingMode, startCamera])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    
    if (!context) return

    // キャンバスサイズをビデオサイズに合わせる
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    // ビデオフレームをキャンバスに描画
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    // Blobとして取得
    canvas.toBlob((blob) => {
      if (blob) {
        onCapture(blob)
      }
    }, 'image/jpeg', 0.85)
  }, [onCapture])

  const cleanup = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
  }, [stream])

  // 初期化
  useEffect(() => {
    // HTTPSチェック
    const isHttps = window.location.protocol === 'https:'
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       window.location.hostname.startsWith('192.168.')
    
    if (!isHttps && !isLocalhost) {
      setError('カメラ機能はHTTPS接続でのみ利用可能です。HTTPSでアクセスしてください。')
      setIsLoading(false)
      return
    }
    
    // 直接カメラAPIを試行（権限チェックを迂回）
    const tryCamera = async () => {
      try {
        // 権限チェックをスキップして直接カメラアクセスを試行
        const constraints = {
          video: { 
            facingMode: { ideal: 'environment' }
          },
          audio: false
        }
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        
        // 成功したらストリームを設定
        setStream(stream)
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
        setIsLoading(false)
        
      } catch (err) {
        console.error('Direct camera access failed:', err)
        
        // エラーメッセージを設定
        if (err instanceof Error) {
          if (err.name === 'NotAllowedError') {
            setError('カメラのアクセスが拒否されました。ブラウザの設定で許可してください。')
          } else if (err.name === 'NotFoundError') {
            setError('カメラが見つかりません。')
          } else {
            setError(`カメラエラー: ${err.message}`)
          }
        } else {
          setError('カメラの起動に失敗しました。')
        }
        setIsLoading(false)
      }
    }
    
    // カメラを試行
    tryCamera()

    return cleanup
  }, []) // 依存配列を空にして初期化時のみ実行

  // クリーンアップ
  useEffect(() => {
    return cleanup
  }, [cleanup])

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* デバッグパネル */}
      <DebugPanel info={debugInfo} title="カメラデバッグ情報" />
      
      <div className="flex flex-col h-full">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 bg-black text-white">
          <Button onClick={onClose} variant="ghost" size="sm">
            <XMarkIcon className="h-6 w-6" />
          </Button>
          <h2 className="text-lg font-medium">カメラ</h2>
          <div className="w-10" /> {/* スペース調整用 */}
        </div>

        {/* カメラビュー */}
        <div className="flex-1 relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                <p>カメラを起動中...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 p-6">
              <div className="text-white text-center max-w-md">
                <h3 className="text-lg font-medium mb-2">カメラエラー</h3>
                <p className="text-sm mb-4">{error}</p>
                <Button onClick={() => startCamera(facingMode)} variant="outline">
                  再試行
                </Button>
              </div>
            </div>
          )}

          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
            style={{ display: error ? 'none' : 'block' }}
          />

          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* コントロール */}
        {!isLoading && !error && (
          <div className="p-6 bg-black">
            <div className="flex items-center justify-center space-x-8">
              {/* カメラ切り替えボタン */}
              <Button
                onClick={switchCamera}
                variant="outline"
                size="sm"
                className="border-white text-white hover:bg-white hover:text-black"
              >
                <ArrowPathIcon className="h-5 w-5" />
              </Button>

              {/* 撮影ボタン */}
              <Button
                onClick={capturePhoto}
                className="w-16 h-16 rounded-full bg-white hover:bg-gray-200 flex items-center justify-center"
              >
                <CameraIcon className="h-8 w-8 text-black" />
              </Button>

              {/* スペース調整用 */}
              <div className="w-10" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}