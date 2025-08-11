import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface ErrorMessageProps {
  message: string
  className?: string
}

export default function ErrorMessage({ message, className = "" }: ErrorMessageProps) {
  return (
    <div className={`flex items-center p-4 text-red-700 bg-red-100 border border-red-300 rounded-md ${className}`}>
      <ExclamationTriangleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
      <span className="text-sm">{message}</span>
    </div>
  )
}