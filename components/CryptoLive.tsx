'use client'

import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, TrendingUp, TrendingDown, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

interface CoinData {
    id: string
    symbol: string
    name: string
    current_price: number
    price_change_percentage_24h: number
    price_change_percentage_7d_in_currency: number
    sparkline_in_7d: { price: number[] }
    image: string
    market_cap_rank: number
}

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
    if (!data || data.length === 0) return null
    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1
    const w = 80
    const h = 28
    const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ')

    return (
        <svg width={w} height={h} className="shrink-0">
            <polyline fill="none" stroke={color} strokeWidth="1.5" points={points} />
        </svg>
    )
}

export default function CryptoLive() {
    const [coins, setCoins] = useState<CoinData[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

    const fetchCrypto = useCallback(async () => {
        try {
            setError(false)
            const res = await fetch(
                'https://api.coingecko.com/api/v3/coins/markets?vs_currency=brl&order=market_cap_desc&per_page=10&page=1&sparkline=true&price_change_percentage=7d'
            )
            if (!res.ok) throw new Error('CoinGecko API error')
            const data = await res.json()
            setCoins(data)
            setLastUpdate(new Date())
        } catch (err) {
            console.error('Erro ao buscar preços cripto:', err)
            setError(true)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchCrypto()
        const interval = setInterval(fetchCrypto, 60 * 1000) // refresh every 60s
        return () => clearInterval(interval)
    }, [fetchCrypto])

    const formatPrice = (price: number) => {
        if (price >= 1000) return `R$ ${price.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}`
        if (price >= 1) return `R$ ${price.toFixed(2)}`
        return `R$ ${price.toFixed(6)}`
    }

    return (
        <div className="card-premium overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-white/[0.04] flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-yellow/20 to-accent-orange/20 flex items-center justify-center border border-accent-yellow/10">
                        <Zap className="w-4 h-4 text-accent-yellow" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-white">Cripto em Tempo Real</h3>
                        <p className="text-xs text-gray-500">
                            {lastUpdate ? `Atualizado ${lastUpdate.toLocaleTimeString('pt-BR')}` : 'Carregando...'}
                            {!loading && ' • Auto-refresh 60s'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={fetchCrypto}
                    disabled={loading}
                    className="p-2 rounded-lg hover:bg-white/[0.06] text-gray-400 hover:text-white transition-colors"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {error && !coins.length ? (
                <div className="p-8 text-center">
                    <p className="text-gray-400 text-sm">Não foi possível carregar os preços</p>
                    <button onClick={fetchCrypto} className="text-primary text-sm mt-2 hover:underline">Tentar novamente</button>
                </div>
            ) : (
                <div className="divide-y divide-white/[0.03]">
                    {(loading && coins.length === 0 ? Array(5).fill(null) : coins).map((coin, i) => {
                        if (!coin) {
                            return <div key={i} className="p-4 loading-shimmer h-16" />
                        }

                        const change24h = coin.price_change_percentage_24h || 0
                        const change7d = coin.price_change_percentage_7d_in_currency || 0
                        const sparkColor = change7d >= 0 ? '#10B981' : '#EF4444'

                        return (
                            <motion.div
                                key={coin.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.03 }}
                                className="flex items-center justify-between p-3 sm:p-4 hover:bg-white/[0.02] transition-colors group"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="relative shrink-0">
                                        <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
                                        <span className="absolute -top-1 -right-1 text-[8px] bg-white/10 text-gray-400 rounded-full px-1 font-mono">
                                            #{coin.market_cap_rank}
                                        </span>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-white truncate">{coin.name}</p>
                                        <p className="text-[10px] text-gray-500 uppercase font-mono">{coin.symbol}</p>
                                    </div>
                                </div>

                                <div className="hidden sm:block">
                                    <MiniSparkline data={coin.sparkline_in_7d?.price?.slice(-48) || []} color={sparkColor} />
                                </div>

                                <div className="text-right shrink-0 ml-3">
                                    <p className="text-sm font-bold text-white number-font">{formatPrice(coin.current_price)}</p>
                                    <div className="flex items-center gap-2 justify-end">
                                        <span className={`text-[10px] font-medium flex items-center gap-0.5 ${change24h >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                                            {change24h >= 0 ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                                            {Math.abs(change24h).toFixed(1)}% 24h
                                        </span>
                                        <span className={`text-[10px] font-medium hidden sm:flex items-center gap-0.5 ${change7d >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                                            {Math.abs(change7d).toFixed(1)}% 7d
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
