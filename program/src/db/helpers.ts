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

export async function compressImage(file: File | Blob): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      reject(new Error('Canvas context not available'))
      return
    }

    img.onload = () => {
      const aspectRatio = img.width / img.height
      let targetWidth = 1200
      let targetHeight = 1200

      if (aspectRatio > 1) {
        targetHeight = targetWidth / aspectRatio
      } else {
        targetWidth = targetHeight * aspectRatio
      }

      canvas.width = targetWidth
      canvas.height = targetHeight
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight)

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to compress image'))
          }
        },
        'image/jpeg',
        0.8
      )
    }

    img.onerror = () => reject(new Error('Failed to load image'))

    if (file instanceof File) {
      img.src = URL.createObjectURL(file)
    } else {
      img.src = URL.createObjectURL(file)
    }
  })
}

export function createObjectURL(blob: Blob): string {
  return URL.createObjectURL(blob)
}

export function revokeObjectURL(url: string): void {
  URL.revokeObjectURL(url)
}