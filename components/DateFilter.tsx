'use client'

import { Calendar } from 'lucide-react'

interface DateFilterProps {
  onFilterChange: (startDate: string, endDate: string) => void
}

export default function DateFilter({ onFilterChange }: DateFilterProps) {
  const handleQuickFilter = (months: number) => {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months)
    
    onFilterChange(
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    )
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Calendar className="w-4 h-4 text-gray-400" />
      <button
        onClick={() => handleQuickFilter(0)}
        className="px-3 py-1.5 text-sm bg-dark-card hover:bg-primary hover:text-dark-bg rounded-lg transition-all"
      >
        Este Mês
      </button>
      <button
        onClick={() => handleQuickFilter(1)}
        className="px-3 py-1.5 text-sm bg-dark-card hover:bg-primary hover:text-dark-bg rounded-lg transition-all"
      >
        Últimos 30 dias
      </button>
      <button
        onClick={() => handleQuickFilter(3)}
        className="px-3 py-1.5 text-sm bg-dark-card hover:bg-primary hover:text-dark-bg rounded-lg transition-all"
      >
        Últimos 3 meses
      </button>
      <button
        onClick={() => handleQuickFilter(12)}
        className="px-3 py-1.5 text-sm bg-dark-card hover:bg-primary hover:text-dark-bg rounded-lg transition-all"
      >
        Último Ano
      </button>
    </div>
  )
}
