import { useParams, useNavigate, Link } from 'react-router-dom'
import { useFoodRecord, useFoodRecordActions } from '../db/hooks'
import { formatDateTime } from '../db/helpers'
import { ArrowLeftIcon, StarIcon, PencilIcon, TrashIcon, ShareIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import { SimpleMap } from '../components/Location'
import { ImagePreview, Button } from '../components/Common'

export default function DetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const record = useFoodRecord(id ? parseInt(id) : undefined)
  const { deleteRecord, toggleFavorite, loading } = useFoodRecordActions()

  if (!record) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">記録が見つかりません</p>
        <Link to="/" className="text-accent hover:text-accent/80 underline">
          ホームに戻る
        </Link>
      </div>
    )
  }

  const handleDelete = async () => {
    if (window.confirm('この記録を削除しますか？\n\nこの操作は取り消せません。')) {
      try {
        await deleteRecord(record.id!)
        navigate('/')
      } catch (err) {
        console.error('削除に失敗しました:', err)
        alert('削除に失敗しました。もう一度お試しください。')
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

  const handleShare = async (record: any) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'フードログ - 食事記録',
          text: record.comment || '食事記録をシェアします',
          url: window.location.href
        })
      } catch (err) {
        console.error('シェアに失敗しました:', err)
      }
    } else {
      // Web Share APIが利用できない場合はURLをコピー
      try {
        await navigator.clipboard.writeText(window.location.href)
        alert('URLをコピーしました')
      } catch (err) {
        console.error('URLコピーに失敗しました:', err)
      }
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <Button
          onClick={() => navigate('/')}
          variant="ghost"
          size="sm"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-1" />
          戻る
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleToggleFavorite}
            disabled={loading}
            variant="outline"
            size="sm"
            className={record.favorite ? 'text-yellow-500 border-yellow-500' : ''}
          >
            {record.favorite ? (
              <StarSolidIcon className="h-4 w-4 mr-1" />
            ) : (
              <StarIcon className="h-4 w-4 mr-1" />
            )}
            {record.favorite ? 'お気に入り解除' : 'お気に入り'}
          </Button>
          
          <Link to={`/edit/${record.id}`}>
            <Button variant="outline" size="sm">
              <PencilIcon className="h-4 w-4 mr-1" />
              編集
            </Button>
          </Link>
          
          <Button
            onClick={handleDelete}
            disabled={loading}
            variant="outline"
            size="sm"
            className="text-primary border-primary hover:bg-primary hover:text-white"
          >
            <TrashIcon className="h-4 w-4 mr-1" />
            削除
          </Button>
          
          <Button
            onClick={() => handleShare(record)}
            variant="outline"
            size="sm"
          >
            <ShareIcon className="h-4 w-4 mr-1" />
            シェア
          </Button>
        </div>
      </div>

      <div className="card">
        <ImagePreview
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
                    className="px-2 py-1 bg-accent/10 text-accent text-sm rounded-md"
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
              <div className="space-y-2">
                <SimpleMap
                  location={{
                    ...record.location,
                    timestamp: Date.now()
                  }}
                  height={200}
                  zoom={15}
                  className="rounded-lg"
                />
                <p className="text-sm text-gray-600">
                  緯度: {record.location.lat.toFixed(6)}, 経度: {record.location.lng.toFixed(6)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}