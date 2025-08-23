import { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error = false, ...props }, ref) => {
    const baseClasses = 'px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
    const errorClasses = error ? 'border-red-500' : 'border-gray-300'
    const finalClasses = `${baseClasses} ${errorClasses} ${className}`

    return (
      <input
        ref={ref}
        className={finalClasses}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'

export default Input