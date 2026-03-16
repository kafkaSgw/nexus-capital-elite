'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
    Timer, Target, Car, Home, Plane, GraduationCap, Shield,
    DollarSign, TrendingUp, Sparkles, ChevronRight
} from 'lucide-react'
import { getTransactions, getAssets, Transaction, Asset, getFinancialGoals, FinancialGoal } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'

export default function TimeToGoalCalculator() {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [assets, setAssets] = useState<Asset[]>([])
    const [userGoals, setUserGoals] = useState<FinancialGoal[]>([])
    const [loading, setLoading] = useState(true)
    const [goalAmount, setGoalAmount] = useState<number>(100000)
    const [customInput, setCustomInput] = useState('100000')
    const [extraMonthly, setExtraMonthly] = useState(0)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const [tx, ast, goals] = await Promise.all([getTransactions(), getAssets(), getFinancialGoals()])
            setTransactions(tx)
            setAssets(ast)
            setUserGoals(goals)
            if (goals.length > 0) {
                setGoalAmount(goals[0].target_amount)
                setCustomInput(goals[0].target_amount.toString())
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const selectPreset = (amount: number) => {
        setGoalAmount(amount)
        setCustomInput(amount.toString())
    }

    const handleCustomChange = (val: string) => {
        setCustomInput(val)
        const num = parseFloat(val)
        if (!isNaN(num) && num > 0) {
            setGoalAmount(num)
        }
    }

    const result = useMemo(() => {
        const now = new Date()
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000)
        const recent = transactions.filter(t => new Date(t.created_at) >= thirtyDaysAgo)

        const monthlyIncome = recent.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0) || 5000
        const monthlyExpense = recent.filter(t => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount), 0) || 3000
        const monthlySaving = monthlyIncome - monthlyExpense + extraMonthly

        const totalAssets = assets.reduce((s, a) => s + a.preco_atual * a.quantidade, 0)
        const totalBalance = transactions.reduce((s, t) => s + (t.type === 'income' ? t.amount : -Math.abs(t.amount)), 0)
        const currentWealth = totalBalance + totalAssets

        const remaining = goalAmount - currentWealth
        const progress = Math.min(Math.max((currentWealth / goalAmount) * 100, 0), 100)

        if (remaining <= 0) {
            return { months: 0, years: 0, date: 'Já alcançado! 🎉', progress: 100, remaining: 0, monthlySaving, currentWealth, tip: null, tipMonths: 0 }
        }

        if (monthlySaving <= 0) {
            return { months: Infinity, years: Infinity, date: 'Economia mensal insuficiente', progress, remaining, monthlySaving, currentWealth, tip: null, tipMonths: 0 }
        }

        // FV = PV*(1+r)^n + PMT*((1+r)^n - 1)/r
        // Solving for n iteratively
        const monthlyRate = 0.01 // ~1% a.m. estimated return
        let balance = currentWealth
        let months = 0
        const maxMonths = 600 // 50 years cap

        while (balance < goalAmount && months < maxMonths) {
            balance = balance * (1 + monthlyRate) + monthlySaving
            months++
        }

        if (months >= maxMonths) {
            return { months: Infinity, years: Infinity, date: 'Mais de 50 anos', progress, remaining, monthlySaving, currentWealth, tip: null, tipMonths: 0 }
        }

        const years = Math.floor(months / 12)
        const remainingMonths = months % 12

        const targetDate = new Date(now)
        targetDate.setMonth(targetDate.getMonth() + months)
        const dateStr = targetDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

        // Calculate with extra R$500/month
        const extraTip = 500
        let tipBalance = currentWealth
        let tipMonths = 0
        while (tipBalance < goalAmount && tipMonths < maxMonths) {
            tipBalance = tipBalance * (1 + monthlyRate) + monthlySaving + extraTip
            tipMonths++
        }

        const savedMonths = months - tipMonths

        return {
            months, years, remainingMonths, date: dateStr, progress, remaining,
            monthlySaving, currentWealth,
            tip: savedMonths > 0 ? `Investindo +R$${extraTip}/mês, alcança ${savedMonths} meses antes!` : null,
            tipMonths: savedMonths
        }
    }, [transactions, assets, goalAmount, extraMonthly])

    // Circular progress
    const circumference = 2 * Math.PI * 52
    const strokeOffset = circumference - (result.progress / 100) * circumference

    if (loading) {
        return <div className="card-premium p-6 loading-shimmer h-[400px]" />
    }

    return (
        <div className="card-premium">
            {/* Header */}
            <div className="p-6 border-b border-white/[0.04]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl flex items-center justify-center border border-amber-500/20">
                        <Timer className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Quanto Tempo Para...?</h3>
                        <p className="text-sm text-gray-400">Calcule o tempo para atingir sua meta</p>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-5">
                {/* User Goals */}
                {userGoals.length > 0 && (
                    <div>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-3">Suas Metas</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {userGoals.map(goal => {
                                const isActive = goalAmount === goal.target_amount
                                return (
                                    <button
                                        key={goal.id}
                                        onClick={() => selectPreset(goal.target_amount)}
                                        className={`flex items-center gap-2 p-2.5 rounded-xl text-left transition-all text-xs ${isActive
                                            ? 'bg-amber-500/10 border border-amber-500/30 text-amber-300'
                                            : 'bg-white/[0.02] border border-white/[0.06] text-gray-400 hover:border-white/[0.12] hover:text-gray-300'
                                            }`}
                                    >
                                        <Target className="w-3.5 h-3.5 shrink-0" />
                                        <span className="truncate font-medium">{goal.title}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Custom Input */}
                <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2">Valor da Meta</p>
                    <div className="relative">
                        <DollarSign className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="number"
                            value={customInput}
                            onChange={e => handleCustomChange(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-white font-bold number-font focus:outline-none focus:border-amber-500/50 transition-colors"
                            placeholder="100000"
                        />
                    </div>
                </div>

                {/* Extra Monthly Slider */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Aporte Extra Mensal</p>
                        <span className="text-xs font-bold text-amber-400 number-font">
                            +{formatCurrency(extraMonthly)}
                        </span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="5000"
                        step="100"
                        value={extraMonthly}
                        onChange={e => setExtraMonthly(Number(e.target.value))}
                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                    <div className="flex justify-between text-[10px] text-gray-600 mt-1">
                        <span>R$0</span>
                        <span>R$5.000</span>
                    </div>
                </div>

                {/* Result Display */}
                <div className="flex items-center gap-6 p-5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    {/* Circular Progress */}
                    <div className="relative shrink-0">
                        <svg width="120" height="120" viewBox="0 0 120 120" className="-rotate-90">
                            <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" />
                            <motion.circle
                                cx="60" cy="60" r="52"
                                fill="none"
                                stroke="url(#progress-grad)"
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                initial={{ strokeDashoffset: circumference }}
                                animate={{ strokeDashoffset: strokeOffset }}
                                transition={{ duration: 1.5, ease: 'easeOut' }}
                            />
                            <defs>
                                <linearGradient id="progress-grad" x1="0" y1="0" x2="1" y2="1">
                                    <stop offset="0%" stopColor="#F59E0B" />
                                    <stop offset="100%" stopColor="#EF4444" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
                            <span className="text-xl font-black text-white number-font">{result.progress.toFixed(0)}%</span>
                            <span className="text-[10px] text-gray-500">concluído</span>
                        </div>
                    </div>

                    {/* Result Info */}
                    <div className="flex-1 min-w-0">
                        {result.months === 0 ? (
                            <div>
                                <p className="text-2xl font-black text-emerald-400">🎉 Meta Alcançada!</p>
                                <p className="text-sm text-gray-400 mt-1">Parabéns! Você já atingiu essa meta!</p>
                            </div>
                        ) : result.months === Infinity ? (
                            <div>
                                <p className="text-lg font-bold text-gray-400">⚠️ {result.date}</p>
                                <p className="text-xs text-gray-500 mt-1">Tente aumentar sua economia mensal</p>
                            </div>
                        ) : (
                            <div>
                                <div className="flex items-baseline gap-2 mb-1">
                                    <span className="text-3xl font-black text-white number-font">{result.years > 0 ? `${result.years}a` : ''}</span>
                                    {(result.remainingMonths ?? 0) > 0 && (
                                        <span className="text-xl font-bold text-gray-400 number-font">{result.remainingMonths}m</span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-400">
                                    Estimativa: <span className="text-white font-medium capitalize">{result.date}</span>
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Faltam {formatCurrency(result.remaining)} • Economizando {formatCurrency(result.monthlySaving)}/mês
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tip */}
                {result.tip && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/15"
                    >
                        <TrendingUp className="w-4 h-4 text-amber-400 shrink-0" />
                        <p className="text-xs text-amber-300">{result.tip}</p>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
