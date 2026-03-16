import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface MonthComparisonProps {
  current: number
  previous: number
  showValue?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function MonthComparison({ 
  current, 
  previous, 
  showValue = true,
  size = 'md' 
}: MonthComparisonProps) {
  const difference = current - previous
  const percentChange = previous !== 0 ? ((difference / previous) * 100) : 0
  const isPositive = difference > 0
  const isNeutral = difference === 0

  const sizes = {
    sm: { icon: 'w-3 h-3', text: 'text-xs' },
    md: { icon: 'w-4 h-4', text: 'text-sm' },
    lg: { icon: 'w-5 h-5', text: 'text-base' },
  }

  const sizeClasses = sizes[size]

  if (isNeutral) {
    return (
      <div className="inline-flex items-center gap-1 text-gray-400">
        <Minus className={sizeClasses.icon} />
        <span className={`${sizeClasses.text} font-medium`}>
          0% vs mês anterior
        </span>
      </div>
    )
  }

  return (
    <div className={`inline-flex items-center gap-1 ${isPositive ? 'text-accent-green' : 'text-accent-red'}`}>
      {isPositive ? (
        <TrendingUp className={sizeClasses.icon} />
      ) : (
        <TrendingDown className={sizeClasses.icon} />
      )}
      <span className={`${sizeClasses.text} font-bold`}>
        {isPositive ? '+' : ''}{percentChange.toFixed(1)}%
      </span>
      {showValue && (
        <span className={`${sizeClasses.text} font-medium text-gray-400`}>
          vs mês anterior
        </span>
      )}
    </div>
  )
}
