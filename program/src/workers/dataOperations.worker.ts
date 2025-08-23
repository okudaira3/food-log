// Web Worker for data operations (export/import)
// This file runs in a Web Worker context

interface FoodRecord {
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

interface ExportData {
  version: string
  exportedAt: string
  records: ExportRecord[]
}

interface ExportRecord {
  id?: number
  photoBase64: string
  photoType: string
  comment: string
  tags: string[]
  location?: {
    lat: number
    lng: number
    accuracy: number
  }
  timestamp: string
  favorite: boolean
  createdAt: string
  updatedAt: string
}

interface WorkerMessage {
  type: 'export' | 'import' | 'validate'
  data: any
  id: string
}

interface WorkerResponse {
  type: 'progress' | 'success' | 'error'
  id: string
  progress?: number
  data?: any
  error?: string
}

/**
 * Blobを Base64 文字列に変換
 */
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // data:image/jpeg;base64, の部分を除去
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = () => reject(new Error('Failed to read blob as base64'))
    reader.readAsDataURL(blob)
  })
}

/**
 * Base64 文字列を Blob に変換
 */
function base64ToBlob(base64: string, type: string): Blob {
  const byteCharacters = atob(base64)
  const byteNumbers = new Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  const byteArray = new Uint8Array(byteNumbers)
  return new Blob([byteArray], { type })
}

/**
 * データをエクスポート形式に変換
 */
async function exportRecords(records: FoodRecord[]): Promise<ExportData> {
  const exportRecords: ExportRecord[] = []
  const total = records.length
  
  for (let i = 0; i < records.length; i++) {
    const record = records[i]
    
    // 進捗報告
    const progress = Math.round(((i + 1) / total) * 100)
    self.postMessage({
      type: 'progress',
      id: 'export',
      progress
    } as WorkerResponse)
    
    try {
      // Blobを Base64 に変換
      const photoBase64 = await blobToBase64(record.photo)
      
      const exportRecord: ExportRecord = {
        id: record.id,
        photoBase64,
        photoType: record.photo.type,
        comment: record.comment,
        tags: record.tags,
        location: record.location,
        timestamp: record.timestamp.toISOString(),
        favorite: record.favorite,
        createdAt: record.createdAt.toISOString(),
        updatedAt: record.updatedAt.toISOString()
      }
      
      exportRecords.push(exportRecord)
    } catch (error) {
      console.error(`Failed to export record ${record.id}:`, error)
      // エラーが発生したレコードはスキップして継続
    }
  }
  
  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    records: exportRecords
  }
}

/**
 * インポートデータをFoodRecord形式に変換
 */
async function importRecords(exportData: ExportData): Promise<FoodRecord[]> {
  const records: FoodRecord[] = []
  const total = exportData.records.length
  
  for (let i = 0; i < exportData.records.length; i++) {
    const exportRecord = exportData.records[i]
    
    // 進捗報告
    const progress = Math.round(((i + 1) / total) * 100)
    self.postMessage({
      type: 'progress',
      id: 'import',
      progress
    } as WorkerResponse)
    
    try {
      // Base64 を Blob に変換
      const photo = base64ToBlob(exportRecord.photoBase64, exportRecord.photoType)
      
      const record: FoodRecord = {
        // IDは新規作成時は除外（自動採番）
        photo,
        comment: exportRecord.comment,
        tags: exportRecord.tags,
        location: exportRecord.location,
        timestamp: new Date(exportRecord.timestamp),
        favorite: exportRecord.favorite,
        createdAt: new Date(exportRecord.createdAt),
        updatedAt: new Date(exportRecord.updatedAt)
      }
      
      records.push(record)
    } catch (error) {
      console.error(`Failed to import record ${exportRecord.id}:`, error)
      // エラーが発生したレコードはスキップして継続
    }
  }
  
  return records
}

/**
 * エクスポートデータの検証
 */
function validateExportData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // 基本構造の確認
  if (!data || typeof data !== 'object') {
    errors.push('Invalid data format')
    return { isValid: false, errors }
  }
  
  if (!data.version) {
    errors.push('Missing version field')
  }
  
  if (!data.exportedAt) {
    errors.push('Missing exportedAt field')
  }
  
  if (!Array.isArray(data.records)) {
    errors.push('Records must be an array')
    return { isValid: false, errors }
  }
  
  // レコード構造の確認（最初の数件をサンプル検証）
  const sampleSize = Math.min(5, data.records.length)
  for (let i = 0; i < sampleSize; i++) {
    const record = data.records[i]
    
    if (!record.photoBase64) {
      errors.push(`Record ${i}: Missing photoBase64`)
    }
    
    if (!record.photoType) {
      errors.push(`Record ${i}: Missing photoType`)
    }
    
    if (typeof record.comment !== 'string') {
      errors.push(`Record ${i}: Invalid comment type`)
    }
    
    if (!Array.isArray(record.tags)) {
      errors.push(`Record ${i}: Tags must be an array`)
    }
    
    if (!record.timestamp) {
      errors.push(`Record ${i}: Missing timestamp`)
    }
    
    if (typeof record.favorite !== 'boolean') {
      errors.push(`Record ${i}: Invalid favorite type`)
    }
  }
  
  return { 
    isValid: errors.length === 0, 
    errors: errors.slice(0, 10) // 最大10個のエラーまで報告
  }
}

// Web Workerのメッセージハンドラー
self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const { type, data, id } = event.data
  
  try {
    switch (type) {
      case 'export':
        self.postMessage({
          type: 'progress',
          id,
          progress: 0
        } as WorkerResponse)
        
        const exportData = await exportRecords(data as FoodRecord[])
        
        self.postMessage({
          type: 'success',
          id,
          data: exportData
        } as WorkerResponse)
        break
        
      case 'import':
        self.postMessage({
          type: 'progress',
          id,
          progress: 0
        } as WorkerResponse)
        
        const importedRecords = await importRecords(data as ExportData)
        
        self.postMessage({
          type: 'success',
          id,
          data: importedRecords
        } as WorkerResponse)
        break
        
      case 'validate':
        const validation = validateExportData(data)
        
        self.postMessage({
          type: 'success',
          id,
          data: validation
        } as WorkerResponse)
        break
        
      default:
        throw new Error(`Unknown operation type: ${type}`)
    }
  } catch (error) {
    self.postMessage({
      type: 'error',
      id,
      error: error instanceof Error ? error.message : 'Unknown error'
    } as WorkerResponse)
  }
}

// TypeScript用のexport（実際には使用されない）
export {}