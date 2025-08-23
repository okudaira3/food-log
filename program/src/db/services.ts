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
    // インデックスを活用した効率的なクエリ実装
    let query = db.foodRecords.orderBy('timestamp').reverse()

    // 日付範囲フィルター（インデックス活用）
    if (filters.dateFrom && filters.dateTo) {
      query = db.foodRecords
        .where('timestamp')
        .between(filters.dateFrom, filters.dateTo, true, true)
        .reverse()
    } else if (filters.dateFrom) {
      query = db.foodRecords
        .where('timestamp')
        .aboveOrEqual(filters.dateFrom)
        .reverse()
    } else if (filters.dateTo) {
      query = db.foodRecords
        .where('timestamp')
        .belowOrEqual(filters.dateTo)
        .reverse()
    }

    // お気に入りフィルター
    if (filters.favoritesOnly) {
      // 複合インデックス [favorite+timestamp] を活用
      query = db.foodRecords
        .where('[favorite+timestamp]')
        .between([true, new Date(0)], [true, new Date()])
        .reverse()
    }

    // タグフィルター（マルチエントリインデックス活用）
    if (filters.tags && filters.tags.length > 0) {
      // 最初のタグでインデックス検索、その後フィルタリング
      const firstTag = filters.tags[0]
      query = db.foodRecords
        .where('tags')
        .equals(firstTag)
        .and((record) => {
          // 残りのタグもすべて含んでいることを確認
          return filters.tags!.every(tag => record.tags.includes(tag))
        })
    }

    let results = await query.toArray()

    // フルテキスト検索（最後に実行）
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase()
      results = results.filter((record) =>
        record.comment.toLowerCase().includes(searchLower)
      )
    }

    return results
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