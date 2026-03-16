'use client'

import { useState, useEffect, useMemo } from 'react'
import { Trophy, Star, Flame, Target, TrendingUp, Zap, Award, Shield, Crown, Sparkles } from 'lucide-react'
import { getTransactions, getAssets, getFinancialGoals, Transaction, Asset, FinancialGoal } from '@/lib/supabase'
import { motion } from 'framer-motion'

interface Achievement {
    id: string
    title: string
    description: string
    icon: React.ElementType
    color: string
    bgColor: string
    condition: (data: AchievementData) => boolean
    progress?: (data: AchievementData) => number // 0-100
}

interface AchievementData {
    transactions: Transaction[]
    assets: Asset[]
    goals: FinancialGoal[]
    totalIncome: number
    totalExpense: number
    daysWithTransactions: number
    streakDays: number
}

const ACHIEVEMENTS: Achievement[] = [
    {
        id: 'first_tx', title: 'Primeira Transação', description: 'Registre sua primeira transação',
        icon: Zap, color: 'text-blue-400', bgColor: 'from-blue-500/20 to-blue-600/20',
        condition: (d) => d.transactions.length >= 1,
        progress: (d) => Math.min(d.transactions.length, 1) * 100,
    },
    {
        id: 'tx_10', title: 'Organizador', description: 'Registre 10 transações',
        icon: Star, color: 'text-yellow-400', bgColor: 'from-yellow-500/20 to-yellow-600/20',
        condition: (d) => d.transactions.length >= 10,
        progress: (d) => Math.min(d.transactions.length / 10, 1) * 100,
    },
    {
        id: 'tx_50', title: 'Disciplinado', description: 'Registre 50 transações',
        icon: Shield, color: 'text-purple-400', bgColor: 'from-purple-500/20 to-purple-600/20',
        condition: (d) => d.transactions.length >= 50,
        progress: (d) => Math.min(d.transactions.length / 50, 1) * 100,
    },
    {
        id: 'tx_100', title: 'Mestre Financeiro', description: 'Registre 100 transações',
        icon: Crown, color: 'text-amber-400', bgColor: 'from-amber-500/20 to-amber-600/20',
        condition: (d) => d.transactions.length >= 100,
        progress: (d) => Math.min(d.transactions.length / 100, 1) * 100,
    },
    {
        id: 'investor', title: 'Investidor', description: 'Adicione seu primeiro ativo',
        icon: TrendingUp, color: 'text-green-400', bgColor: 'from-green-500/20 to-green-600/20',
        condition: (d) => d.assets.length >= 1,
        progress: (d) => Math.min(d.assets.length, 1) * 100,
    },
    {
        id: 'diversified', title: 'Diversificado', description: 'Tenha 5+ ativos diferentes',
        icon: Award, color: 'text-cyan-400', bgColor: 'from-cyan-500/20 to-cyan-600/20',
        condition: (d) => d.assets.length >= 5,
        progress: (d) => Math.min(d.assets.length / 5, 1) * 100,
    },
    {
        id: 'goal_setter', title: 'Planejador', description: 'Crie sua primeira meta financeira',
        icon: Target, color: 'text-pink-400', bgColor: 'from-pink-500/20 to-pink-600/20',
        condition: (d) => d.goals.length >= 1,
        progress: (d) => Math.min(d.goals.length, 1) * 100,
    },
    {
        id: 'saver', title: 'Poupador', description: 'Tenha saldo positivo (receitas > despesas)',
        icon: Flame, color: 'text-orange-400', bgColor: 'from-orange-500/20 to-orange-600/20',
        condition: (d) => d.totalIncome > d.totalExpense && d.totalIncome > 0,
        progress: (d) => d.totalIncome > 0 ? Math.min((d.totalIncome - d.totalExpense) / d.totalIncome, 1) * 100 : 0,
    },
    {
        id: 'streak_7', title: 'Constância Semanal', description: 'Registre transações em 7 dias diferentes',
        icon: Sparkles, color: 'text-indigo-400', bgColor: 'from-indigo-500/20 to-indigo-600/20',
        condition: (d) => d.daysWithTransactions >= 7,
        progress: (d) => Math.min(d.daysWithTransactions / 7, 1) * 100,
    },
]

export default function Achievements() {
    const [data, setData] = useState<AchievementData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const [transactions, assets, goals] = await Promise.all([
                getTransactions(), getAssets(), getFinancialGoals()
            ])

            const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
            const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount), 0)

            // Count unique days with transactions
            const uniqueDays = new Set(transactions.map(t => t.created_at.split('T')[0]))

            setData({
                transactions, assets, goals,
                totalIncome, totalExpense,
                daysWithTransactions: uniqueDays.size,
                streakDays: 0,
            })
        } catch (err) {
            console.error('Erro ao carregar conquistas:', err)
        } finally {
            setLoading(false)
        }
    }

    const { unlocked, locked, xp, level } = useMemo(() => {
        if (!data) return { unlocked: [], locked: [], xp: 0, level: 1 }
        const u = ACHIEVEMENTS.filter(a => a.condition(data))
        const l = ACHIEVEMENTS.filter(a => !a.condition(data))
        const xp = u.length * 100
        const level = Math.floor(xp / 250) + 1
        return { unlocked: u, locked: l, xp, level }
    }, [data])

    const xpForNextLevel = 250
    const xpInCurrentLevel = xp % xpForNextLevel
    const xpProgress = (xpInCurrentLevel / xpForNextLevel) * 100

    if (loading) {
        return <div className="card-premium loading-shimmer h-[200px]" />
    }

    return (
        <div className="card-premium overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-white/[0.04]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-yellow/20 to-accent-orange/20 flex items-center justify-center border border-accent-yellow/10">
                            <Trophy className="w-4 h-4 text-accent-yellow" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-white">Conquistas</h3>
                            <p className="text-xs text-gray-500">{unlocked.length}/{ACHIEVEMENTS.length} desbloqueadas</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center gap-1 text-accent-yellow">
                            <Crown className="w-4 h-4" />
                            <span className="text-sm font-bold">Nível {level}</span>
                        </div>
                        <p className="text-[10px] text-gray-500">{xp} XP total</p>
                    </div>
                </div>

                {/* XP Progress Bar */}
                <div className="mt-3">
                    <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                        <span>Nível {level}</span>
                        <span>Nível {level + 1}</span>
                    </div>
                    <div className="h-2 bg-dark-bg rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${xpProgress}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className="h-full rounded-full bg-gradient-to-r from-accent-yellow to-accent-orange"
                        />
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1 text-center">{xpInCurrentLevel}/{xpForNextLevel} XP</p>
                </div>
            </div>

            <div className="p-4 sm:p-5">
                {/* Unlocked */}
                {unlocked.length > 0 && (
                    <div className="mb-4">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-2">🏆 Desbloqueadas</p>
                        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                            {unlocked.map((ach, i) => (
                                <motion.div
                                    key={ach.id}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="flex flex-col items-center p-2 rounded-xl bg-white/[0.04] border border-white/[0.06] group hover:border-accent-yellow/30 transition-all cursor-default"
                                    title={ach.description}
                                >
                                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${ach.bgColor} flex items-center justify-center mb-1`}>
                                        <ach.icon className={`w-4 h-4 ${ach.color}`} />
                                    </div>
                                    <p className="text-[9px] text-gray-300 font-medium text-center leading-tight">{ach.title}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Locked */}
                {locked.length > 0 && (
                    <div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-2">🔒 Para desbloquear</p>
                        <div className="space-y-2">
                            {locked.slice(0, 3).map((ach) => {
                                const progress = ach.progress ? ach.progress(data!) : 0
                                return (
                                    <div key={ach.id} className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.02]">
                                        <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center opacity-40">
                                            <ach.icon className="w-4 h-4 text-gray-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-gray-400 font-medium">{ach.title}</p>
                                            <p className="text-[10px] text-gray-600">{ach.description}</p>
                                            <div className="h-1 bg-dark-bg rounded-full overflow-hidden mt-1">
                                                <div
                                                    className="h-full rounded-full bg-gradient-to-r from-gray-600 to-gray-500 transition-all duration-500"
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-gray-600 font-mono shrink-0">{Math.round(progress)}%</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
