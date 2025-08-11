import { Link } from 'react-router-dom'
import { FoodRecord } from '../../types'
import { formatDate } from '../../db/helpers'
import { StarIcon } from '@heroicons/react/24/solid'
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline'
import { useFoodRecordActions } from '../../db/hooks'
import { Card, ImagePreview, Button } from '../Common'

interface FoodCardProps {
  record: FoodRecord
  onToggleFavorite?: (id: number) => void
}

export default function FoodCard({ record, onToggleFavorite }: FoodCardProps) {
  const { toggleFavorite } = useFoodRecordActions()

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (record.id) {
      await toggleFavorite(record.id)
      onToggleFavorite?.(record.id)
    }
  }

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-shadow">
      <Link to={`/detail/${record.id}`} className="block">
        <div className="relative">
          <ImagePreview
            src={URL.createObjectURL(record.photo)}
            alt="食事の写真"
            className="w-full h-48 object-cover"
          />
          <Button
            onClick={handleToggleFavorite}
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 p-2 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-colors"
            aria-label={record.favorite ? 'お気に入りを解除' : 'お気に入りに追加'}
          >
            {record.favorite ? (
              <StarIcon className="h-5 w-5 text-yellow-500" />
            ) : (
              <StarOutlineIcon className="h-5 w-5 text-gray-400" />
            )}
          </Button>
        </div>
        
        <div className="p-4">
          <div className="mb-2">
            <p className="card-content text-sm line-clamp-2">
              {record.comment || '説明なし'}
            </p>
          </div>
          
          {record.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {record.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                >
                  #{tag}
                </span>
              ))}
              {record.tags.length > 3 && (
                <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                  +{record.tags.length - 3}
                </span>
              )}
            </div>
          )}
          
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>{formatDate(record.timestamp)}</span>
            {record.location && (
              <span>📍 位置情報あり</span>
            )}
          </div>
        </div>
      </Link>
    </Card>
  )
}