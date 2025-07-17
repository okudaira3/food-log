import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useFoodRecordSearch } from '../db/hooks'
import { SearchFilters } from '../types'
import FoodCard from '../components/FoodCard'
import SearchFilter from '../components/SearchFilter'
import { Container, Button } from '../components/Common'

export default function HomePage() {
  const [filters, setFilters] = useState<SearchFilters>({})
  const records = useFoodRecordSearch(filters)

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters)
  }

  const handleResetFilters = () => {
    setFilters({})
  }

  return (
    <Container>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">フードログ</h1>
          <Link to="/create">
            <Button>写真を追加</Button>
          </Link>
        </div>

        <SearchFilter
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onReset={handleResetFilters}
        />

        {records.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              {Object.keys(filters).length > 0 
                ? '検索結果が見つかりません' 
                : 'まだ記録がありません'
              }
            </p>
            <Link
              to="/create"
              className="text-green-500 hover:text-green-600 underline"
            >
              最初の食事を記録しましょう
            </Link>
          </div>
        ) : (
          <>
            <div className="text-sm text-gray-600 mb-4">
              {records.length}件の記録が見つかりました
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {records.map((record) => (
                <FoodCard key={record.id} record={record} />
              ))}
            </div>
          </>
        )}
      </div>
    </Container>
  )
}