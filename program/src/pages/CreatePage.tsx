import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFoodRecordActions } from '../db/hooks'
import { parseTags, compressImage } from '../db/helpers'
import { XMarkIcon, MapPinIcon } from '@heroicons/react/24/outline'

export default function CreatePage() {
  const navigate = useNavigate()
  const { createRecord, loading, error } = useFoodRecordActions()
  
  const [photo, setPhoto] = useState<Blob | null>(null)
  const [comment, setComment] = useState('')
  const [tags, setTags] = useState('')
  const [location, setLocation] = useState<{lat: number, lng: number, accuracy: number} | undefined>(undefined)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      try {
        const compressedPhoto = await compressImage(file)
        setPhoto(compressedPhoto)
        setPhotoPreview(URL.createObjectURL(compressedPhoto))
      } catch (err) {
        console.error('写真の圧縮に失敗しました:', err)
      }
    }
  }

  const handleLocationCapture = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          })
        },
        (error) => {
          console.error('位置情報の取得に失敗しました:', error)
        }
      )
    }
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
        <button
          onClick={() => navigate('/')}
          className="text-gray-500 hover:text-gray-700 flex items-center"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            写真
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            required
          />
          {photoPreview && (
            <img
              src={photoPreview}
              alt="プレビュー"
              className="mt-2 w-full h-64 object-cover rounded-md"
            />
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

        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">位置情報</span>
            <button
              type="button"
              onClick={handleLocationCapture}
              className="text-sm text-green-500 hover:text-green-600 flex items-center"
            >
              <MapPinIcon className="h-4 w-4 mr-1" />
            現在地を取得
            </button>
          </div>
          {location && (
            <p className="text-sm text-gray-500">
              緯度: {location.lat.toFixed(6)}, 経度: {location.lng.toFixed(6)}
            </p>
          )}
        </div>

        {error && (
          <div className="text-red-600 text-sm">
            エラー: {error.message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !photo}
          className="w-full btn-primary disabled:bg-gray-300 disabled:text-gray-500"
        >
          {loading ? '保存中...' : '記録を保存'}
        </button>
      </form>
    </div>
  )
}