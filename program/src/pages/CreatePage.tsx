import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFoodRecordActions } from '../db/hooks'
import { parseTags } from '../db/helpers'
import { compressImage } from '../utils/imageProcessing'
import { LocationData } from '../utils/geolocation'
import { XMarkIcon, CameraIcon } from '@heroicons/react/24/outline'
import CameraComponent, { FileUpload } from '../components/Camera'
import { LocationCapture } from '../components/Location'
import { Button, ImagePreview, ErrorMessage } from '../components/Common'

export default function CreatePage() {
  const navigate = useNavigate()
  const { createRecord, loading, error } = useFoodRecordActions()
  
  const [photo, setPhoto] = useState<Blob | null>(null)
  const [comment, setComment] = useState('')
  const [tags, setTags] = useState('')
  const [location, setLocation] = useState<LocationData | undefined>(undefined)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [uploadMethod, setUploadMethod] = useState<'camera' | 'file' | null>(null)

  const handleFileSelect = async (file: File) => {
    try {
      const compressedPhoto = await compressImage(file)
      setPhoto(compressedPhoto)
      setPhotoPreview(URL.createObjectURL(compressedPhoto))
      setUploadMethod(null)
    } catch (err) {
      console.error('写真の圧縮に失敗しました:', err)
    }
  }

  const handleCameraCapture = async (blob: Blob) => {
    try {
      const compressedPhoto = await compressImage(blob)
      setPhoto(compressedPhoto)
      setPhotoPreview(URL.createObjectURL(compressedPhoto))
      setShowCamera(false)
      setUploadMethod(null)
    } catch (err) {
      console.error('写真の圧縮に失敗しました:', err)
    }
  }

  const handleClearPhoto = () => {
    setPhoto(null)
    setPhotoPreview(null)
    setUploadMethod(null)
  }

  const handleLocationCapture = (locationData: LocationData) => {
    setLocation(locationData)
  }

  const handleLocationClear = () => {
    setLocation(undefined)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    
    if (!photo) {
      alert('写真を選択してください')
      return
    }

    try {
      await createRecord({
        photo,
        comment,
        tags: parseTags(tags),
        location,
        timestamp: new Date(),
        favorite: false
      })
      navigate('/')
    } catch (err) {
      console.error('記録の保存に失敗しました:', err)
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">新しい記録</h1>
        <Button
          onClick={() => navigate('/')}
          variant="ghost"
          size="sm"
        >
          <XMarkIcon className="h-5 w-5" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            写真
          </label>
          
          {!photo && !uploadMethod && (
            <div className="space-y-3">
              <div className="flex space-x-3">
                <Button
                  type="button"
                  onClick={() => setShowCamera(true)}
                  className="flex-1 flex items-center justify-center"
                >
                  <CameraIcon className="h-5 w-5 mr-2" />
                  カメラで撮影
                </Button>
                <Button
                  type="button"
                  onClick={() => setUploadMethod('file')}
                  variant="outline"
                  className="flex-1"
                >
                  ファイルを選択
                </Button>
              </div>
            </div>
          )}
          
          {uploadMethod === 'file' && (
            <FileUpload
              onFileSelect={handleFileSelect}
              onCompressedBlobReady={(blob, _originalFile) => {
                setPhoto(blob)
                setPhotoPreview(URL.createObjectURL(blob))
                setUploadMethod(null)
              }}
              preview={photoPreview}
              onClearPreview={handleClearPhoto}
            />
          )}
          
          {photo && photoPreview && (
            <div className="relative">
              <ImagePreview
                src={photoPreview}
                alt="プレビュー"
                className="w-full h-64 object-cover rounded-md"
              />
              <Button
                type="button"
                onClick={handleClearPhoto}
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-75"
              >
                <XMarkIcon className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            コメント
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="食事の感想を書いてください"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            タグ
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="タグをカンマまたはスペースで区切って入力"
          />
        </div>

        <LocationCapture
          onLocationCapture={handleLocationCapture}
          onLocationClear={handleLocationClear}
          currentLocation={location}
          disabled={loading}
        />

        {error && (
          <ErrorMessage message={`保存に失敗しました: ${error.message}`} />
        )}

        <Button
          type="submit"
          disabled={loading || !photo}
          className="w-full"
        >
          {loading ? '保存中...' : '記録を保存'}
        </Button>
      </form>
      
      {showCamera && (
        <CameraComponent
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  )
}