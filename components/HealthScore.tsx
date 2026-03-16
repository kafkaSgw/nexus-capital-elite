'use client'

import { useState, useEffect } from 'react'
import { Activity, TrendingUp, TrendingDown, Shield, PieChart, ArrowUpRight, ArrowDownRight, AlertTriangle, CheckCircle } from 'lucide-react'
import { getTransactions, getAssets, Transaction, Asset } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'

interface ScoreMetric {
    name: string
    score: number
    maxScore: number
    status: 'excellent' | 'good' | 'warning' | 'critical'
    description: string
    icon: any
}

export default function HealthScore() {
    const [totalScore, setTotalScore] = useState(0)
    const [metrics, setMetrics] = useState<ScoreMetric[]>([])
    const [loading, setLoading] = useState(true)
    const [animatedScore, setAnimatedScore] = useState(0)

    useEffect(() => {
        loadScore()
    }, [])

    // Animate score
    useEffect(() => {
        if (totalScore === 0) return
        let current = 0
        const step = totalScore / 60
        const timer = setInterval(() => {
            current += step
            if (current >= totalScore) {
                setAnimatedScore(totalScore)
                clearInterval(timer)
            } else {
                setAnimatedScore(Math.round(current))
            }
        }, 16)
        return () => clearInterval(timer)
    }, [totalScore])

    const loadScore = async () => {
        try {
            const [transactions, assets] = await Promise.all([getTransactions(), getAssets()])
            calculateScore(transactions, assets)
        } catch (err) {
            console.error('Erro ao calcular score:', err)
        } finally {
            setLoading(false)
        }
    }

    const calculateScore = (transactions: Transaction[], assets: Asset[]) => {
        const now = new Date()
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

        const recentTx = transactions.filter(t => new Date(t.created_at) >= thirtyDaysAgo)
        const prevTx = transactions.filter(t => {
            const d = new Date(t.created_at)
            return d >= sixtyDaysAgo && d < thirtyDaysAgo
        })

        const recentIncome = recentTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
        const recentExpense = recentTx.filter(t => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount), 0)
        const prevIncome = prevTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
        const prevExpense = prevTx.filter(t => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount), 0)

        const calculatedMetrics: ScoreMetric[] = []

        // 1. Relação Receita/Despesa (0-25)
        const ratio = recentExpense > 0 ? recentIncome / recentExpense : (recentIncome > 0 ? 5 : 1)
        let ratioScore = 0
        if (ratio >= 2) ratioScore = 25
        else if (ratio >= 1.5) ratioScore = 20
        else if (ratio >= 1.2) ratioScore = 15
        else if (ratio >= 1) ratioScore = 10
        else ratioScore = Math.round(ratio * 8)

        calculatedMetrics.push({
            name: 'Receita vs Despesa',
            score: ratioScore,
            maxScore: 25,
            status: ratioScore >= 20 ? 'excellent' : ratioScore >= 15 ? 'good' : ratioScore >= 10 ? 'warning' : 'critical',
            description: `Proporção ${ratio.toFixed(1)}x — ${ratio >= 1.5 ? 'saudável' : ratio >= 1 ? 'equilibrado' : 'déficit'}`,
            icon: TrendingUp
        })

        // 2. Tendência de Crescimento (0-25)
        const incomeGrowth = prevIncome > 0 ? ((recentIncome - prevIncome) / prevIncome) * 100 : 0
        let growthScore = 0
        if (incomeGrowth >= 20) growthScore = 25
        else if (incomeGrowth >= 10) growthScore = 20
        else if (incomeGrowth >= 0) growthScore = 15
        else if (incomeGrowth >= -10) growthScore = 10
        else growthScore = 5

        calculatedMetrics.push({
            name: 'Tendência de Crescimento',
            score: growthScore,
            maxScore: 25,
            status: growthScore >= 20 ? 'excellent' : growthScore >= 15 ? 'good' : growthScore >= 10 ? 'warning' : 'critical',
            description: `${incomeGrowth >= 0 ? '+' : ''}${incomeGrowth.toFixed(1)}% vs mês anterior`,
            icon: incomeGrowth >= 0 ? ArrowUpRight : ArrowDownRight
        })

        // 3. Diversificação (0-25)
        const categories = [...new Set(recentTx.filter(t => t.type === 'income').map(t => t.category))]
        const assetClasses = [...new Set(assets.map(a => a.classe))]
        const diversityItems = categories.length + assetClasses.length + assets.length

        let diversityScore = 0
        if (diversityItems >= 10) diversityScore = 25
        else if (diversityItems >= 6) diversityScore = 20
        else if (diversityItems >= 3) diversityScore = 15
        else if (diversityItems >= 1) diversityScore = 10
        else diversityScore = 5

        calculatedMetrics.push({
            name: 'Diversificação',
            score: diversityScore,
            maxScore: 25,
            status: diversityScore >= 20 ? 'excellent' : diversityScore >= 15 ? 'good' : diversityScore >= 10 ? 'warning' : 'critical',
            description: `${categories.length} fontes de receita, ${assets.length} ativos`,
            icon: PieChart
        })

        // 4. Proteção Patrimonial (0-25)
        const totalAssetValue = assets.reduce((s, a) => s + a.preco_atual * a.quantidade, 0)
        const monthlyExpenseAvg = recentExpense || 1
        const protectionMonths = totalAssetValue / monthlyExpenseAvg

        let protectionScore = 0
        if (protectionMonths >= 12) protectionScore = 25
        else if (protectionMonths >= 6) protectionScore = 20
        else if (protectionMonths >= 3) protectionScore = 15
        else if (protectionMonths >= 1) protectionScore = 10
        else protectionScore = 5

        calculatedMetrics.push({
            name: 'Proteção Patrimonial',
            score: protectionScore,
            maxScore: 25,
            status: protectionScore >= 20 ? 'excellent' : protectionScore >= 15 ? 'good' : protectionScore >= 10 ? 'warning' : 'critical',
            description: `${protectionMonths.toFixed(1)} meses de reserva`,
            icon: Shield
        })

        const total = calculatedMetrics.reduce((s, m) => s + m.score, 0)
        setMetrics(calculatedMetrics)
        setTotalScore(total)
    }

    const getScoreColor = (score: number) => {
        if (score >= 80) return '#10B981'
        if (score >= 60) return '#2563EB'
        if (score >= 40) return '#F59E0B'
        return '#EF4444'
    }

    const getScoreLabel = (score: number) => {
        if (score >= 80) return 'Excelente'
        if (score >= 60) return 'Bom'
        if (score >= 40) return 'Atenção'
        return 'Crítico'
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'excellent': return 'text-accent-green'
            case 'good': return 'text-primary'
            case 'warning': return 'text-accent-yellow'
            case 'critical': return 'text-accent-red'
            default: return 'text-gray-400'
        }
    }

    const getStatusBg = (status: string) => {
        switch (status) {
            case 'excellent': return 'bg-accent-green/10'
            case 'good': return 'bg-primary/10'
            case 'warning': return 'bg-accent-yellow/10'
            case 'critical': return 'bg-accent-red/10'
            default: return 'bg-gray-500/10'
        }
    }

    // SVG gauge
    const radius = 70
    const circumference = 2 * Math.PI * radius
    const dashOffset = circumference - (animatedScore / 100) * circumference
    const scoreColor = getScoreColor(animatedScore)

    if (loading) {
        return (
            <div className="card-premium p-6 animate-pulse">
                <div className="h-6 bg-dark-hover rounded w-48 mb-4" />
                <div className="flex justify-center py-8">
                    <div className="w-44 h-44 bg-dark-hover rounded-full" />
                </div>
            </div>
        )
    }

    return (
        <div className="card-premium">
            <div className="p-6 border-b border-dark-border">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-accent-green to-primary rounded-xl flex items-center justify-center">
                        <Activity className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Saúde Financeira</h3>
                        <p className="text-sm text-gray-400">Score geral do seu portfólio</p>
                    </div>
                </div>
            </div>

            <div className="p-6">
                {/* Gauge */}
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <svg width="180" height="180" viewBox="0 0 180 180">
                            {/* Background circle */}
                            <circle cx="90" cy="90" r={radius} fill="none" stroke="#1e293b" strokeWidth="10" />
                            {/* Score arc */}
                            <circle
                                cx="90" cy="90" r={radius} fill="none"
                                stroke={scoreColor}
                                strokeWidth="10"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={dashOffset}
                                transform="rotate(-90 90 90)"
                                style={{ transition: 'stroke-dashoffset 1s ease-out, stroke 0.5s ease' }}
                            />
                            {/* Glow */}
                            <circle
                                cx="90" cy="90" r={radius} fill="none"
                                stroke={scoreColor}
                                strokeWidth="10"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={dashOffset}
                                transform="rotate(-90 90 90)"
                                opacity="0.3"
                                filter="blur(6px)"
                                style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-bold text-white number-font">{animatedScore}</span>
                            <span className="text-sm font-medium" style={{ color: scoreColor }}>
                                {getScoreLabel(animatedScore)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Metrics */}
                <div className="space-y-3">
                    {metrics.map((metric) => {
                        const Icon = metric.icon
                        const pct = (metric.score / metric.maxScore) * 100
                        return (
                            <div key={metric.name} className="bg-dark-card rounded-xl p-3">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-7 h-7 rounded-lg ${getStatusBg(metric.status)} flex items-center justify-center`}>
                                            <Icon className={`w-3.5 h-3.5 ${getStatusColor(metric.status)}`} />
                                        </div>
                                        <span className="text-sm font-medium text-white">{metric.name}</span>
                                    </div>
                                    <span className={`text-sm font-bold number-font ${getStatusColor(metric.status)}`}>
                                        {metric.score}/{metric.maxScore}
                                    </span>
                                </div>
                                <div className="h-1.5 bg-dark-bg rounded-full overflow-hidden mb-1.5">
                                    <div
                                        className="h-full rounded-full transition-all duration-1000"
                                        style={{ width: `${pct}%`, backgroundColor: getScoreColor(pct) }}
                                    />
                                </div>
                                <p className="text-xs text-gray-400">{metric.description}</p>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
