'use client'

import { useEffect, useState } from 'react'
import { PieChart, BarChart3, TrendingUp, Calendar, Building2 } from 'lucide-react'
import { getTransactions, getAssets, getCompanies, Company } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import CategoryBreakdown from '@/components/CategoryBreakdown'
import ExportReport from '@/components/ExportReport'
import MonthlyBudget from '@/components/MonthlyBudget'
import RecurringTransactions from '@/components/RecurringTransactions'
import FinancialGoals from '@/components/FinancialGoals'
import dynamic from 'next/dynamic'

// Lazy loaded components para performance
const ScenarioAnalysis = dynamic(() => import('@/components/ScenarioAnalysis'), { ssr: false, loading: () => <div className="h-[400px] w-full bg-dark-card/50 rounded-xl animate-pulse" /> })
const SankeyDiagram = dynamic(() => import('@/components/SankeyDiagram'), { ssr: false, loading: () => <div className="h-[500px] w-full bg-dark-card/50 rounded-xl animate-pulse" /> })
const WhatIfSimulator = dynamic(() => import('@/components/WhatIfSimulator'), { ssr: false, loading: () => <div className="h-[400px] w-full bg-dark-card/50 rounded-xl animate-pulse" /> })
const TimeToGoalCalculator = dynamic(() => import('@/components/TimeToGoalCalculator'), { ssr: false, loading: () => <div className="h-[400px] w-full bg-dark-card/50 rounded-xl animate-pulse" /> })

export default function AnalisesPage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [assets, setAssets] = useState<any[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedCompany, setSelectedCompany] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [transactionsData, assetsData, companiesData] = await Promise.all([
        getTransactions(),
        getAssets(),
        getCompanies()
      ])
      setTransactions(transactionsData)
      setAssets(assetsData)
      setCompanies(companiesData || [])
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filtrar transações por empresa
  const filteredTransactions = selectedCompany
    ? transactions.filter(t => t.company_id === selectedCompany || t.category === companies.find(c => c.id === selectedCompany)?.name)
    : transactions

  const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = Math.abs(filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0))
  const totalInvestments = assets.reduce((sum, a) => sum + (a.quantidade * a.preco_atual), 0)
  const totalWealth = (totalIncome - totalExpense) + totalInvestments

  // Análise por mês
  const getMonthlyData = () => {
    const monthlyData: any = {}

    filteredTransactions.forEach(t => {
      const date = new Date(t.created_at)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expense: 0 }
      }

      if (t.type === 'income') {
        monthlyData[monthKey].income += t.amount
      } else {
        monthlyData[monthKey].expense += Math.abs(t.amount)
      }
    })

    return Object.entries(monthlyData)
      .map(([month, data]: [string, any]) => ({
        month,
        income: data.income,
        expense: data.expense,
        balance: data.income - data.expense
      }))
      .sort((a, b) => b.month.localeCompare(a.month))
      .slice(0, 6)
      .reverse()
  }

  const monthlyData = getMonthlyData()

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card-premium h-96 loading-shimmer" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8 animate-fade-in">
        <h1 className="text-2xl sm:text-4xl font-bold gradient-text font-mono mb-1 sm:mb-2">
          Análises Financeiras
        </h1>
        <p className="text-gray-400 text-sm">
          Entenda de onde vem e para onde vai seu dinheiro
        </p>
        {companies.length > 0 && (
          <div className="mt-4 flex items-center gap-3">
            <Building2 className="w-4 h-4 text-gray-400" />
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="input-premium text-sm py-2 px-3 min-w-[200px]"
            >
              <option value="">Todas as empresas</option>
              {companies.map(company => (
                <option key={company.id} value={company.id}>{company.name}</option>
              ))}
            </select>
            {selectedCompany && (
              <button
                onClick={() => setSelectedCompany('')}
                className="text-xs text-primary hover:text-primary/80 transition-colors"
              >
                Limpar filtro
              </button>
            )}
          </div>
        )}
      </div>

      {/* Sankey Diagram (Fluxo Financeiro) */}
      <div className="mb-8">
        <SankeyDiagram transactions={filteredTransactions} />
      </div>

      {/* Breakdown por Categoria */}
      <div className="mb-8">
        <CategoryBreakdown transactions={filteredTransactions} />
      </div>

      {/* Análise Mensal */}
      <div className="card-premium animate-slide-up" style={{ animationDelay: '200ms' }}>
        <div className="p-6 border-b border-dark-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent-purple rounded-xl flex items-center justify-center shadow-glow">
              <Calendar className="w-5 h-5 text-dark-bg" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Evolução Mensal</h3>
              <p className="text-sm text-gray-400">Últimos 6 meses</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {monthlyData.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Sem dados suficientes para análise mensal</p>
          ) : (
            <div className="space-y-6">
              {monthlyData.map((data, index) => {
                const maxValue = Math.max(...monthlyData.map(d => Math.max(d.income, d.expense)))
                const incomeWidth = (data.income / maxValue) * 100
                const expenseWidth = (data.expense / maxValue) * 100

                return (
                  <div key={data.month} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-300">
                        {new Date(data.month + '-01').toLocaleDateString('pt-BR', {
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                      <span className={`text-sm font-bold number-font ${data.balance >= 0 ? 'text-accent-green' : 'text-accent-red'
                        }`}>
                        {data.balance >= 0 ? '+' : ''}{formatCurrency(data.balance)}
                      </span>
                    </div>

                    {/* Receitas */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Receitas</span>
                        <span className="text-accent-green font-medium number-font">
                          {formatCurrency(data.income)}
                        </span>
                      </div>
                      <div className="h-2 bg-dark-card rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent-green rounded-full transition-all duration-1000"
                          style={{
                            width: `${incomeWidth}%`,
                            boxShadow: '0 0 10px rgba(0, 255, 148, 0.4)'
                          }}
                        />
                      </div>
                    </div>

                    {/* Despesas */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Despesas</span>
                        <span className="text-accent-red font-medium number-font">
                          {formatCurrency(data.expense)}
                        </span>
                      </div>
                      <div className="h-2 bg-dark-card rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent-red rounded-full transition-all duration-1000"
                          style={{
                            width: `${expenseWidth}%`,
                            boxShadow: '0 0 10px rgba(255, 71, 87, 0.4)'
                          }}
                        />
                      </div>
                    </div>

                    {index < monthlyData.length - 1 && (
                      <div className="border-b border-dark-border mt-4" />
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Exportar Relatórios */}
      <div className="mb-8">
        <ExportReport
          transactions={transactions}
          assets={assets}
          totalWealth={totalWealth}
          totalIncome={totalIncome}
          totalExpense={totalExpense}
        />
      </div>

      {/* Top Receitas e Despesas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Maiores Receitas */}
        <div className="card-premium animate-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="p-6 border-b border-dark-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent-green/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-accent-green" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Top 5 Receitas</h3>
                <p className="text-sm text-gray-400">Maiores entradas</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-3">
            {transactions
              .filter(t => t.type === 'income')
              .sort((a, b) => b.amount - a.amount)
              .slice(0, 5)
              .map((t, index) => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-dark-hover transition-colors">
                  <div className="flex-1">
                    <p className="font-medium text-white text-sm">{t.description}</p>
                    <p className="text-xs text-gray-500">{t.category}</p>
                  </div>
                  <span className="text-accent-green font-bold number-font">
                    {formatCurrency(t.amount)}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Maiores Despesas */}
        <div className="card-premium animate-slide-up" style={{ animationDelay: '400ms' }}>
          <div className="p-6 border-b border-dark-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent-red/20 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-accent-red" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Top 5 Despesas</h3>
                <p className="text-sm text-gray-400">Maiores gastos</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-3">
            {transactions
              .filter(t => t.type === 'expense')
              .sort((a, b) => a.amount - b.amount)
              .slice(0, 5)
              .map((t, index) => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-dark-hover transition-colors">
                  <div className="flex-1">
                    <p className="font-medium text-white text-sm">{t.description}</p>
                    <p className="text-xs text-gray-500">{t.category}</p>
                  </div>
                  <span className="text-accent-red font-bold number-font">
                    {formatCurrency(Math.abs(t.amount))}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Análise de Cenários */}
      <div className="mt-8">
        <ScenarioAnalysis />
      </div>

      {/* Simulador "E se..." + Calculadora "Quanto Tempo" */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <WhatIfSimulator />
        <TimeToGoalCalculator />
      </div>

      {/* Orçamento, Metas e Recorrentes */}
      <div id="orcamento" className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8 scroll-mt-24">
        <MonthlyBudget />
        <RecurringTransactions />
      </div>

      <div id="metas" className="mt-8 scroll-mt-24">
        <FinancialGoals />
      </div>
    </div>
  )
}
