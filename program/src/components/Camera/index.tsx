import { useState, useRef, useCallback, useEffect } from 'react'
import { CameraIcon, XMarkIcon, CheckIcon, ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { Button } from '../Common'
import { usePermission } from '../../hooks/usePermissions'

interface CameraComponentProps {
  onCapture: (blob: Blob) => void
  onClose: () => void
}

export default function CameraComponent({ onCapture, onClose }: CameraComponentProps) {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // カメラ権限管理
  const {
    status: permissionStatus,
    error: permissionError,
    isSupported,
    requestPermission
  } = usePermission('camera')

  // 権限状態が変更された時の処理
  useEffect(() => {
    if (permissionStatus === 'denied' && isCapturing) {
      setError('カメラの使用が拒否されています')
      setIsCapturing(false)
    }
  }, [permissionStatus, isCapturing])

  const startCamera = useCallback(async () => {
    try {
      setError(null)
      
      // 権限の確認と要求
      if (permissionStatus === 'prompt' || permissionStatus === 'unknown') {
        const status = await requestPermission()
        if (status !== 'granted') {
          setError('カメラの使用が拒否されました')
          return
        }
      }
      
      if (permissionStatus === 'denied') {
        setError('カメラの使用が拒否されています。ブラウザの設定で許可してください。')
        return
      }

      if (!isSupported) {
        setError('このブラウザまたはデバイスではカメラが利用できません')
        return
      }

      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      }
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      setStream(mediaStream)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (err) {
      console.error('カメラアクセスエラー:', err)
      
      let errorMessage = 'カメラにアクセスできません'
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          errorMessage = 'カメラの使用が拒否されました。ブラウザの設定で許可してください。'
        } else if (err.name === 'NotFoundError') {
          errorMessage = 'カメラが見つかりません。デバイスにカメラが接続されていることを確認してください。'
        } else if (err.name === 'NotReadableError') {
          errorMessage = 'カメラが他のアプリケーションで使用中です。'
        } else {
          errorMessage = `カメラエラー: ${err.message}`
        }
      }
      
      setError(errorMessage)
    }
  }, [facingMode, permissionStatus, requestPermission, isSupported])

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
  }, [stream])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return
    
    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    
    if (!context) return
    
    // キャンバスサイズを動画サイズに合わせる
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    // 動画フレームをキャンバスに描画
    context.drawImage(video, 0, 0)
    
    // キャンバスからデータURLを取得
    const dataURL = canvas.toDataURL('image/jpeg', 0.8)
    setCapturedImage(dataURL)
    
    // カメラを停止
    stopCamera()
  }, [stopCamera])

  const retakePhoto = useCallback(() => {
    setCapturedImage(null)
    startCamera()
  }, [startCamera])

  const confirmPhoto = useCallback(() => {
    if (!capturedImage) return
    
    // DataURLをBlobに変換
    fetch(capturedImage)
      .then(res => res.blob())
      .then(blob => {
        onCapture(blob)
        onClose()
      })
      .catch(err => {
        console.error('画像変換エラー:', err)
        setError('画像の処理に失敗しました')
      })
  }, [capturedImage, onCapture, onClose])

  const switchCamera = useCallback(() => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
    stopCamera()
  }, [stopCamera])

  // カメラ開始
  const handleStartCamera = () => {
    setIsCapturing(true)
    startCamera()
  }

  // コンポーネントクリーンアップ
  const handleClose = () => {
    stopCamera()
    onClose()
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md mx-4">
          <h3 className="text-lg font-semibold mb-4 text-red-600">エラー</h3>
          <p className="text-gray-700 mb-4">{error}</p>
          <div className="flex justify-end space-x-2">
            <Button onClick={handleClose} variant="secondary">
              閉じる
            </Button>
            <Button onClick={() => { setError(null); handleStartCamera(); }}>
              再試行
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!isCapturing) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md mx-4">
          <h3 className="text-lg font-semibold mb-4">カメラを起動</h3>
          <p className="text-gray-700 mb-4">カメラを使って写真を撮影しますか？</p>
          <div className="flex justify-end space-x-2">
            <Button onClick={handleClose} variant="secondary">
              キャンセル
            </Button>
            <Button onClick={handleStartCamera}>
              <CameraIcon className="h-5 w-5 mr-2" />
              カメラを起動
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      <div className="relative h-full">
        {/* ヘッダー */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-black bg-opacity-50 p-4">
          <div className="flex justify-between items-center">
            <button
              onClick={handleClose}
              className="text-white hover:text-gray-300 p-2"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            
            {stream && !capturedImage && (
              <button
                onClick={switchCamera}
                className="text-white hover:text-gray-300 p-2"
                title="カメラを切り替え"
              >
                <ArrowPathIcon className="h-6 w-6" />
              </button>
            )}
          </div>
        </div>

        {/* カメラビュー */}
        <div className="relative h-full flex items-center justify-center">
          {capturedImage ? (
            <img
              src={capturedImage}
              alt="撮影した写真"
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="max-w-full max-h-full object-contain"
            />
          )}
        </div>

        {/* キャンバス（非表示） */}
        <canvas ref={canvasRef} className="hidden" />

        {/* コントロール */}
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-6">
          <div className="flex justify-center items-center space-x-6">
            {capturedImage ? (
              <>
                <Button onClick={retakePhoto} variant="secondary">
                  撮り直し
                </Button>
                <Button onClick={confirmPhoto}>
                  <CheckIcon className="h-5 w-5 mr-2" />
                  使用する
                </Button>
              </>
            ) : (
              <button
                onClick={capturePhoto}
                className="w-16 h-16 bg-white rounded-full border-4 border-gray-300 hover:border-gray-400 transition-colors flex items-center justify-center"
                disabled={!stream}
              >
                <div className="w-12 h-12 bg-gray-300 rounded-full" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}