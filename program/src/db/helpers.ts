export function parseTags(tagString: string): string[] {
  return tagString
    .split(/[,\s]+/)
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

export function formatDateTime(date: Date): string {
  return date.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 旧バージョンとの互換性のため残しますが、新しい実装を使用することを推奨
export async function compressImage(file: File | Blob): Promise<Blob> {
  // 新しい実装に移行
  const { compressImage: newCompressImage } = await import('../utils/imageProcessing')
  return newCompressImage(file)
}

export function createObjectURL(blob: Blob): string {
  return URL.createObjectURL(blob)
}

export function revokeObjectURL(url: string): void {
  URL.revokeObjectURL(url)
}