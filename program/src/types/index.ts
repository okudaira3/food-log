export interface FoodRecord {
  id?: number
  photo: Blob
  comment: string
  tags: string[]
  location?: {
    lat: number
    lng: number
    accuracy: number
  }
  timestamp: Date
  favorite: boolean
  createdAt: Date
  updatedAt: Date
}

export interface SearchFilters {
  dateFrom?: Date
  dateTo?: Date
  tags?: string[]
  searchText?: string
  favoritesOnly?: boolean
}
