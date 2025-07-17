import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  hoverable?: boolean
}

export default function Card({
  children,
  className = '',
  onClick,
  hoverable = false
}: CardProps) {
  const baseClasses = 'card'
  const hoverClasses = hoverable ? 'cursor-pointer hover:shadow-xl transition-shadow' : ''
  const clickableClasses = onClick ? 'cursor-pointer' : ''
  
  return (
    <div
      className={`${baseClasses} ${hoverClasses} ${clickableClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}