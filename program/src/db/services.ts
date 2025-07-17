import { db } from './index'
import { FoodRecord, SearchFilters } from '../types'

export const foodRecordService = {
  async create(record: Omit<FoodRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    const now = new Date()
    const id = await db.foodRecords.add({
      ...record,
      createdAt: now,
      updatedAt: now
    })
    return id
  },

  async update(id: number, updates: Partial<Omit<FoodRecord, 'id' | 'createdAt'>>): Promise<void> {
    await db.foodRecords.update(id, {
      ...updates,
      updatedAt: new Date()
    })
  },

  async delete(id: number): Promise<void> {
    await db.foodRecords.delete(id)
  },

  async getById(id: number): Promise<FoodRecord | undefined> {
    return await db.foodRecords.get(id)
  },

  async getAll(): Promise<FoodRecord[]> {
    return await db.foodRecords.orderBy('timestamp').reverse().toArray()
  },

  async search(filters: SearchFilters): Promise<FoodRecord[]> {
    let collection = db.foodRecords.toCollection()

    if (filters.dateFrom || filters.dateTo) {
      collection = collection.filter((record) => {
        const timestamp = record.timestamp.getTime()
        const fromTime = filters.dateFrom ? filters.dateFrom.getTime() : 0
        const toTime = filters.dateTo ? filters.dateTo.getTime() : Date.now()
        return timestamp >= fromTime && timestamp <= toTime
      })
    }

    if (filters.favoritesOnly) {
      collection = collection.filter((record) => record.favorite === true)
    }

    let results = await collection.toArray()

    if (filters.tags && filters.tags.length > 0) {
      results = results.filter((record) =>
        filters.tags!.some((tag) => record.tags.includes(tag))
      )
    }

    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase()
      results = results.filter((record) =>
        record.comment.toLowerCase().includes(searchLower)
      )
    }

    return results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  },

  async toggleFavorite(id: number): Promise<void> {
    const record = await db.foodRecords.get(id)
    if (record) {
      await db.foodRecords.update(id, {
        favorite: !record.favorite,
        updatedAt: new Date()
      })
    }
  }
}