'use client'

import { TrendingUp, TrendingDown } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface CategoryStats {
  category: string
  total: number
  count: number
  percentage: number
  color: string
}

interface CategoryBreakdownProps {
  transactions: any[]
}

export default function CategoryBreakdown({ transactions }: CategoryBreakdownProps) {
  // Filtrar apenas receitas
  const incomes = transactions.filter(t => t.type === 'income')
  const expenses = transactions.filter(t => t.type === 'expense')

  const totalIncome = incomes.reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = Math.abs(expenses.reduce((sum, t) => sum + t.amount, 0))

  // Agrupar receitas por categoria
  const incomeByCategory = incomes.reduce((acc: any, transaction) => {
    const cat = transaction.category
    if (!acc[cat]) {
      acc[cat] = { total: 0, count: 0 }
    }
    acc[cat].total += transaction.amount
    acc[cat].count += 1
    return acc
  }, {})

  // Agrupar despesas por categoria
  const expenseByCategory = expenses.reduce((acc: any, transaction) => {
    const cat = transaction.category
    if (!acc[cat]) {
      acc[cat] = { total: 0, count: 0 }
    }
    acc[cat].total += Math.abs(transaction.amount)
    acc[cat].count += 1
    return acc
  }, {})

  // Converter para array e calcular percentuais
  const incomeStats: CategoryStats[] = Object.entries(incomeByCategory)
    .map(([category, data]: [string, any]) => ({
      category,
      total: data.total,
      count: data.count,
      percentage: (data.total / totalIncome) * 100,
      color: getCategoryColor(category)
    }))
    .sort((a, b) => b.total - a.total)

  const expenseStats: CategoryStats[] = Object.entries(expenseByCategory)
    .map(([category, data]: [string, any]) => ({
      category,
      total: data.total,
      count: data.count,
      percentage: (data.total / totalExpense) * 100,
      color: getCategoryColor(category)
    }))
    .sort((a, b) => b.total - a.total)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Receitas por Categoria */}
      <div className="card-premium">
        <div className="p-6 border-b border-dark-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent-green/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-accent-green" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Receitas por Fonte</h3>
              <p className="text-sm text-gray-400">Distribuição de entradas</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {incomeStats.length === 0 ? (
            <p className="text-center text-gray-500 py-4">Nenhuma receita registrada</p>
          ) : (
            incomeStats.map((stat, index) => (
              <div key={stat.category} className="space-y-2" style={{ animationDelay: `${index * 50}ms` }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: stat.color }}
                    />
                    <span className="font-medium text-white">{stat.category}</span>
                    <span className="text-xs text-gray-500">({stat.count}x)</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-accent-green number-font">
                      {formatCurrency(stat.total)}
                    </p>
                    <p className="text-xs text-gray-500">{stat.percentage.toFixed(1)}%</p>
                  </div>
                </div>

                {/* Barra de progresso */}
                <div className="h-2 bg-dark-card rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${stat.percentage}%`,
                      backgroundColor: stat.color,
                      boxShadow: `0 0 10px ${stat.color}40`
                    }}
                  />
                </div>
              </div>
            ))
          )}

          {/* Total */}
          {incomeStats.length > 0 && (
            <div className="pt-4 mt-4 border-t border-dark-border">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-300">Total de Receitas</span>
                <span className="text-xl font-bold text-accent-green number-font">
                  {formatCurrency(totalIncome)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Despesas por Categoria */}
      <div className="card-premium">
        <div className="p-6 border-b border-dark-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent-red/20 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-accent-red" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Despesas por Categoria</h3>
              <p className="text-sm text-gray-400">Distribuição de gastos</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {expenseStats.length === 0 ? (
            <p className="text-center text-gray-500 py-4">Nenhuma despesa registrada</p>
          ) : (
            expenseStats.map((stat, index) => (
              <div key={stat.category} className="space-y-2" style={{ animationDelay: `${index * 50}ms` }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: stat.color }}
                    />
                    <span className="font-medium text-white">{stat.category}</span>
                    <span className="text-xs text-gray-500">({stat.count}x)</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-accent-red number-font">
                      {formatCurrency(stat.total)}
                    </p>
                    <p className="text-xs text-gray-500">{stat.percentage.toFixed(1)}%</p>
                  </div>
                </div>

                {/* Barra de progresso */}
                <div className="h-2 bg-dark-card rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${stat.percentage}%`,
                      backgroundColor: stat.color,
                      boxShadow: `0 0 10px ${stat.color}40`
                    }}
                  />
                </div>
              </div>
            ))
          )}

          {/* Total */}
          {expenseStats.length > 0 && (
            <div className="pt-4 mt-4 border-t border-dark-border">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-300">Total de Despesas</span>
                <span className="text-xl font-bold text-accent-red number-font">
                  {formatCurrency(totalExpense)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Função para atribuir cores diferentes para cada categoria
function getCategoryColor(category: string): string {
  const colors: { [key: string]: string } = {
    'Interpira': '#2563EB',
    'TikTok': '#EF4444',
    'Afiliados': '#10B981',
    'Salário': '#A855F7',
    'Freelance': '#FFD93D',
    'Alimentação': '#FF6B6B',
    'Transporte': '#4ECDC4',
    'Moradia': '#95E1D3',
    'Lazer': '#F38181',
    'Saúde': '#AA96DA',
    'Educação': '#FCBAD3',
    'Outros': '#6C757D'
  }

  return colors[category] || '#6C757D'
}
