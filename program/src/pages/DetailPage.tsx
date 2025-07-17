import { useParams, useNavigate, Link } from 'react-router-dom'
import { useFoodRecord, useFoodRecordActions } from '../db/hooks'
import { formatDateTime } from '../db/helpers'
import { ArrowLeftIcon, StarIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'

export default function DetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const record = useFoodRecord(id ? parseInt(id) : undefined)
  const { deleteRecord, toggleFavorite, loading } = useFoodRecordActions()

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

  const handleDelete = async () => {
    if (window.confirm('この記録を削除しますか？')) {
      try {
        await deleteRecord(record.id!)
        navigate('/')
      } catch (err) {
        console.error('削除に失敗しました:', err)
      }
    }
  }

  const handleToggleFavorite = async () => {
    try {
      await toggleFavorite(record.id!)
    } catch (err) {
      console.error('お気に入りの更新に失敗しました:', err)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate('/')}
          className="text-gray-500 hover:text-gray-700 flex items-center"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-1" />
          戻る
        </button>
        <div className="flex space-x-2">
          <button
            onClick={handleToggleFavorite}
            disabled={loading}
            className={`flex items-center ${record.favorite ? 'text-yellow-500' : 'text-gray-300'} hover:text-yellow-500 transition-colors`}
          >
            {record.favorite ? (
              <StarSolidIcon className="h-6 w-6" />
            ) : (
              <StarIcon className="h-6 w-6" />
            )}
          </button>
          <Link
            to={`/edit/${record.id}`}
            className="text-green-500 hover:text-green-600 flex items-center"
          >
            <PencilIcon className="h-5 w-5 mr-1" />
            編集
          </Link>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="text-red-500 hover:text-red-600 flex items-center"
          >
            <TrashIcon className="h-5 w-5 mr-1" />
            削除
          </button>
        </div>
      </div>

      <div className="card">
        <img
          src={URL.createObjectURL(record.photo)}
          alt="食事の写真"
          className="w-full h-96 object-cover"
        />
        
        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">コメント</h3>
            <p className="text-gray-700">{record.comment || 'コメントなし'}</p>
          </div>

          {record.tags.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">タグ</h3>
              <div className="flex flex-wrap gap-2">
                {record.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">日時</h3>
            <p className="text-gray-700">{formatDateTime(record.timestamp)}</p>
          </div>

          {record.location && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">位置情報</h3>
              <p className="text-gray-700">
                緯度: {record.location.lat.toFixed(6)}, 経度: {record.location.lng.toFixed(6)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}