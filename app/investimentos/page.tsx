'use client'

import { useEffect, useState, useMemo } from 'react'
import { Plus, RefreshCw, Trash2, TrendingUp, TrendingDown, FileDown, Globe, Flame, LayoutDashboard } from 'lucide-react'
import dynamic from 'next/dynamic'
import AssetModal from '@/components/AssetModal'
import InvestmentPieChart from '@/components/InvestmentPieChart'
import PriceAlerts from '@/components/PriceAlerts'
import DividendsDashboard from '@/components/DividendsDashboard'
import PriceHistory from '@/components/PriceHistory'
import LiveMarketBackground from '@/components/LiveMarketBackground'
import PriceAlertNotifier from '@/components/PriceAlertNotifier'
import GlobalAllocationMap from '@/components/GlobalAllocationMap'
import FIRECalculator from '@/components/FIRECalculator'
import PremiumReportModal from '@/components/PremiumReportModal'
import DividendAIProjection from '@/components/DividendAIProjection'
import { getAssets, deleteAsset, Asset, getDividends, Dividend } from '@/lib/supabase'
import { formatCurrency, formatNumber, calculatePercentageChange } from '@/lib/utils'
import axios from 'axios'
import { toast } from 'react-hot-toast'

const CryptoLive = dynamic(() => import('@/components/CryptoLive'), { ssr: false, loading: () => <div className="loading-shimmer h-[300px] rounded-xl" /> })

export default function InvestimentosPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'global' | 'fire'>('overview')
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [dividends, setDividends] = useState<Dividend[]>([])

  const loadAssets = async () => {
    // Don't set global loading on reload to avoid flicker
    if (assets.length === 0) setLoading(true)
    try {
      const data = await getAssets()
      setAssets(data)
    } catch (error) {
      console.error('Erro ao carregar ativos:', error)
    } finally {
      setLoading(false)
    }
  }

  const updatePrices = async () => {
    setUpdating(true)
    const toastId = toast.loading('Atualizando cotações...')
    try {
      const res = await axios.post('/api/cotacoes-live')
      if (res.data.success) {
        await loadAssets()
        setLastUpdate(new Date())
        toast.success(`Cotações atualizadas! (${res.data.updated} ativos)`, { id: toastId })
      } else {
        throw new Error(res.data.error || 'Erro desconhecido')
      }
    } catch (error) {
      console.error('Erro ao atualizar cotações:', error)
      toast.error('Erro ao atualizar cotações', { id: toastId })
    } finally {
      setUpdating(false)
    }
  }

  useEffect(() => {
    loadAssets()
    loadDividends()

    // Initial update if needed, but let's just stick to manual + interval
    // Atualização automática a cada 5 minutos (300s) para não abusar da API
    const interval = setInterval(() => {
      updatePrices()
    }, 300000)

    return () => clearInterval(interval)
  }, [])

  const handleDeleteAsset = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este ativo?')) return

    try {
      await deleteAsset(id)
      loadAssets()
      toast.success('Ativo excluído')
    } catch (error) {
      console.error('Erro ao deletar ativo:', error)
      toast.error('Erro ao excluir ativo')
    }
  }

  const loadDividends = async () => {
    try {
      const data = await getDividends()
      setDividends(data)
    } catch (error) {
      console.error('Erro ao carregar dividendos:', error)
    }
  }

  // Cálculos totais
  const totalInvestido = assets.reduce(
    (sum, asset) => sum + (asset.quantidade * asset.preco_medio),
    0
  )

  const totalAtual = assets.reduce(
    (sum, asset) => sum + (asset.quantidade * asset.preco_atual),
    0
  )

  const lucroTotal = totalAtual - totalInvestido
  const percentualTotal = totalInvestido > 0
    ? calculatePercentageChange(totalAtual, totalInvestido)
    : 0

  const marketSentiment = useMemo(() => {
    if (totalInvestido === 0) return 'neutral' as const
    if (percentualTotal > 0.5) return 'bullish' as const
    if (percentualTotal < -0.5) return 'bearish' as const
    return 'neutral' as const
  }, [percentualTotal, totalInvestido])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card-premium h-96 loading-shimmer" />
      </div>
    )
  }

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Live Market Particle Background */}
      <div className="fixed inset-0 z-0">
        <LiveMarketBackground sentiment={marketSentiment} />
      </div>

      {/* Price Alert Notification Integration */}
      <PriceAlertNotifier assets={assets} />

      {/* Page Content — above background */}
      <div className="relative z-10">
      {/* Header */}
      <div className="mb-6 sm:mb-8 animate-fade-in">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold gradient-text font-mono mb-1 sm:mb-2">
              Carteira de Investimentos
            </h1>
            <p className="text-gray-400 text-sm mb-4 lg:mb-0">
              Gestão de ativos, exposição global e simulações FIRE
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Tabs */}
            <div className="flex p-1 bg-dark-bg/80 backdrop-blur-md rounded-xl border border-dark-border/50 self-start sm:self-auto overflow-x-auto no-scrollbar max-w-full">
               <button 
                 onClick={() => setActiveTab('overview')} 
                 className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'overview' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
               >
                 <LayoutDashboard className="w-4 h-4" /> <span className="hidden sm:inline">Visão Geral</span>
               </button>
               <button 
                 onClick={() => setActiveTab('global')} 
                 className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'global' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
               >
                 <Globe className="w-4 h-4" /> Global
               </button>
               <button 
                 onClick={() => setActiveTab('fire')} 
                 className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'fire' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
               >
                 <Flame className="w-4 h-4" /> FIRE
               </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="btn-secondary flex items-center gap-2 text-sm px-4 py-2 whitespace-nowrap"
              >
                <FileDown className="w-4 h-4 hidden sm:block" /> Relatório
              </button>
              <div className="flex flex-col items-end">
                <button
                  onClick={updatePrices}
                  disabled={updating}
                  className="btn-primary flex items-center gap-2 text-sm px-4 py-2 whitespace-nowrap h-full"
                >
                  <RefreshCw className={`w-4 h-4 ${updating ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">{updating ? 'Atualizando...' : 'Atualizar'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {activeTab === 'overview' && (
      <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Stats Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
        <div className="card-premium p-6 animate-slide-up" style={{ animationDelay: '0ms' }}>
          <p className="text-sm text-gray-400 mb-2">Total Investido</p>
          <p className="text-2xl font-bold number-font text-white">
            {formatCurrency(totalInvestido)}
          </p>
        </div>

        <div className="card-premium p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <p className="text-sm text-gray-400 mb-2">Valor Atual</p>
          <p className="text-2xl font-bold number-font text-white">
            {formatCurrency(totalAtual)}
          </p>
        </div>

        <div className="card-premium p-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <p className="text-sm text-gray-400 mb-2">Lucro/Prejuízo</p>
          <p className={`text-2xl font-bold number-font ${lucroTotal >= 0 ? 'text-accent-green' : 'text-accent-red'
            }`}>
            {lucroTotal >= 0 ? '+' : ''}{formatCurrency(lucroTotal)}
          </p>
        </div>

        <div className="card-premium p-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <p className="text-sm text-gray-400 mb-2">Rentabilidade</p>
          <div className="flex items-center gap-2">
            {percentualTotal >= 0 ? (
              <TrendingUp className="w-5 h-5 text-accent-green" />
            ) : (
              <TrendingDown className="w-5 h-5 text-accent-red" />
            )}
            <p className={`text-2xl font-bold number-font ${percentualTotal >= 0 ? 'text-accent-green' : 'text-accent-red'
              }`}>
              {percentualTotal >= 0 ? '+' : ''}{percentualTotal.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>

      {/* Charts & Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Pie Chart */}
        <div className="lg:col-span-2">
          {assets.length > 0 ? (
            <InvestmentPieChart assets={assets} />
          ) : (
            <div className="card-premium h-full flex items-center justify-center p-8">
              <p className="text-gray-500">Adicione ativos para ver o gráfico</p>
            </div>
          )}
        </div>

        {/* Price Alerts */}
        <div className="lg:col-span-1 h-full">
          <PriceAlerts assets={assets} />
        </div>
      </div>

      {/* Dividendos e Histórico de Preços */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <DividendsDashboard />
        <PriceHistory />
      </div>

      {/* Cripto em Tempo Real */}
      <div className="mb-8">
        <CryptoLive />
      </div>

      {/* DividendAI Projection */}
      <DividendAIProjection dividends={dividends} assets={assets} />

      {/* Tabela de Ativos */}
      <div className="card-premium animate-slide-up" style={{ animationDelay: '400ms' }}>
        <div className="p-4 sm:p-6 border-b border-dark-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white mb-1">Seus Ativos</h2>
              <p className="text-xs sm:text-sm text-gray-400">
                Gerencie sua carteira de criptos e ações
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              Adicionar Ativo
            </button>
          </div>
        </div>

        {/* Table */}
        {assets.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-400 mb-4">Nenhum ativo adicionado ainda</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary"
            >
              Adicionar primeiro ativo
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="hidden sm:table-header-group">
                <tr className="border-b border-dark-border">
                  <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-gray-400">Ticker</th>
                  <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-gray-400">Classe</th>
                  <th className="px-4 lg:px-6 py-4 text-right text-sm font-semibold text-gray-400">Qtd</th>
                  <th className="px-4 lg:px-6 py-4 text-right text-sm font-semibold text-gray-400 hidden md:table-cell">P. Médio</th>
                  <th className="px-4 lg:px-6 py-4 text-right text-sm font-semibold text-gray-400">P. Atual</th>
                  <th className="px-4 lg:px-6 py-4 text-right text-sm font-semibold text-gray-400 hidden lg:table-cell">T. Investido</th>
                  <th className="px-4 lg:px-6 py-4 text-right text-sm font-semibold text-gray-400 hidden lg:table-cell">V. Atual</th>
                  <th className="px-4 lg:px-6 py-4 text-right text-sm font-semibold text-gray-400 hidden md:table-cell">Lucro/Prej</th>
                  <th className="px-4 lg:px-6 py-4 text-right text-sm font-semibold text-gray-400">%</th>
                  <th className="px-4 lg:px-6 py-4 text-right text-sm font-semibold text-gray-400">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {assets.map((asset) => {
                  const totalInvestido = asset.quantidade * asset.preco_medio
                  const valorAtual = asset.quantidade * asset.preco_atual
                  const lucro = valorAtual - totalInvestido
                  const percentual = calculatePercentageChange(valorAtual, totalInvestido)

                  return (
                    <tr key={asset.id} className="hover:bg-dark-hover transition-colors group hidden sm:table-row">
                      <td className="px-4 lg:px-6 py-4">
                        <span className="font-bold text-white">{asset.ticker}</span>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${asset.classe === 'Stocks' || asset.classe === 'Ações'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-accent-purple/10 text-accent-purple'
                          }`}>
                          {asset.classe}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-right number-font text-gray-300">
                        {formatNumber(asset.quantidade)}
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-right number-font text-gray-300 hidden md:table-cell">
                        {formatCurrency(asset.preco_medio)}
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-right number-font text-white font-semibold">
                        {formatCurrency(asset.preco_atual)}
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-right number-font text-gray-300 hidden lg:table-cell">
                        {formatCurrency(totalInvestido)}
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-right number-font text-white font-semibold hidden lg:table-cell">
                        {formatCurrency(valorAtual)}
                      </td>
                      <td className={`px-4 lg:px-6 py-4 text-right number-font font-bold hidden md:table-cell ${lucro >= 0 ? 'text-accent-green' : 'text-accent-red'
                        }`}>
                        {lucro >= 0 ? '+' : ''}{formatCurrency(lucro)}
                      </td>
                      <td className={`px-4 lg:px-6 py-4 text-right number-font font-bold ${percentual >= 0 ? 'text-accent-green' : 'text-accent-red'
                        }`}>
                        <div className="flex items-center justify-end gap-1">
                          {percentual >= 0 ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                          {percentual >= 0 ? '+' : ''}{percentual.toFixed(2)}%
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteAsset(asset.id)}
                          className="lg:opacity-0 lg:group-hover:opacity-100 p-2 hover:bg-accent-red/10 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4 text-accent-red" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
                {/* Mobile card layout */}
                {assets.map((asset) => {
                  const totalInvestido = asset.quantidade * asset.preco_medio
                  const valorAtual = asset.quantidade * asset.preco_atual
                  const lucro = valorAtual - totalInvestido
                  const percentual = calculatePercentageChange(valorAtual, totalInvestido)

                  return (
                    <tr key={`mobile-${asset.id}`} className="sm:hidden">
                      <td colSpan={10} className="p-0">
                        <div className="flex items-center justify-between p-4 border-b border-dark-border">
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${asset.classe === 'Stocks' || asset.classe === 'Ações'
                              ? 'bg-primary/10 text-primary'
                              : 'bg-accent-purple/10 text-accent-purple'
                              }`}>
                              {asset.ticker}
                            </span>
                            <div>
                              <p className="text-sm text-white font-medium">{formatCurrency(valorAtual)}</p>
                              <p className="text-xs text-gray-500">{formatNumber(asset.quantidade)} un · {asset.classe}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <p className={`text-sm font-bold number-font ${percentual >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                                {percentual >= 0 ? '+' : ''}{percentual.toFixed(2)}%
                              </p>
                              <p className={`text-xs number-font ${lucro >= 0 ? 'text-accent-green/70' : 'text-accent-red/70'}`}>
                                {lucro >= 0 ? '+' : ''}{formatCurrency(lucro)}
                              </p>
                            </div>
                            <button
                              onClick={() => handleDeleteAsset(asset.id)}
                              className="p-2 hover:bg-accent-red/10 rounded-lg transition-all"
                            >
                              <Trash2 className="w-4 h-4 text-accent-red" />
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </div>
      )}

      {activeTab === 'global' && (
        <GlobalAllocationMap totalInvestido={totalInvestido} />
      )}

      {activeTab === 'fire' && (
        <FIRECalculator patrimony={totalAtual > 0 ? totalAtual : totalInvestido} />
      )}

      </div> {/* end z-10 content wrapper */}

      <PremiumReportModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} />

      {/* Modal */}
      <AssetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadAssets}
      />
    </div>
  )
}
