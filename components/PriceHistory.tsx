'use client'

import { useState, useEffect } from 'react'
import {
    LineChart, TrendingUp, TrendingDown, ArrowUpRight, Calendar
} from 'lucide-react'
import { getPriceHistory, getAssets, PriceHistoryRecord, Asset } from '@/lib/supabase'
import { formatCurrency, formatNumber } from '@/lib/utils'
import {
    LineChart as RechartsLine, Line, XAxis, YAxis, Tooltip,
    ResponsiveContainer, Area, AreaChart
} from 'recharts'

const PERIODS = [
    { label: '7D', days: 7 },
    { label: '30D', days: 30 },
    { label: '90D', days: 90 },
    { label: '1A', days: 365 },
    { label: 'Máx', days: 9999 },
]

export default function PriceHistory() {
    const [assets, setAssets] = useState<Asset[]>([])
    const [selectedAsset, setSelectedAsset] = useState<string>('')
    const [history, setHistory] = useState<PriceHistoryRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [period, setPeriod] = useState(30)

    useEffect(() => {
        loadAssets()
    }, [])

    useEffect(() => {
        if (selectedAsset) {
            loadHistory()
        }
    }, [selectedAsset, period])

    const loadAssets = async () => {
        try {
            const data = await getAssets()
            setAssets(data)
            if (data.length > 0) {
                setSelectedAsset(data[0].id)
            }
        } catch (err) {
            console.error('Erro ao carregar ativos:', err)
        } finally {
            setLoading(false)
        }
    }

    const loadHistory = async () => {
        try {
            const data = await getPriceHistory(selectedAsset, period)
            setHistory(data)
        } catch (err) {
            console.error('Erro ao carregar histórico:', err)
        }
    }

    const currentAsset = assets.find(a => a.id === selectedAsset)

    // Chart data
    const chartData = history.map(h => ({
        date: new Date(h.recorded_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        price: h.price,
        fullDate: new Date(h.recorded_at).toLocaleDateString('pt-BR')
    }))

    // Stats
    const prices = history.map(h => h.price)
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0
    const firstPrice = prices.length > 0 ? prices[0] : 0
    const lastPrice = prices.length > 0 ? prices[prices.length - 1] : (currentAsset?.preco_atual || 0)
    const variation = firstPrice > 0 ? ((lastPrice - firstPrice) / firstPrice) * 100 : 0
    const isPositive = variation >= 0

    // If no history, create a synthetic chart from current price
    const displayData = chartData.length > 0 ? chartData : (currentAsset ? [
        { date: 'Hoje', price: currentAsset.preco_atual, fullDate: new Date().toLocaleDateString('pt-BR') }
    ] : [])

    return (
        <div className="card-premium">
            <div className="p-5 border-b border-white/[0.04]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-accent-indigo/20 flex items-center justify-center border border-primary/10">
                            <LineChart className="w-4 h-4 text-primary-lighter" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-white">Histórico de Cotações</h3>
                            <p className="text-xs text-gray-500">Performance dos seus ativos</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-5">
                {/* Asset Selector */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                    <select value={selectedAsset} onChange={e => setSelectedAsset(e.target.value)}
                        className="input-premium text-sm py-2 flex-1 min-w-[150px]">
                        {assets.map(a => (
                            <option key={a.id} value={a.id}>{a.ticker} — {a.classe}</option>
                        ))}
                    </select>
                </div>

                {/* Period Tabs */}
                <div className="flex gap-1.5 mb-4">
                    {PERIODS.map(p => (
                        <button key={p.label} onClick={() => setPeriod(p.days)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${period === p.days
                                ? 'bg-primary/20 text-primary border border-primary/30'
                                : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'}`}>
                            {p.label}
                        </button>
                    ))}
                </div>

                {/* Current Asset Info */}
                {currentAsset && (
                    <div className="flex items-center justify-between mb-4 p-3 rounded-xl bg-white/[0.02]">
                        <div>
                            <p className="text-lg font-bold text-white">{currentAsset.ticker}</p>
                            <p className="text-2xl font-bold text-white number-font">{formatCurrency(currentAsset.preco_atual)}</p>
                        </div>
                        <div className="text-right">
                            {history.length > 1 && (
                                <>
                                    <div className={`flex items-center gap-1 text-sm font-bold ${isPositive ? 'text-accent-green' : 'text-accent-red'}`}>
                                        {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                        {isPositive ? '+' : ''}{variation.toFixed(2)}%
                                    </div>
                                    <p className="text-xs text-gray-500">no período</p>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Chart */}
                {displayData.length > 1 ? (
                    <div className="h-[200px] mb-4">
                        <ResponsiveContainer width="100%" height={200}>
                            <AreaChart data={displayData}>
                                <defs>
                                    <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={isPositive ? '#10B981' : '#EF4444'} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={isPositive ? '#10B981' : '#EF4444'} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                                <YAxis hide domain={['dataMin', 'dataMax']} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                                    formatter={(value: any) => [formatCurrency(Number(value)), 'Preço']}
                                    labelFormatter={(label) => `Data: ${label}`}
                                    labelStyle={{ color: '#9CA3AF' }}
                                />
                                <Area type="monotone" dataKey="price" stroke={isPositive ? '#10B981' : '#EF4444'} strokeWidth={2}
                                    fill="url(#priceGradient)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="h-[200px] flex items-center justify-center mb-4">
                        <div className="text-center">
                            <Calendar className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                            <p className="text-sm text-gray-400">Sem dados históricos suficientes</p>
                            <p className="text-xs text-gray-500 mt-1">O histórico será preenchido automaticamente</p>
                        </div>
                    </div>
                )}

                {/* Stats */}
                {history.length > 1 && (
                    <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 rounded-xl bg-white/[0.02] text-center">
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Mínimo</p>
                            <p className="text-sm font-bold text-accent-red number-font mt-1">{formatCurrency(minPrice)}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-white/[0.02] text-center">
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Máximo</p>
                            <p className="text-sm font-bold text-accent-green number-font mt-1">{formatCurrency(maxPrice)}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-white/[0.02] text-center">
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Variação</p>
                            <p className={`text-sm font-bold number-font mt-1 ${isPositive ? 'text-accent-green' : 'text-accent-red'}`}>
                                {isPositive ? '+' : ''}{variation.toFixed(2)}%
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
