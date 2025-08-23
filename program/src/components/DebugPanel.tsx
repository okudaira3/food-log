import { useState } from 'react'
import { InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface DebugInfo {
  [key: string]: any
}

interface DebugPanelProps {
  info: DebugInfo
  title?: string
}

export default function DebugPanel({ info, title = "デバッグ情報" }: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false)

  const formatValue = (value: any): string => {
    if (typeof value === 'boolean') {
      return value ? '✅ true' : '❌ false'
    }
    if (typeof value === 'string') {
      return `"${value}"`
    }
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value, null, 2)
    }
    return String(value)
  }

  return (
    <>
      {/* デバッグボタン */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-40 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700"
      >
        <InformationCircleIcon className="h-6 w-6" />
      </button>

      {/* デバッグパネル */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
            {/* ヘッダー */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-medium">{title}</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* 内容 */}
            <div className="overflow-y-auto p-4 space-y-3">
              {Object.entries(info).map(([key, value]) => (
                <div key={key} className="border-l-2 border-gray-200 pl-3">
                  <div className="text-sm font-medium text-gray-700 mb-1">
                    {key}
                  </div>
                  <div className="text-sm text-gray-900 font-mono whitespace-pre-wrap break-all">
                    {formatValue(value)}
                  </div>
                </div>
              ))}
            </div>

            {/* フッター */}
            <div className="p-4 border-t bg-gray-50">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}