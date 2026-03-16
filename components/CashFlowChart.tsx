'use client'

import { useState, useEffect, useMemo } from 'react'
import {
    TrendingUp, TrendingDown, Calendar, ArrowUpRight,
    ArrowDownRight, Activity, Eye
} from 'lucide-react'
import {
    AreaChart, Area, XAxis, YAxis, Tooltip,
    ResponsiveContainer, ReferenceLine, CartesianGrid
} from 'recharts'
import { getScheduledTransactions, getTransactions, ScheduledTransaction, Transaction } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'

const PERIODS = [
    { label: '30 dias', days: 30 },
    { label: '60 dias', days: 60 },
    { label: '90 dias', days: 90 },
]

interface CashFlowChartProps {
    currentBalance: number
}

export default function CashFlowChart({ currentBalance }: CashFlowChartProps) {
    const [scheduled, setScheduled] = useState<ScheduledTransaction[]>([])
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [period, setPeriod] = useState(30)
    const [loading, setLoading] = useState(true)
    const [showDetails, setShowDetails] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const [sch, txs] = await Promise.all([
                getScheduledTransactions(),
                getTransactions()
            ])
            setScheduled(sch)
            setTransactions(txs)
        } catch (err) {
            console.error('Erro ao carregar projeção:', err)
        } finally {
            setLoading(false)
        }
    }

    // Calculate average daily spending from last 30 days
    const avgDailySpending = useMemo(() => {
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const recentExpenses = transactions
            .filter(t => t.type === 'expense' && new Date(t.created_at) >= thirtyDaysAgo)
            .reduce((sum, t) => sum + Math.abs(t.amount), 0)

        return recentExpenses / 30
    }, [transactions])

    // Calculate average daily income from last 30 days (non-recurring)
    const avgDailyIncome = useMemo(() => {
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const recentIncome = transactions
            .filter(t => t.type === 'income' && new Date(t.created_at) >= thirtyDaysAgo)
            .reduce((sum, t) => sum + t.amount, 0)

        return recentIncome / 30
    }, [transactions])

    // Generate projection data
    const projectionData = useMemo(() => {
        const data = []
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        let balance = currentBalance
        let optimistic = currentBalance
        let pessimistic = currentBalance

        // Get recurring transactions that are unpaid
        const recurringItems = scheduled.filter(s => s.is_recurring && !s.is_paid)

        for (let i = 0; i <= period; i++) {
            const date = new Date(today)
            date.setDate(date.getDate() + i)
            const dateStr = date.toISOString().split('T')[0]
            const dayOfMonth = date.getDate()

            let dayIncome = 0
            let dayExpense = 0

            // Check recurring transactions for this day
            recurringItems.forEach(item => {
                const dueDay = new Date(item.due_date + 'T12:00:00').getDate()

                let matches = false
                if (item.recurrence_type === 'monthly' && dayOfMonth === dueDay) {
                    matches = true
                } else if (item.recurrence_type === 'weekly') {
                    const dueDate = new Date(item.due_date + 'T12:00:00')
                    const diffDays = Math.floor((date.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
                    if (diffDays >= 0 && diffDays % 7 === 0) matches = true
                }

                if (matches) {
                    if (item.type === 'income') dayIncome += Math.abs(item.amount)
                    else dayExpense += Math.abs(item.amount)
                }
            })

            // Add average daily spending/income for non-scheduled days
            if (i > 0) {
                const dailyNet = avgDailyIncome - avgDailySpending
                balance += dailyNet + dayIncome - dayExpense
                optimistic += (avgDailyIncome * 1.15 - avgDailySpending * 0.85) + dayIncome - dayExpense
                pessimistic += (avgDailyIncome * 0.85 - avgDailySpending * 1.15) + dayIncome - dayExpense
            }

            data.push({
                date: dateStr,
                label: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                balance: Math.round(balance * 100) / 100,
                optimistic: Math.round(optimistic * 100) / 100,
                pessimistic: Math.round(pessimistic * 100) / 100,
                dayIncome,
                dayExpense,
                hasEvent: dayIncome > 0 || dayExpense > 0
            })
        }

        return data
    }, [currentBalance, scheduled, period, avgDailySpending, avgDailyIncome])

    // Key metrics
    const endBalance = projectionData[projectionData.length - 1]?.balance || currentBalance
    const endOptimistic = projectionData[projectionData.length - 1]?.optimistic || currentBalance
    const endPessimistic = projectionData[projectionData.length - 1]?.pessimistic || currentBalance
    const balanceChange = endBalance - currentBalance
    const isPositive = balanceChange >= 0

    // Find lowest projected balance
    const lowestBalance = Math.min(...projectionData.map(d => d.pessimistic))
    const lowestDate = projectionData.find(d => d.pessimistic === lowestBalance)

    // Upcoming events
    const upcomingEvents = projectionData
        .filter(d => d.hasEvent)
        .slice(0, 5)

    if (loading) {
        return <div className="card-premium h-[400px] loading-shimmer" />
    }

    return (
        <div className="card-premium">
            <div className="p-5 border-b border-white/[0.04]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-cyan/20 to-primary/20 flex items-center justify-center border border-accent-cyan/10">
                            <Activity className="w-4 h-4 text-accent-cyan" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-white">Fluxo de Caixa Projetado</h3>
                            <p className="text-xs text-gray-500">Previsão baseada em recorrências e histórico</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {PERIODS.map(p => (
                            <button key={p.days} onClick={() => setPeriod(p.days)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${period === p.days
                                    ? 'bg-primary/20 text-primary border border-primary/30'
                                    : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'}`}>
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-5">
                {/* KPI Row */}
                <div className="grid grid-cols-4 gap-3 mb-5">
                    <div className="p-3 rounded-xl bg-white/[0.02]">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">Saldo Atual</p>
                        <p className="text-sm font-bold text-white number-font mt-1">{formatCurrency(currentBalance)}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.02]">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">Projeção ({period}d)</p>
                        <p className={`text-sm font-bold number-font mt-1 ${endBalance >= currentBalance ? 'text-accent-green' : 'text-accent-red'}`}>
                            {formatCurrency(endBalance)}
                        </p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.02]">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">Cenário Otimista</p>
                        <p className="text-sm font-bold text-accent-green number-font mt-1">{formatCurrency(endOptimistic)}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.02]">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">Cenário Pessimista</p>
                        <p className={`text-sm font-bold number-font mt-1 ${endPessimistic >= 0 ? 'text-accent-yellow' : 'text-accent-red'}`}>
                            {formatCurrency(endPessimistic)}
                        </p>
                    </div>
                </div>

                {/* Variation Badge */}
                <div className="flex items-center gap-3 mb-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${isPositive
                        ? 'bg-accent-green/10 text-accent-green border border-accent-green/20'
                        : 'bg-accent-red/10 text-accent-red border border-accent-red/20'}`}>
                        {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {isPositive ? '+' : ''}{formatCurrency(balanceChange)} em {period} dias
                    </span>
                    {lowestBalance < 0 && (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-accent-red/10 text-accent-red border border-accent-red/20">
                            ⚠️ Risco de saldo negativo em {lowestDate?.label}
                        </span>
                    )}
                </div>

                {/* Chart */}
                <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={projectionData}>
                            <defs>
                                <linearGradient id="cashFlowGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={isPositive ? '#10B981' : '#EF4444'} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={isPositive ? '#10B981' : '#EF4444'} stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="optimisticGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.08} />
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="pessimisticGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.08} />
                                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                            <XAxis
                                dataKey="label"
                                tick={{ fontSize: 10, fill: '#6B7280' }}
                                axisLine={false}
                                tickLine={false}
                                interval={Math.floor(period / 6)}
                            />
                            <YAxis
                                hide
                                domain={['dataMin - 1000', 'dataMax + 1000']}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#111827',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px',
                                    fontSize: '12px',
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
                                }}
                                formatter={(value: any, name: any) => {
                                    const labels: Record<string, string> = {
                                        balance: 'Projeção',
                                        optimistic: 'Otimista',
                                        pessimistic: 'Pessimista'
                                    }
                                    return [formatCurrency(Number(value)), labels[name] || name]
                                }}
                                labelFormatter={(label) => `Data: ${label}`}
                                labelStyle={{ color: '#9CA3AF' }}
                            />
                            <ReferenceLine
                                y={0}
                                stroke="rgba(239, 68, 68, 0.3)"
                                strokeDasharray="5 5"
                                label={{ value: 'R$ 0', position: 'left', fill: '#EF4444', fontSize: 10 }}
                            />
                            {/* Pessimistic band */}
                            <Area
                                type="monotone"
                                dataKey="pessimistic"
                                stroke="#EF4444"
                                strokeWidth={1}
                                strokeDasharray="4 4"
                                fill="url(#pessimisticGradient)"
                                strokeOpacity={0.4}
                            />
                            {/* Optimistic band */}
                            <Area
                                type="monotone"
                                dataKey="optimistic"
                                stroke="#10B981"
                                strokeWidth={1}
                                strokeDasharray="4 4"
                                fill="url(#optimisticGradient)"
                                strokeOpacity={0.4}
                            />
                            {/* Main projection line */}
                            <Area
                                type="monotone"
                                dataKey="balance"
                                stroke={isPositive ? '#10B981' : '#EF4444'}
                                strokeWidth={2.5}
                                fill="url(#cashFlowGradient)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-6 mt-3">
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-0.5 bg-accent-green rounded" style={{ boxShadow: '0 0 4px #10B981' }} />
                        <span className="text-[10px] text-gray-500">Projeção</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-0.5 bg-accent-green/40 rounded border-dashed" />
                        <span className="text-[10px] text-gray-500">Otimista</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-0.5 bg-accent-red/40 rounded" />
                        <span className="text-[10px] text-gray-500">Pessimista</span>
                    </div>
                </div>

                {/* Upcoming scheduled events */}
                {upcomingEvents.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/[0.04]">
                        <button
                            onClick={() => setShowDetails(!showDetails)}
                            className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors mb-3"
                        >
                            <Eye className="w-3.5 h-3.5" />
                            {showDetails ? 'Ocultar' : 'Ver'} próximos eventos ({upcomingEvents.length})
                        </button>

                        {showDetails && (
                            <div className="space-y-1.5 animate-fade-in">
                                {upcomingEvents.map((event, i) => (
                                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02]">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-3.5 h-3.5 text-gray-500" />
                                            <span className="text-xs text-gray-300">{event.label}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {event.dayIncome > 0 && (
                                                <span className="text-xs text-accent-green number-font">+{formatCurrency(event.dayIncome)}</span>
                                            )}
                                            {event.dayExpense > 0 && (
                                                <span className="text-xs text-accent-red number-font">-{formatCurrency(event.dayExpense)}</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Daily spending info */}
                <div className="mt-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Gasto médio diário (últimos 30d)</span>
                        <span className="text-accent-red font-bold number-font">{formatCurrency(avgDailySpending)}/dia</span>
                    </div>
                    <div className="flex items-center justify-between text-xs mt-1.5">
                        <span className="text-gray-400">Receita média diária (últimos 30d)</span>
                        <span className="text-accent-green font-bold number-font">{formatCurrency(avgDailyIncome)}/dia</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
