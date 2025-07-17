import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useFoodRecord, useFoodRecordActions } from '../db/hooks'
import { parseTags } from '../db/helpers'
import { XMarkIcon, MapPinIcon } from '@heroicons/react/24/outline'

export default function EditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const record = useFoodRecord(id ? parseInt(id) : undefined)
  const { updateRecord, loading, error } = useFoodRecordActions()
  
  const [comment, setComment] = useState('')
  const [tags, setTags] = useState('')
  const [location, setLocation] = useState<{lat: number, lng: number, accuracy: number} | undefined>(undefined)

  useEffect(() => {
    if (record) {
      setComment(record.comment)
      setTags(record.tags.join(', '))
      setLocation(record.location || undefined)
    }
  }, [record])

  if (!record) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">記録が見つかりません</p>
        <Link to="/" className="text-blue-500 hover:text-blue-600 underline">
          ホームに戻る
        </Link>
      </div>
    )
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
    
    try {
      await updateRecord(record.id!, {
        comment,
        tags: parseTags(tags),
        location
      })
      navigate(`/detail/${record.id}`)
    } catch (err) {
      console.error('更新に失敗しました:', err)
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">記録を編集</h1>
        <button
          onClick={() => navigate(`/detail/${record.id}`)}
          className="text-gray-500 hover:text-gray-700 flex items-center"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="card">
        <img
          src={URL.createObjectURL(record.photo)}
          alt="食事の写真"
          className="w-full h-64 object-cover"
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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
          disabled={loading}
          className="w-full btn-primary disabled:bg-gray-300 disabled:text-gray-500"
        >
          {loading ? '更新中...' : '更新を保存'}
        </button>
      </form>
    </div>
  )
}