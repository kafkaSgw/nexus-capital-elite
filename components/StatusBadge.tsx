import { TrendingUp, TrendingDown, AlertTriangle, Star } from 'lucide-react'

interface StatusBadgeProps {
  type: 'profit' | 'attention' | 'loss' | 'top-performer'
  margin?: number
  className?: string
}

export default function StatusBadge({ type, margin, className = '' }: StatusBadgeProps) {
  const badges = {
    'profit': {
      icon: TrendingUp,
      text: 'Lucrativa',
      bg: 'bg-accent-green/10',
      border: 'border-accent-green/20',
      textColor: 'text-accent-green',
      iconColor: 'text-accent-green',
    },
    'attention': {
      icon: AlertTriangle,
      text: 'Atenção',
      bg: 'bg-accent-orange/10',
      border: 'border-accent-orange/20',
      textColor: 'text-accent-orange',
      iconColor: 'text-accent-orange',
    },
    'loss': {
      icon: TrendingDown,
      text: 'Prejuízo',
      bg: 'bg-accent-red/10',
      border: 'border-accent-red/20',
      textColor: 'text-accent-red',
      iconColor: 'text-accent-red',
    },
    'top-performer': {
      icon: Star,
      text: 'Top Performer',
      bg: 'bg-accent-purple/10',
      border: 'border-accent-purple/20',
      textColor: 'text-accent-purple',
      iconColor: 'text-accent-purple',
    },
  }

  const badge = badges[type]
  const Icon = badge.icon

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${badge.bg} ${badge.border} ${className}`}>
      <Icon className={`w-3.5 h-3.5 ${badge.iconColor}`} />
      <span className={`text-xs font-semibold ${badge.textColor}`}>
        {badge.text}
      </span>
      {margin !== undefined && (
        <span className={`text-xs font-bold ${badge.textColor}`}>
          {margin.toFixed(1)}%
        </span>
      )}
    </div>
  )
}
