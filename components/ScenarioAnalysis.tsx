'use client'

import { useState, useEffect, useMemo } from 'react'
import { Sliders, TrendingUp, TrendingDown, DollarSign, BarChart3, RefreshCw, Sparkles } from 'lucide-react'
import { getTransactions, getAssets, Transaction, Asset } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'

interface Scenario {
    revenueChange: number
    expenseChange: number
    investmentReturn: number
    months: 6 | 12 | 24
}

export default function ScenarioAnalysis() {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [assets, setAssets] = useState<Asset[]>([])
    const [loading, setLoading] = useState(true)
    const [scenario, setScenario] = useState<Scenario>({
        revenueChange: 0,
        expenseChange: 0,
        investmentReturn: 10,
        months: 12
    })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const [tx, as] = await Promise.all([getTransactions(), getAssets()])
            setTransactions(tx)
            setAssets(as)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const projection = useMemo(() => {
        const now = new Date()
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        const recentTx = transactions.filter(t => new Date(t.created_at) >= thirtyDaysAgo)

        const monthlyIncome = recentTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0) || 5000
        const monthlyExpense = recentTx.filter(t => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount), 0) || 3000

        const totalAssets = assets.reduce((s, a) => s + a.preco_atual * a.quantidade, 0)
        const totalBalance = transactions.reduce((s, t) => s + (t.type === 'income' ? t.amount : -Math.abs(t.amount)), 0)

        // Current scenario (no changes)
        const currentData: number[] = []
        let currentBalance = totalBalance + totalAssets

        // Simulated scenario
        const simulatedData: number[] = []
        let simBalance = totalBalance + totalAssets

        const adjustedIncome = monthlyIncome * (1 + scenario.revenueChange / 100)
        const adjustedExpense = monthlyExpense * (1 + scenario.expenseChange / 100)
        const monthlyReturn = scenario.investmentReturn / 100 / 12

        for (let i = 0; i <= scenario.months; i++) {
            currentData.push(currentBalance)
            simulatedData.push(simBalance)

            // Current: no change
            currentBalance += (monthlyIncome - monthlyExpense)

            // Simulated: with changes
            simBalance += (adjustedIncome - adjustedExpense)
            simBalance += simBalance * monthlyReturn * (i > 0 ? 1 : 0)
        }

        const finalDiff = simulatedData[simulatedData.length - 1] - currentData[currentData.length - 1]

        return { currentData, simulatedData, finalDiff, monthlyIncome, monthlyExpense, adjustedIncome, adjustedExpense }
    }, [transactions, assets, scenario])

    // Mini chart
    const maxVal = Math.max(...projection.currentData, ...projection.simulatedData)
    const minVal = Math.min(...projection.currentData, ...projection.simulatedData)
    const range = maxVal - minVal || 1
    const chartH = 160
    const chartW = 100 // percentage

    const toPath = (data: number[]) => {
        const stepX = chartW / (data.length - 1 || 1)
        return data.map((val, i) => {
            const x = i * stepX
            const y = chartH - ((val - minVal) / range) * (chartH - 20)
            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
        }).join(' ')
    }

    const resetScenario = () => setScenario({ revenueChange: 0, expenseChange: 0, investmentReturn: 10, months: 12 })

    if (loading) {
        return (
            <div className="card-premium p-6 animate-pulse">
                <div className="h-6 bg-dark-hover rounded w-56 mb-6" />
                <div className="h-48 bg-dark-hover rounded-xl" />
            </div>
        )
    }

    return (
        <div className="card-premium">
            <div className="p-6 border-b border-dark-border">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-accent-purple to-primary rounded-xl flex items-center justify-center">
                            <Sliders className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Análise de Cenários</h3>
                            <p className="text-sm text-gray-400">Simule mudanças e veja o impacto</p>
                        </div>
                    </div>
                    <button onClick={resetScenario} className="p-2 hover:bg-dark-hover rounded-lg transition-colors" title="Resetar">
                        <RefreshCw className="w-4 h-4 text-gray-400" />
                    </button>
                </div>
            </div>

            <div className="p-6 space-y-5">
                {/* Slider: Revenue */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm text-gray-300 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-accent-green" />
                            Variação de Receita
                        </label>
                        <span className={`text-sm font-bold number-font ${scenario.revenueChange >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                            {scenario.revenueChange >= 0 ? '+' : ''}{scenario.revenueChange}%
                        </span>
                    </div>
                    <input
                        type="range" min="-50" max="100" value={scenario.revenueChange}
                        onChange={e => setScenario({ ...scenario, revenueChange: parseInt(e.target.value) })}
                        className="w-full h-2 bg-dark-bg rounded-lg appearance-none cursor-pointer accent-accent-green"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>-50%</span>
                        <span className="text-gray-400">{formatCurrency(projection.adjustedIncome)}/mês</span>
                        <span>+100%</span>
                    </div>
                </div>

                {/* Slider: Expenses */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm text-gray-300 flex items-center gap-2">
                            <TrendingDown className="w-4 h-4 text-accent-red" />
                            Variação de Despesas
                        </label>
                        <span className={`text-sm font-bold number-font ${scenario.expenseChange <= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                            {scenario.expenseChange >= 0 ? '+' : ''}{scenario.expenseChange}%
                        </span>
                    </div>
                    <input
                        type="range" min="-50" max="100" value={scenario.expenseChange}
                        onChange={e => setScenario({ ...scenario, expenseChange: parseInt(e.target.value) })}
                        className="w-full h-2 bg-dark-bg rounded-lg appearance-none cursor-pointer accent-accent-red"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>-50%</span>
                        <span className="text-gray-400">{formatCurrency(projection.adjustedExpense)}/mês</span>
                        <span>+100%</span>
                    </div>
                </div>

                {/* Slider: Investment Return */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm text-gray-300 flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-primary" />
                            Retorno Investimentos (a.a.)
                        </label>
                        <span className="text-sm font-bold number-font text-primary">
                            {scenario.investmentReturn}%
                        </span>
                    </div>
                    <input
                        type="range" min="0" max="50" value={scenario.investmentReturn}
                        onChange={e => setScenario({ ...scenario, investmentReturn: parseInt(e.target.value) })}
                        className="w-full h-2 bg-dark-bg rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0%</span>
                        <span>50%</span>
                    </div>
                </div>

                {/* Period selector */}
                <div className="flex gap-2">
                    {([6, 12, 24] as const).map(m => (
                        <button
                            key={m}
                            onClick={() => setScenario({ ...scenario, months: m })}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${scenario.months === m
                                ? 'bg-primary text-white'
                                : 'bg-dark-card text-gray-400 hover:text-white hover:bg-dark-hover'
                                }`}
                        >
                            {m} meses
                        </button>
                    ))}
                </div>

                {/* Mini Chart SVG */}
                <div className="bg-dark-card rounded-xl p-4">
                    <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-40" preserveAspectRatio="none">
                        {/* Current scenario line */}
                        <path d={toPath(projection.currentData)} fill="none" stroke="#64748b" strokeWidth="1.5" strokeDasharray="4 4" />
                        {/* Simulated scenario */}
                        <path d={toPath(projection.simulatedData)} fill="none" stroke="#2563EB" strokeWidth="2" />
                        {/* Area under simulated */}
                        <path
                            d={`${toPath(projection.simulatedData)} L ${chartW} ${chartH} L 0 ${chartH} Z`}
                            fill="url(#scenario-gradient)" opacity="0.3"
                        />
                        <defs>
                            <linearGradient id="scenario-gradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#2563EB" />
                                <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="flex items-center gap-4 mt-2 text-xs">
                        <div className="flex items-center gap-1.5">
                            <div className="w-4 h-0.5 bg-gray-500" style={{ borderTop: '2px dashed #64748b' }} />
                            <span className="text-gray-400">Atual</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-4 h-0.5 bg-primary rounded" />
                            <span className="text-gray-400">Simulado</span>
                        </div>
                    </div>
                </div>

                {/* Impact Card */}
                <div className={`rounded-xl p-4 border ${projection.finalDiff >= 0
                    ? 'bg-accent-green/5 border-accent-green/20'
                    : 'bg-accent-red/5 border-accent-red/20'
                    }`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-400 mb-1">Impacto em {scenario.months} meses</p>
                            <p className={`text-2xl font-bold number-font ${projection.finalDiff >= 0 ? 'text-accent-green' : 'text-accent-red'
                                }`}>
                                {projection.finalDiff >= 0 ? '+' : ''}{formatCurrency(projection.finalDiff)}
                            </p>
                        </div>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${projection.finalDiff >= 0 ? 'bg-accent-green/10' : 'bg-accent-red/10'
                            }`}>
                            <BarChart3 className={`w-6 h-6 ${projection.finalDiff >= 0 ? 'text-accent-green' : 'text-accent-red'}`} />
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                        Patrimônio projetado: <span className="font-bold text-white number-font">
                            {formatCurrency(projection.simulatedData[projection.simulatedData.length - 1])}
                        </span>
                    </p>
                </div>

                {/* AI Insight Module */}
                <div className="rounded-xl p-4 bg-gradient-to-br from-primary/10 to-accent-purple/10 border border-primary/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16" />

                    <div className="flex items-start gap-3 relative z-10">
                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                            <Sparkles className="w-4 h-4 text-primary-lighter animate-pulse" />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-xs font-bold text-white tracking-wider uppercase mb-1 flex items-center gap-2">
                                Insight Analítico
                                <span className="px-1.5 py-0.5 bg-primary/20 text-primary-lighter text-[9px] rounded font-mono">IA</span>
                            </h4>
                            <p className="text-sm text-gray-300 leading-relaxed">
                                {projection.finalDiff > 0
                                    ? `Este cenário é positivo! Ao longo de ${scenario.months} meses, as mudanças propostas geram um ganho adicional de ${formatCurrency(projection.finalDiff)}. Isso demonstra que a estratégia (${scenario.revenueChange > 0 ? '+ Receita' : ''} ${scenario.expenseChange < 0 ? '- Despesas' : ''}) combinada com o retorno de ${scenario.investmentReturn}% a.a. acelera significativamente seu crescimento patrimonial.`
                                    : projection.finalDiff < 0
                                        ? `Atenção: Este cenário projeta uma perda de ${formatCurrency(Math.abs(projection.finalDiff))} em relação à sua trajetória atual ao longo de ${scenario.months} meses. Essa combinação de fatores pode comprometer seus objetivos de longo prazo.`
                                        : `Este cenário empata com a sua trajetória atual nos próximos ${scenario.months} meses, resultando em nenhuma variação significativa no seu patrimônio final estimado.`
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
