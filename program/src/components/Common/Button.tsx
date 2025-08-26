import { ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
  onClick?: (e?: any) => void
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  className?: string
  'aria-label'?: string
}

export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  'aria-label': ariaLabel
}: ButtonProps) {
  const baseClasses = 'font-bold rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variantClasses = {
    primary: 'btn-primary focus:ring-primary',
    secondary: 'btn-secondary focus:ring-accent',
    outline: 'border-2 border-accent text-accent hover:bg-accent hover:text-white focus:ring-accent',
    ghost: 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:ring-gray-500'
  }
  
  const sizeClasses = {
    sm: 'py-1 px-2 text-sm',
    md: 'py-2 px-4 text-base',
    lg: 'py-3 px-6 text-lg'
  }
  
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : ''
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  )
}