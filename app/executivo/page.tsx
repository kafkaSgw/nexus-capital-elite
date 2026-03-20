'use client'

import { useState, useEffect } from 'react'
import { Presentation, TrendingUp, TrendingDown, DollarSign, Target, Building2, Download, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { getTransactions, getAssets, getCompanies, Company } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import ForecastML from '@/components/ForecastML'
import AIWealthManager from '@/components/AIWealthManager'
import TaxOptimizer from '@/components/TaxOptimizer'
import WealthMilestones from '@/components/WealthMilestones'
import KPIDashboard from '@/components/KPIDashboard'
import dynamic from 'next/dynamic'

const SankeyDiagram = dynamic(() => import('@/components/SankeyDiagram'), { ssr: false, loading: () => <div className="h-[500px] w-full bg-dark-card/50 rounded-xl animate-pulse" /> })

export default function ExecutiveDashboard() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [assets, setAssets] = useState<any[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [trans, ast, comps] = await Promise.all([
        getTransactions(),
        getAssets(),
        getCompanies()
      ])
      setTransactions(trans)
      setAssets(ast)
      setCompanies(comps || [])
    } finally {
      setLoading(false)
    }
  }

  // Cálculos executivos
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpense = Math.abs(transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0))
  const netProfit = totalIncome - totalExpense
  const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0

  const totalInvested = assets.reduce((s, a) => s + (a.quantidade * a.preco_medio), 0)
  const currentValue = assets.reduce((s, a) => s + (a.quantidade * a.preco_atual), 0)
  const roi = totalInvested > 0 ? ((currentValue - totalInvested) / totalInvested) * 100 : 0

  const patrimony = netProfit + currentValue

  // Performance por empresa
  const companyPerformance = companies.map(company => {
    const companyTx = transactions.filter(t => t.company_id === company.id || t.category === company.name)
    const income = companyTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const expense = Math.abs(companyTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0))
    const profit = income - expense
    const margin = income > 0 ? (profit / income) * 100 : 0
    return { ...company, income, expense, profit, margin }
  }).sort((a, b) => b.profit - a.profit)

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="card-premium h-96 loading-shimmer" />
    </div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Executivo */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold gradient-text font-mono mb-2">
              Dashboard Executivo
            </h1>
            <p className="text-gray-400 text-sm sm:text-base">
              Visão consolidada para apresentação executiva
            </p>
          </div>
          <button className="btn-primary flex items-center gap-2 text-sm sm:text-base whitespace-nowrap">
            <Download className="w-4 sm:w-5 h-4 sm:h-5" />
            Exportar
          </button>
        </div>

        {/* Company Header */}
        <div className="card-premium p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary to-accent-purple rounded-2xl flex items-center justify-center shrink-0">
                <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-dark-bg" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Nexus Capital Elite
                </h2>
                <p className="text-gray-400 text-xs sm:text-sm">Relatório Executivo - {new Date().getFullYear()} • {companies.length} Empresas • {assets.length} Ativos</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/holding" className="btn-secondary text-xs sm:text-sm flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span className="hidden sm:inline">Ver </span>Holding
              </Link>
              <Link href="/investimentos" className="btn-secondary text-xs sm:text-sm flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                <span className="hidden sm:inline">Ver </span>Carteira
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas Principais - Grande Destaque */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="card-premium p-5 sm:p-8 bg-gradient-to-br from-accent-green/10 to-transparent border-2 border-accent-green/30">
          <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-14 sm:h-14 bg-accent-green/20 rounded-xl flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5 sm:w-8 sm:h-8 text-accent-green" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-wide">Patrimônio Total</p>
              <p className="text-2xl sm:text-4xl font-bold text-accent-green number-font">
                {formatCurrency(patrimony)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-accent-green" />
            <span className="text-gray-300">Crescimento sustentável</span>
          </div>
        </div>

        <div className="card-premium p-5 sm:p-8">
          <div className="mb-3 sm:mb-4">
            <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-wide mb-2">Lucro Líquido</p>
            <p className={`text-2xl sm:text-4xl font-bold number-font ${netProfit >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
              {formatCurrency(netProfit)}
            </p>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Margem:</span>
            <span className={`font-bold ${profitMargin >= 20 ? 'text-accent-green' : 'text-accent-yellow'}`}>
              {profitMargin.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="card-premium p-5 sm:p-8 bg-gradient-to-br from-primary/10 to-transparent border-2 border-primary/30">
          <div className="mb-3 sm:mb-4">
            <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-wide mb-2">ROI Investimentos</p>
            <p className={`text-2xl sm:text-4xl font-bold number-font ${roi >= 0 ? 'text-primary' : 'text-accent-red'}`}>
              {roi >= 0 ? '+' : ''}{roi.toFixed(2)}%
            </p>
          </div>
          <div className="text-sm text-gray-400">
            Valorização: {formatCurrency(currentValue - totalInvested)}
          </div>
        </div>
      </div>

      {/* KPI Dashboard */}
      <div className="mb-6 sm:mb-8">
        <KPIDashboard
          transactions={transactions}
          assets={assets}
          currentMonth={new Date().getMonth()}
          previousMonth={new Date().getMonth() === 0 ? 11 : new Date().getMonth() - 1}
        />
      </div>

      {/* AI Wealth Manager Widget */}
      <div className="mb-6 sm:mb-8">
        <AIWealthManager portfolioValue={totalInvested} />
      </div>

      {/* Performance por Empresa */}
      {companies.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Performers */}
          <div className="card-premium">
            <div className="p-6 border-b border-dark-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent-green/20 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-accent-green" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Top Performers</h3>
                    <p className="text-sm text-gray-400">{companies.length} empresas no portfólio</p>
                  </div>
                </div>
                <span className="text-2xl">🏆</span>
              </div>
            </div>
            <div className="p-6 space-y-3">
              {companyPerformance.filter(c => c.income > 0).slice(0, 5).map((company, index) => (
                <div key={company.id} className="flex items-center justify-between p-4 rounded-xl bg-dark-card hover:bg-dark-hover transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white shadow-lg ${company.profit > 0
                      ? 'bg-gradient-to-br from-accent-green to-accent-green/50'
                      : 'bg-gradient-to-br from-accent-red to-accent-red/50'
                      }`}>
                      #{index + 1}
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{company.name}</p>
                      <p className="text-xs text-gray-500">Margem: {company.margin.toFixed(1)}%</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold number-font text-sm ${company.profit >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                      {formatCurrency(company.profit)}
                    </p>
                    <p className="text-xs text-gray-500">Receita: {formatCurrency(company.income)}</p>
                  </div>
                </div>
              ))}
              {companyPerformance.filter(c => c.income > 0).length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-400">Nenhuma empresa com transações ainda</p>
                  <p className="text-sm text-gray-500 mt-2">Vincule transações às empresas para ver rankings</p>
                </div>
              )}
            </div>
          </div>

          {/* Composição da Carteira de Investimentos */}
          <div className="card-premium">
            <div className="p-6 border-b border-dark-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Carteira de Investimentos</h3>
                    <p className="text-sm text-gray-400">{assets.length} ativos • {formatCurrency(currentValue)}</p>
                  </div>
                </div>
                <Link href="/investimentos" className="text-xs text-primary hover:text-primary/80 transition-colors">
                  Ver tudo →
                </Link>
              </div>
            </div>
            <div className="p-6 space-y-3">
              {assets.length > 0 ? (
                <>
                  {assets.slice(0, 6).map(asset => {
                    const valorAtual = asset.quantidade * asset.preco_atual
                    const valorInvestido = asset.quantidade * asset.preco_medio
                    const lucro = valorAtual - valorInvestido
                    const percentual = valorInvestido > 0 ? ((lucro / valorInvestido) * 100) : 0
                    const participacao = currentValue > 0 ? (valorAtual / currentValue) * 100 : 0

                    return (
                      <div key={asset.id} className="flex items-center justify-between p-3 rounded-lg bg-dark-card hover:bg-dark-hover transition-all">
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${asset.classe === 'Stocks' ? 'bg-primary/10 text-primary' : 'bg-accent-purple/10 text-accent-purple'
                            }`}>
                            {asset.ticker}
                          </span>
                          <div>
                            <p className="text-sm text-white font-medium">{formatCurrency(valorAtual)}</p>
                            <p className="text-xs text-gray-500">{participacao.toFixed(1)}% da carteira</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {percentual >= 0 ? (
                            <ArrowUpRight className="w-4 h-4 text-accent-green" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 text-accent-red" />
                          )}
                          <span className={`text-sm font-bold number-font ${percentual >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                            {percentual >= 0 ? '+' : ''}{percentual.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    )
                  })}
                  {assets.length > 6 && (
                    <Link href="/investimentos" className="block text-center text-sm text-primary hover:text-primary/80 mt-2">
                      + {assets.length - 6} ativos...
                    </Link>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <Wallet className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">Nenhum ativo na carteira</p>
                  <Link href="/investimentos" className="text-sm text-primary mt-2 inline-block">
                    Adicionar investimentos →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Gráfico de Receitas vs Despesas - Visual Executivo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="card-premium">
          <div className="p-6 border-b border-dark-border">
            <h3 className="font-bold text-white text-lg">Performance Financeira</h3>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Receitas Totais</span>
                  <span className="text-xl font-bold text-accent-green number-font">
                    {formatCurrency(totalIncome)}
                  </span>
                </div>
                <div className="h-4 bg-dark-bg rounded-full overflow-hidden">
                  <div className="h-full bg-accent-green rounded-full" style={{ width: '100%' }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Despesas Totais</span>
                  <span className="text-xl font-bold text-accent-red number-font">
                    {formatCurrency(totalExpense)}
                  </span>
                </div>
                <div className="h-4 bg-dark-bg rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent-red rounded-full"
                    style={{ width: `${totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-dark-border">
                <div className="flex items-center justify-between">
                  <span className="text-lg text-gray-300">Resultado Líquido</span>
                  <span className={`text-2xl font-bold number-font ${netProfit >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                    {formatCurrency(netProfit)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card-premium">
          <div className="p-6 border-b border-dark-border">
            <h3 className="font-bold text-white text-lg">Indicadores Chave</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-dark-card rounded-lg">
              <div>
                <p className="text-sm text-gray-400 mb-1">Margem de Lucro</p>
                <p className="text-2xl font-bold text-white number-font">{profitMargin.toFixed(1)}%</p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${profitMargin >= 20 ? 'bg-accent-green/20' : 'bg-accent-yellow/20'
                }`}>
                <Target className={`w-6 h-6 ${profitMargin >= 20 ? 'text-accent-green' : 'text-accent-yellow'}`} />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-dark-card rounded-lg">
              <div>
                <p className="text-sm text-gray-400 mb-1">Ticket Médio</p>
                <p className="text-2xl font-bold text-white number-font">
                  {formatCurrency(totalIncome / Math.max(transactions.filter(t => t.type === 'income').length, 1))}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-dark-card rounded-lg">
              <div>
                <p className="text-sm text-gray-400 mb-1">Empresas no Portfólio</p>
                <p className="text-2xl font-bold text-white number-font">{companies.length}</p>
              </div>
              <div className="w-12 h-12 bg-accent-purple/20 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-accent-purple" />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-dark-card rounded-lg">
              <div>
                <p className="text-sm text-gray-400 mb-1">Ativos em Carteira</p>
                <p className="text-2xl font-bold text-white number-font">{assets.length}</p>
              </div>
              <div className="w-12 h-12 bg-accent-green/20 rounded-lg flex items-center justify-center">
                <Wallet className="w-6 h-6 text-accent-green" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Observações Executivas */}
      <div className="card-premium p-6">
        <h3 className="font-bold text-white text-lg mb-4">💼 Resumo Executivo</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-dark-card rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-2">✅ Pontos Fortes</p>
            <ul className="space-y-1 text-sm text-gray-300">
              {profitMargin >= 20 && <li>• Margem de lucro saudável ({profitMargin.toFixed(1)}%)</li>}
              {roi >= 0 && <li>• Investimentos em valorização (+{roi.toFixed(2)}%)</li>}
              {netProfit > 0 && <li>• Resultado líquido positivo</li>}
              {companies.length > 0 && <li>• {companies.length} empresa(s) gerando receita</li>}
              {assets.length > 0 && <li>• Carteira diversificada com {assets.length} ativo(s)</li>}
            </ul>
          </div>
          <div className="bg-dark-card rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-2">⚠️ Pontos de Atenção</p>
            <ul className="space-y-1 text-sm text-gray-300">
              {profitMargin < 20 && <li>• Margem de lucro abaixo do ideal</li>}
              {roi < 0 && <li>• Investimentos em desvalorização</li>}
              {netProfit < 0 && <li>• Resultado líquido negativo</li>}
              {companies.length === 0 && <li>• Nenhuma empresa cadastrada na holding</li>}
              {assets.length === 0 && <li>• Nenhum investimento na carteira</li>}
            </ul>
          </div>
        </div>
      </div>

      {/* Planejamento & Conquistas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <TaxOptimizer />
        <WealthMilestones currentNetWorth={patrimony} />
      </div>

      {/* Sankey Diagram - Fluxo Financeiro */}
      <div className="mt-8">
        <SankeyDiagram transactions={transactions} />
      </div>

      {/* Forecast Inteligente */}
      <div className="mt-8">
        <ForecastML />
      </div>
    </div>
  )
}

