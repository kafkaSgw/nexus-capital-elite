'use client'

import { useState, useEffect } from 'react'
import { Building2, TrendingUp, TrendingDown } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { supabase, Company } from '@/lib/supabase'

interface CompanyStats {
  company: Company
  income: number
  expense: number
  balance: number
  transactionCount: number
}

// Default colors for companies without avatar_color
const DEFAULT_COLORS = ['#2563EB', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#6366F1', '#14B8A6']

export default function CompaniesDashboard() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [stats, setStats] = useState<CompanyStats[]>([])
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // Buscar empresas
      const { data: companiesData } = await supabase
        .from('companies')
        .select('*')
        .order('name')

      if (companiesData) {
        setCompanies(companiesData)

        // Buscar transações (sem join para evitar erro de FK)
        const { data: transactions } = await supabase
          .from('transactions')
          .select('*')

        if (transactions) {
          // Calcular estatísticas por empresa
          const companyStats = companiesData.map(company => {
            const companyTransactions = transactions.filter(
              (t: any) => t.company_id === company.id
            )

            const income = companyTransactions
              .filter((t: any) => t.type === 'income')
              .reduce((sum: number, t: any) => sum + t.amount, 0)

            const expense = Math.abs(
              companyTransactions
                .filter((t: any) => t.type === 'expense')
                .reduce((sum: number, t: any) => sum + t.amount, 0)
            )

            return {
              company,
              income,
              expense,
              balance: income - expense,
              transactionCount: companyTransactions.length
            }
          })

          setStats(companyStats.sort((a: CompanyStats, b: CompanyStats) => b.income - a.income))
        }
      }
    } catch (error) {
      console.error('Erro ao carregar empresas:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCompanyColor = (company: Company, index: number): string => {
    return company.avatar_color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]
  }

  const totalIncome = stats.reduce((sum, s) => sum + s.income, 0)
  const totalExpense = stats.reduce((sum, s) => sum + s.expense, 0)
  const totalBalance = totalIncome - totalExpense

  if (loading) {
    return <div className="card-premium h-64 loading-shimmer" />
  }

  return (
    <div className="space-y-6">
      {/* Resumo Geral */}
      <div className="card-premium">
        <div className="p-6 border-b border-dark-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent-purple rounded-xl flex items-center justify-center shadow-glow">
              <Building2 className="w-5 h-5 text-dark-bg" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Visão por Empresa</h3>
              <p className="text-sm text-gray-400">Performance consolidada</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-dark-card rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Total Receitas</p>
              <p className="text-2xl font-bold text-accent-green number-font">
                {formatCurrency(totalIncome)}
              </p>
            </div>
            <div className="bg-dark-card rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Total Despesas</p>
              <p className="text-2xl font-bold text-accent-red number-font">
                {formatCurrency(totalExpense)}
              </p>
            </div>
            <div className="bg-dark-card rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Saldo Consolidado</p>
              <p className={`text-2xl font-bold number-font ${totalBalance >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                {formatCurrency(totalBalance)}
              </p>
            </div>
          </div>

          {/* Grid de Empresas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => {
              const percentage = totalIncome > 0 ? (stat.income / totalIncome) * 100 : 0
              const companyColor = getCompanyColor(stat.company, index)

              return (
                <div
                  key={stat.company.id}
                  className="bg-dark-card rounded-xl p-5 hover:bg-dark-hover transition-all cursor-pointer group border-2 border-transparent hover:border-primary/30"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => setSelectedCompany(
                    selectedCompany === stat.company.id ? null : stat.company.id
                  )}
                >
                  {/* Header da Empresa */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: companyColor,
                          boxShadow: `0 0 10px ${companyColor}60`
                        }}
                      />
                      <h4 className="font-bold text-white">{stat.company.name}</h4>
                    </div>
                    <span className="text-xs text-gray-500">
                      {stat.transactionCount} mov.
                    </span>
                  </div>

                  {/* Receitas */}
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Receitas</span>
                      <span className="text-sm font-bold text-accent-green number-font">
                        {formatCurrency(stat.income)}
                      </span>
                    </div>
                    <div className="h-1.5 bg-dark-bg rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent-green rounded-full transition-all duration-1000"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Despesas */}
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Despesas</span>
                      <span className="text-sm font-bold text-accent-red number-font">
                        {formatCurrency(stat.expense)}
                      </span>
                    </div>
                  </div>

                  {/* Saldo */}
                  <div className="pt-3 border-t border-dark-border">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Saldo</span>
                      <div className="flex items-center gap-1">
                        {stat.balance >= 0 ? (
                          <TrendingUp className="w-3 h-3 text-accent-green" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-accent-red" />
                        )}
                        <span className={`font-bold number-font text-sm ${stat.balance >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                          {formatCurrency(stat.balance)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-1 text-xs text-gray-500 text-center">
                      {percentage.toFixed(1)}% do total
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Gráfico de Comparação */}
      <div className="card-premium">
        <div className="p-6 border-b border-dark-border">
          <h3 className="font-bold text-white">Comparação de Performance</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {stats.map((stat, index) => {
              const maxValue = Math.max(...stats.map(s => Math.max(s.income, s.expense)), 1)
              const incomeWidth = (stat.income / maxValue) * 100
              const expenseWidth = (stat.expense / maxValue) * 100
              const companyColor = getCompanyColor(stat.company, index)

              return (
                <div key={stat.company.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: companyColor }}
                      />
                      <span className="font-medium text-white">{stat.company.name}</span>
                    </div>
                    <span className="text-sm text-gray-400">
                      {formatCurrency(stat.income)}
                    </span>
                  </div>
                  <div className="relative h-8 bg-dark-bg rounded-lg overflow-hidden">
                    {/* Receitas */}
                    <div
                      className="absolute top-0 left-0 h-1/2 bg-accent-green/80 transition-all duration-1000"
                      style={{ width: `${incomeWidth}%` }}
                    />
                    {/* Despesas */}
                    <div
                      className="absolute bottom-0 left-0 h-1/2 bg-accent-red/80 transition-all duration-1000"
                      style={{ width: `${expenseWidth}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
