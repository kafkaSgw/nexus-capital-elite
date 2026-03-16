'use client'

import { TrendingUp, TrendingDown, DollarSign, Target, Zap, Award } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface KPIProps {
  transactions: any[]
  assets: any[]
  currentMonth: number
  previousMonth: number
}

export default function KPIDashboard({ transactions, assets, currentMonth, previousMonth }: KPIProps) {
  // Cálculos do mês atual
  const currentMonthTransactions = transactions.filter(t => {
    const transactionMonth = new Date(t.created_at).getMonth()
    return transactionMonth === currentMonth
  })

  const currentIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const currentExpense = Math.abs(
    currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
  )

  // Cálculos do mês anterior
  const previousMonthTransactions = transactions.filter(t => {
    const transactionMonth = new Date(t.created_at).getMonth()
    return transactionMonth === previousMonth
  })

  const previousIncome = previousMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const previousExpense = Math.abs(
    previousMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
  )

  // KPIs calculados
  const incomeGrowth = previousIncome > 0 
    ? ((currentIncome - previousIncome) / previousIncome) * 100 
    : 0

  const expenseGrowth = previousExpense > 0 
    ? ((currentExpense - previousExpense) / previousExpense) * 100 
    : 0

  const savingsRate = currentIncome > 0 
    ? ((currentIncome - currentExpense) / currentIncome) * 100 
    : 0

  const burnRate = currentExpense / 30 // Gasto médio por dia

  const totalAssetValue = assets.reduce(
    (sum, a) => sum + (a.quantidade * a.preco_atual),
    0
  )

  const totalInvested = assets.reduce(
    (sum, a) => sum + (a.quantidade * a.preco_medio),
    0
  )

  const portfolioReturn = totalInvested > 0
    ? ((totalAssetValue - totalInvested) / totalInvested) * 100
    : 0

  const kpis = [
    {
      label: 'Crescimento de Receita',
      value: `${incomeGrowth >= 0 ? '+' : ''}${incomeGrowth.toFixed(1)}%`,
      subvalue: formatCurrency(currentIncome),
      icon: TrendingUp,
      color: incomeGrowth >= 0 ? 'text-accent-green' : 'text-accent-red',
      bgColor: incomeGrowth >= 0 ? 'from-accent-green/20' : 'from-accent-red/20',
      borderColor: incomeGrowth >= 0 ? 'border-accent-green/30' : 'border-accent-red/30',
      status: incomeGrowth >= 0 ? 'positive' : 'negative'
    },
    {
      label: 'Taxa de Poupança',
      value: `${savingsRate.toFixed(1)}%`,
      subvalue: `Guardando ${formatCurrency(currentIncome - currentExpense)}`,
      icon: Target,
      color: savingsRate >= 20 ? 'text-accent-green' : savingsRate >= 10 ? 'text-accent-yellow' : 'text-accent-red',
      bgColor: savingsRate >= 20 ? 'from-accent-green/20' : savingsRate >= 10 ? 'from-accent-yellow/20' : 'from-accent-red/20',
      borderColor: savingsRate >= 20 ? 'border-accent-green/30' : savingsRate >= 10 ? 'border-accent-yellow/30' : 'border-accent-red/30',
      status: savingsRate >= 20 ? 'excellent' : savingsRate >= 10 ? 'good' : 'warning'
    },
    {
      label: 'Burn Rate',
      value: `${formatCurrency(burnRate)}/dia`,
      subvalue: `${formatCurrency(currentExpense)} no mês`,
      icon: Zap,
      color: expenseGrowth <= 0 ? 'text-accent-green' : 'text-accent-yellow',
      bgColor: expenseGrowth <= 0 ? 'from-accent-green/20' : 'from-accent-yellow/20',
      borderColor: expenseGrowth <= 0 ? 'border-accent-green/30' : 'border-accent-yellow/30',
      status: expenseGrowth <= 0 ? 'positive' : 'warning'
    },
    {
      label: 'Retorno da Carteira',
      value: `${portfolioReturn >= 0 ? '+' : ''}${portfolioReturn.toFixed(2)}%`,
      subvalue: formatCurrency(totalAssetValue - totalInvested),
      icon: Award,
      color: portfolioReturn >= 0 ? 'text-accent-green' : 'text-accent-red',
      bgColor: portfolioReturn >= 0 ? 'from-accent-green/20' : 'from-accent-red/20',
      borderColor: portfolioReturn >= 0 ? 'border-accent-green/30' : 'border-accent-red/30',
      status: portfolioReturn >= 0 ? 'positive' : 'negative'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">KPIs Principais</h2>
          <p className="text-sm text-gray-400">Indicadores chave de performance</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Período</p>
          <p className="text-sm font-medium text-white">
            {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Grid de KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <div
            key={index}
            className={`card-premium hover-lift border-2 ${kpi.borderColor}`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${kpi.bgColor} to-transparent opacity-50 rounded-[20px]`} />
            
            <div className="relative p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${kpi.bgColor} to-transparent rounded-xl flex items-center justify-center border ${kpi.borderColor}`}>
                  <kpi.icon className={`w-6 h-6 ${kpi.color}`} strokeWidth={2.5} />
                </div>
                
                {kpi.status === 'positive' && (
                  <TrendingUp className="w-5 h-5 text-accent-green" />
                )}
                {kpi.status === 'negative' && (
                  <TrendingDown className="w-5 h-5 text-accent-red" />
                )}
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-400 font-medium">{kpi.label}</p>
                <p className={`text-3xl font-bold number-font ${kpi.color}`}>
                  {kpi.value}
                </p>
                <p className="text-xs text-gray-500">{kpi.subvalue}</p>
              </div>

              {/* Barra de progresso para Taxa de Poupança */}
              {kpi.label === 'Taxa de Poupança' && (
                <div className="mt-4">
                  <div className="h-2 bg-dark-bg rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        savingsRate >= 20 ? 'bg-accent-green' :
                        savingsRate >= 10 ? 'bg-accent-yellow' :
                        'bg-accent-red'
                      }`}
                      style={{ width: `${Math.min(savingsRate, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-gray-500">
                    <span>0%</span>
                    <span className="text-accent-green">Meta: 20%</span>
                    <span>100%</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Análise Rápida */}
      <div className="card-premium p-6">
        <h3 className="font-bold text-white mb-4">📊 Análise Rápida</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-dark-card rounded-lg">
              <span className="text-sm text-gray-400">Receita vs Mês Anterior</span>
              <span className={`text-sm font-bold ${incomeGrowth >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                {incomeGrowth >= 0 ? '+' : ''}{incomeGrowth.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-dark-card rounded-lg">
              <span className="text-sm text-gray-400">Despesa vs Mês Anterior</span>
              <span className={`text-sm font-bold ${expenseGrowth <= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                {expenseGrowth >= 0 ? '+' : ''}{expenseGrowth.toFixed(1)}%
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-dark-card rounded-lg">
              <span className="text-sm text-gray-400">Patrimônio Total</span>
              <span className="text-sm font-bold text-primary">
                {formatCurrency(totalAssetValue + (currentIncome - currentExpense))}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-dark-card rounded-lg">
              <span className="text-sm text-gray-400">ROI Investimentos</span>
              <span className={`text-sm font-bold ${portfolioReturn >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                {portfolioReturn >= 0 ? '+' : ''}{portfolioReturn.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
