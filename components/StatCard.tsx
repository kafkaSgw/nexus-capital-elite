import { LucideIcon } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: number
  icon: LucideIcon
  trend?: number
  color?: string
  delay?: number
}

export default function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend,
  color = 'from-primary to-accent-purple',
  delay = 0
}: StatCardProps) {
  return (
    <div 
      className="card-premium hover-lift p-6 animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-gray-400 mb-1">{title}</p>
          <h3 className="text-3xl font-bold number-font text-white">
            {formatCurrency(value)}
          </h3>
        </div>
        <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center shadow-glow`}>
          <Icon className="w-6 h-6 text-dark-bg" strokeWidth={2.5} />
        </div>
      </div>
      
      {trend !== undefined && (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-dark-border">
          <div className={`text-sm font-medium ${trend >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(2)}%
          </div>
          <span className="text-xs text-gray-500">vs. mês anterior</span>
        </div>
      )}
    </div>
  )
}
