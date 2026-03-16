'use client'

import { useState, useEffect, useMemo } from 'react'
import { Brain, TrendingUp, TrendingDown, Minus, BarChart3, AlertTriangle } from 'lucide-react'
import { getTransactions, Transaction } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'

interface MonthlyData {
    month: string
    label: string
    income: number
    expense: number
    balance: number
}

interface ForecastPoint {
    label: string
    income: number
    expense: number
    balance: number
    confidence: number
    isForecast: boolean
}

export default function ForecastML() {
    const [data, setData] = useState<ForecastPoint[]>([])
    const [loading, setLoading] = useState(true)
    const [trend, setTrend] = useState<'up' | 'down' | 'stable'>('stable')
    const [accuracy, setAccuracy] = useState(0)

    useEffect(() => {
        loadAndForecast()
    }, [])

    const loadAndForecast = async () => {
        try {
            const transactions = await getTransactions()
            const monthlyData = aggregateMonthly(transactions)
            const forecast = generateForecast(monthlyData)
            setData(forecast)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const aggregateMonthly = (transactions: Transaction[]): MonthlyData[] => {
        const months: Record<string, MonthlyData> = {}

        transactions.forEach(t => {
            const date = new Date(t.created_at)
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

            if (!months[key]) {
                months[key] = {
                    month: key,
                    label: date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
                    income: 0, expense: 0, balance: 0
                }
            }

            if (t.type === 'income') months[key].income += t.amount
            else months[key].expense += Math.abs(t.amount)
        })

        return Object.values(months)
            .sort((a, b) => a.month.localeCompare(b.month))
            .slice(-6) // Last 6 months
    }

    const generateForecast = (monthlyData: MonthlyData[]): ForecastPoint[] => {
        if (monthlyData.length < 2) {
            setAccuracy(0)
            setTrend('stable')
            return monthlyData.map(m => ({ ...m, confidence: 1, isForecast: false }))
        }

        // Linear regression for income
        const incomeSlope = linearRegression(monthlyData.map(m => m.income))
        const expenseSlope = linearRegression(monthlyData.map(m => m.expense))

        // Weighted moving average
        const weights = monthlyData.map((_, i) => i + 1)
        const totalWeight = weights.reduce((s, w) => s + w, 0)

        const wmaIncome = monthlyData.reduce((s, m, i) => s + m.income * weights[i], 0) / totalWeight
        const wmaExpense = monthlyData.reduce((s, m, i) => s + m.expense * weights[i], 0) / totalWeight

        // Determine trend
        if (incomeSlope > 0.05 * wmaIncome) setTrend('up')
        else if (incomeSlope < -0.05 * wmaIncome) setTrend('down')
        else setTrend('stable')

        // Accuracy based on data consistency (coefficient of variation)
        const incomeStdDev = stdDev(monthlyData.map(m => m.income))
        const incomeMean = monthlyData.reduce((s, m) => s + m.income, 0) / monthlyData.length
        const cv = incomeMean > 0 ? incomeStdDev / incomeMean : 1
        setAccuracy(Math.max(50, Math.min(95, Math.round((1 - cv) * 100))))

        // Historical data
        const result: ForecastPoint[] = monthlyData.map(m => ({
            ...m,
            confidence: 1,
            isForecast: false
        }))

        // Generate 3 months of forecast
        const now = new Date()
        for (let i = 1; i <= 3; i++) {
            const futureDate = new Date(now.getFullYear(), now.getMonth() + i, 1)
            const label = futureDate.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })

            // Blend linear regression with WMA
            const n = monthlyData.length
            const forecastIncome = Math.max(0, (wmaIncome * 0.6) + ((monthlyData[n - 1]?.income || 0) + incomeSlope * i) * 0.4)
            const forecastExpense = Math.max(0, (wmaExpense * 0.6) + ((monthlyData[n - 1]?.expense || 0) + expenseSlope * i) * 0.4)

            result.push({
                label,
                income: Math.round(forecastIncome),
                expense: Math.round(forecastExpense),
                balance: Math.round(forecastIncome - forecastExpense),
                confidence: Math.max(0.5, 1 - (i * 0.15)),
                isForecast: true
            })
        }

        return result
    }

    const linearRegression = (values: number[]): number => {
        const n = values.length
        if (n < 2) return 0
        const xMean = (n - 1) / 2
        const yMean = values.reduce((s, v) => s + v, 0) / n
        let num = 0, den = 0
        for (let i = 0; i < n; i++) {
            num += (i - xMean) * (values[i] - yMean)
            den += (i - xMean) ** 2
        }
        return den !== 0 ? num / den : 0
    }

    const stdDev = (values: number[]): number => {
        const mean = values.reduce((s, v) => s + v, 0) / values.length
        const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length
        return Math.sqrt(variance)
    }

    // Chart calculations
    const allValues = data.flatMap(d => [d.income, d.expense])
    const maxVal = Math.max(...allValues, 1)

    const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
    const trendColor = trend === 'up' ? 'text-accent-green' : trend === 'down' ? 'text-accent-red' : 'text-accent-yellow'
    const trendLabel = trend === 'up' ? 'Crescimento' : trend === 'down' ? 'Queda' : 'Estável'

    const forecastData = data.filter(d => d.isForecast)
    const nextMonthBalance = forecastData[0]?.balance || 0

    if (loading) {
        return (
            <div className="card-premium p-6 animate-pulse">
                <div className="h-6 bg-dark-hover rounded w-48 mb-6" />
                <div className="h-48 bg-dark-hover rounded-xl" />
            </div>
        )
    }

    return (
        <div className="card-premium">
            <div className="p-6 border-b border-dark-border">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent-purple rounded-xl flex items-center justify-center">
                            <Brain className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Forecast Inteligente</h3>
                            <p className="text-sm text-gray-400">Projeção dos próximos 3 meses</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${trend === 'up' ? 'bg-accent-green/10' : trend === 'down' ? 'bg-accent-red/10' : 'bg-accent-yellow/10'
                            }`}>
                            <TrendIcon className={`w-4 h-4 ${trendColor}`} />
                            <span className={`text-sm font-medium ${trendColor}`}>{trendLabel}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-5">
                {/* Accuracy indicator */}
                <div className="flex items-center gap-3 bg-dark-card rounded-xl p-3">
                    <Brain className="w-5 h-5 text-primary" />
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-300">Confiança do modelo</span>
                            <span className="text-sm font-bold number-font text-primary">{accuracy}%</span>
                        </div>
                        <div className="h-1.5 bg-dark-bg rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${accuracy}%` }} />
                        </div>
                    </div>
                </div>

                {/* Bar Chart */}
                <div className="bg-dark-card rounded-xl p-4">
                    <div className="flex items-end gap-1.5 h-40">
                        {data.map((point, i) => {
                            const incomeH = (point.income / maxVal) * 100
                            const expenseH = (point.expense / maxVal) * 100
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                                    {/* Tooltip */}
                                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-dark-bg px-3 py-2 rounded-lg shadow-lg z-10 whitespace-nowrap pointer-events-none">
                                        <p className="text-xs text-accent-green">{formatCurrency(point.income)}</p>
                                        <p className="text-xs text-accent-red">{formatCurrency(point.expense)}</p>
                                    </div>

                                    <div className="flex items-end gap-0.5 h-full w-full">
                                        {/* Income bar */}
                                        <div
                                            className={`flex-1 rounded-t transition-all duration-500 ${point.isForecast
                                                    ? 'bg-accent-green/30 border border-accent-green/40 border-dashed border-b-0'
                                                    : 'bg-accent-green/60'
                                                }`}
                                            style={{ height: `${incomeH}%`, opacity: point.confidence }}
                                        />
                                        {/* Expense bar */}
                                        <div
                                            className={`flex-1 rounded-t transition-all duration-500 ${point.isForecast
                                                    ? 'bg-accent-red/30 border border-accent-red/40 border-dashed border-b-0'
                                                    : 'bg-accent-red/60'
                                                }`}
                                            style={{ height: `${expenseH}%`, opacity: point.confidence }}
                                        />
                                    </div>
                                    <span className={`text-[10px] mt-1 ${point.isForecast ? 'text-primary font-medium' : 'text-gray-500'}`}>
                                        {point.label}
                                    </span>
                                </div>
                            )
                        })}
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-dark-border">
                        <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded bg-accent-green/60" />
                                <span className="text-gray-400">Receita</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded bg-accent-red/60" />
                                <span className="text-gray-400">Despesa</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded border border-dashed border-primary/40 bg-primary/10" />
                                <span className="text-gray-400">Projeção</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Forecast Summary Cards */}
                <div className="grid grid-cols-3 gap-3">
                    {forecastData.map((point, i) => (
                        <div key={i} className="bg-dark-card rounded-xl p-3 text-center">
                            <p className="text-xs text-gray-500 mb-1">{point.label}</p>
                            <p className={`text-lg font-bold number-font ${point.balance >= 0 ? 'text-accent-green' : 'text-accent-red'
                                }`}>
                                {point.balance >= 0 ? '+' : ''}{formatCurrency(point.balance)}
                            </p>
                            <p className="text-[10px] text-gray-500 mt-0.5">
                                Confiança: {Math.round(point.confidence * 100)}%
                            </p>
                        </div>
                    ))}
                </div>

                {/* Alert if negative trend */}
                {trend === 'down' && (
                    <div className="flex items-start gap-3 bg-accent-red/5 border border-accent-red/20 rounded-xl p-4">
                        <AlertTriangle className="w-5 h-5 text-accent-red flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-accent-red">Tendência de queda detectada</p>
                            <p className="text-xs text-gray-400 mt-1">
                                O modelo identificou redução na receita. Considere diversificar fontes de renda ou revisar custos.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
