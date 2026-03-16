'use client'

import { useState, useEffect } from 'react'
import {
  Building2, TrendingUp, TrendingDown, Plus, Briefcase,
  DollarSign, PieChart, Target, ArrowUpRight, ArrowDownRight,
  BarChart3, Award, ChevronRight, Users
} from 'lucide-react'
import { getTransactions, getAssets, getCompanies, Transaction, Asset, Company } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import CompanyModal from '@/components/CompanyModal'
import CompaniesDashboard from '@/components/CompaniesDashboard'
import CashFlowProjection from '@/components/CashFlowProjection'
import TaxCalculator from '@/components/TaxCalculator'

export default function HoldingPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [showCompanyModal, setShowCompanyModal] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [txs, ast, comps] = await Promise.all([
        getTransactions(),
        getAssets(),
        getCompanies()
      ])
      setTransactions(txs)
      setAssets(ast)
      setCompanies(comps)
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
    } finally {
      setLoading(false)
    }
  }

  // Cálculos
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  const operationalProfit = totalIncome - totalExpense
  const profitMargin = totalIncome > 0 ? (operationalProfit / totalIncome) * 100 : 0

  const totalInvested = assets.reduce((sum, a) => sum + a.preco_medio * a.quantidade, 0)
  const totalCurrentValue = assets.reduce((sum, a) => sum + a.preco_atual * a.quantidade, 0)

  const totalWealth = operationalProfit + totalCurrentValue

  // Categorias de ativos
  const assetsByClass = assets.reduce((acc: Record<string, { count: number; value: number }>, asset) => {
    const cls = asset.classe || 'Outros'
    if (!acc[cls]) acc[cls] = { count: 0, value: 0 }
    acc[cls].count++
    acc[cls].value += asset.preco_atual * asset.quantidade
    return acc
  }, {})

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="loading-shimmer h-[140px]" />
          ))}
        </div>
        <div className="loading-shimmer h-[400px]" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-accent-purple/20 flex items-center justify-center border border-primary/10 shrink-0">
            <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary-lighter" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Nexus Capital Holding
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
              Visão consolidada do grupo • {companies.length} empresa{companies.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setEditingCompany(null)
            setShowCompanyModal(true)
          }}
          className="btn-primary flex items-center gap-2 text-sm whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Nova Empresa
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 stagger-children">
        {/* Patrimônio Total */}
        <div className="card-premium p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent-indigo/20 flex items-center justify-center border border-primary/10">
              <DollarSign className="w-5 h-5 text-primary-lighter" />
            </div>
            <span className="badge-premium text-[11px]">
              <Briefcase className="w-3 h-3" /> Holding
            </span>
          </div>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Patrimônio Total</p>
          <p className="text-2xl font-bold text-white number-font tracking-tight">
            {formatCurrency(totalWealth)}
          </p>
        </div>

        {/* Lucro Operacional */}
        <div className="card-premium p-5">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${operationalProfit >= 0
              ? 'bg-gradient-to-br from-accent-green/20 to-accent-cyan/20 border-accent-green/10'
              : 'bg-gradient-to-br from-accent-red/20 to-accent-orange/20 border-accent-red/10'
              }`}>
              {operationalProfit >= 0
                ? <TrendingUp className="w-5 h-5 text-accent-green" />
                : <TrendingDown className="w-5 h-5 text-accent-red" />
              }
            </div>
            <span className={`badge-premium text-[11px] ${operationalProfit >= 0 ? 'badge-success' : 'badge-danger'}`}>
              {operationalProfit >= 0 ? '+' : ''}{profitMargin.toFixed(1)}%
            </span>
          </div>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Lucro Operacional</p>
          <p className={`text-2xl font-bold number-font tracking-tight ${operationalProfit >= 0 ? 'text-accent-green' : 'text-accent-red'
            }`}>
            {formatCurrency(operationalProfit)}
          </p>
        </div>

        {/* Carteira de Investimentos */}
        <div className="card-premium p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-purple/20 to-accent-pink/20 flex items-center justify-center border border-accent-purple/10">
              <PieChart className="w-5 h-5 text-accent-purple" />
            </div>
            <span className="text-xs text-gray-500 number-font">{assets.length} ativos</span>
          </div>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Investimentos</p>
          <p className="text-2xl font-bold text-white number-font tracking-tight">
            {formatCurrency(totalCurrentValue)}
          </p>
        </div>

        {/* Empresas */}
        <div className="card-premium p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-yellow/20 to-accent-orange/20 flex items-center justify-center border border-accent-yellow/10">
              <Users className="w-5 h-5 text-accent-yellow" />
            </div>
          </div>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Empresas do Grupo</p>
          <p className="text-2xl font-bold text-white number-font tracking-tight">
            {companies.length}
          </p>
          {companies.length > 0 && (
            <div className="flex mt-3 -space-x-2">
              {companies.slice(0, 5).map((c, i) => (
                <div
                  key={c.id}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-dark-card"
                  style={{ backgroundColor: c.avatar_color || ['#2563EB', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899'][i % 5] }}
                >
                  {c.name.charAt(0)}
                </div>
              ))}
              {companies.length > 5 && (
                <div className="w-7 h-7 rounded-full bg-dark-hover flex items-center justify-center text-[10px] font-medium text-gray-400 border-2 border-dark-card">
                  +{companies.length - 5}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Portfolio Breakdown */}
      {Object.keys(assetsByClass).length > 0 && (
        <div className="card-premium">
          <div className="p-5 border-b border-white/[0.04]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-indigo/20 to-accent-purple/20 flex items-center justify-center border border-accent-indigo/10">
                <BarChart3 className="w-4 h-4 text-accent-indigo" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Composição do Portfólio</h3>
                <p className="text-xs text-gray-500">Distribuição por classe de ativo</p>
              </div>
            </div>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Object.entries(assetsByClass).map(([cls, data], i) => {
                const pct = totalCurrentValue > 0 ? (data.value / totalCurrentValue) * 100 : 0
                const colors = ['from-primary to-accent-indigo', 'from-accent-purple to-accent-pink', 'from-accent-green to-accent-cyan', 'from-accent-yellow to-accent-orange', 'from-accent-red to-accent-pink']
                return (
                  <div key={cls} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-all">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${colors[i % colors.length]} opacity-80 flex items-center justify-center mb-3`}>
                      <PieChart className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-xs text-gray-400 font-medium">{cls}</p>
                    <p className="text-lg font-bold text-white number-font mt-1">{pct.toFixed(1)}%</p>
                    <p className="text-xs text-gray-500 number-font">{formatCurrency(data.value)}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Companies Dashboard */}
      <CompaniesDashboard />

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <CashFlowProjection currentBalance={operationalProfit} />
        <TaxCalculator transactions={transactions} assets={assets} />
      </div>

      {/* Company Modal */}
      <CompanyModal
        isOpen={showCompanyModal}
        onClose={() => {
          setShowCompanyModal(false)
          setEditingCompany(null)
        }}
        onSuccess={loadData}
        company={editingCompany}
      />
    </div>
  )
}
