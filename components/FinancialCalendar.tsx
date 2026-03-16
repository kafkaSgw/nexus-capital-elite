'use client'

import { useState, useEffect, useMemo } from 'react'
import { ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight, Clock, CalendarDays } from 'lucide-react'
import { getTransactions, getScheduledTransactions, Transaction, ScheduledTransaction } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

interface DayData {
    date: Date
    isCurrentMonth: boolean
    isToday: boolean
    transactions: Transaction[]
    scheduled: ScheduledTransaction[]
    totalIncome: number
    totalExpense: number
}

export default function FinancialCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [scheduled, setScheduled] = useState<ScheduledTransaction[]>([])
    const [selectedDay, setSelectedDay] = useState<DayData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const [txs, sts] = await Promise.all([getTransactions(), getScheduledTransactions()])
            setTransactions(txs)
            setScheduled(sts)
        } catch (err) {
            console.error('Erro ao carregar dados do calendário:', err)
        } finally {
            setLoading(false)
        }
    }

    const calendarDays = useMemo(() => {
        const year = currentDate.getFullYear()
        const month = currentDate.getMonth()
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        const startDate = new Date(firstDay)
        startDate.setDate(startDate.getDate() - firstDay.getDay())

        const days: DayData[] = []
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        for (let i = 0; i < 42; i++) {
            const date = new Date(startDate)
            date.setDate(startDate.getDate() + i)
            const dateStr = date.toISOString().split('T')[0]

            const dayTxs = transactions.filter(t => t.created_at.startsWith(dateStr))
            const daySch = scheduled.filter(s => s.due_date === dateStr)

            const totalIncome = dayTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
            const totalExpense = dayTxs.filter(t => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount), 0)

            days.push({
                date,
                isCurrentMonth: date.getMonth() === month,
                isToday: date.getTime() === today.getTime(),
                transactions: dayTxs,
                scheduled: daySch,
                totalIncome,
                totalExpense,
            })
        }

        return days
    }, [currentDate, transactions, scheduled])

    const navigateMonth = (dir: number) => {
        setCurrentDate(prev => {
            const d = new Date(prev)
            d.setMonth(d.getMonth() + dir)
            return d
        })
        setSelectedDay(null)
    }

    const monthTotals = useMemo(() => {
        const year = currentDate.getFullYear()
        const month = currentDate.getMonth()
        const monthTxs = transactions.filter(t => {
            const d = new Date(t.created_at)
            return d.getFullYear() === year && d.getMonth() === month
        })
        const income = monthTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
        const expense = monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount), 0)
        return { income, expense, balance: income - expense }
    }, [currentDate, transactions])

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="loading-shimmer h-12 rounded-xl" />
                <div className="loading-shimmer h-[500px] rounded-xl" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Month Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="card-premium p-4">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Receitas do Mês</p>
                    <p className="text-xl font-bold text-accent-green number-font">{formatCurrency(monthTotals.income)}</p>
                </div>
                <div className="card-premium p-4">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Despesas do Mês</p>
                    <p className="text-xl font-bold text-accent-red number-font">{formatCurrency(monthTotals.expense)}</p>
                </div>
                <div className="card-premium p-4">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Saldo do Mês</p>
                    <p className={`text-xl font-bold number-font ${monthTotals.balance >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                        {formatCurrency(monthTotals.balance)}
                    </p>
                </div>
            </div>

            {/* Calendar */}
            <div className="card-premium overflow-hidden">
                {/* Header */}
                <div className="p-4 sm:p-5 border-b border-white/[0.04] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-accent-indigo/20 flex items-center justify-center border border-primary/10">
                            <CalendarDays className="w-4 h-4 text-primary-lighter" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-white">
                                {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                            </h3>
                            <p className="text-xs text-gray-500">Visão completa do mês</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button onClick={() => navigateMonth(-1)} className="p-2 rounded-lg hover:bg-white/[0.06] text-gray-400 hover:text-white transition-colors">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button onClick={() => { setCurrentDate(new Date()); setSelectedDay(null) }} className="px-3 py-1.5 rounded-lg text-xs font-medium text-primary hover:bg-primary/10 transition-colors">
                            Hoje
                        </button>
                        <button onClick={() => navigateMonth(1)} className="p-2 rounded-lg hover:bg-white/[0.06] text-gray-400 hover:text-white transition-colors">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Weekday Headers */}
                <div className="grid grid-cols-7 border-b border-white/[0.04]">
                    {WEEKDAYS.map(day => (
                        <div key={day} className="p-2 text-center text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7">
                    {calendarDays.map((day, i) => {
                        const hasEvents = day.transactions.length > 0 || day.scheduled.length > 0
                        const isSelected = selectedDay?.date.getTime() === day.date.getTime()

                        return (
                            <button
                                key={i}
                                onClick={() => setSelectedDay(isSelected ? null : day)}
                                className={`
                  relative min-h-[70px] sm:min-h-[90px] p-1 sm:p-2 border-b border-r border-white/[0.03] text-left transition-all duration-200
                  ${!day.isCurrentMonth ? 'opacity-30' : ''}
                  ${day.isToday ? 'bg-primary/[0.06]' : ''}
                  ${isSelected ? 'bg-primary/10 ring-1 ring-primary/30' : 'hover:bg-white/[0.03]'}
                `}
                            >
                                <span className={`text-xs sm:text-sm font-medium ${day.isToday ? 'text-primary font-bold' : 'text-gray-400'}`}>
                                    {day.date.getDate()}
                                </span>

                                {hasEvents && day.isCurrentMonth && (
                                    <div className="mt-1 space-y-0.5">
                                        {day.totalIncome > 0 && (
                                            <div className="flex items-center gap-0.5 text-[9px] sm:text-[10px] text-accent-green">
                                                <ArrowUpRight className="w-2.5 h-2.5 shrink-0" />
                                                <span className="truncate number-font">{formatCurrency(day.totalIncome)}</span>
                                            </div>
                                        )}
                                        {day.totalExpense > 0 && (
                                            <div className="flex items-center gap-0.5 text-[9px] sm:text-[10px] text-accent-red">
                                                <ArrowDownRight className="w-2.5 h-2.5 shrink-0" />
                                                <span className="truncate number-font">{formatCurrency(day.totalExpense)}</span>
                                            </div>
                                        )}
                                        {day.scheduled.length > 0 && (
                                            <div className="flex items-center gap-0.5 text-[9px] sm:text-[10px] text-accent-yellow">
                                                <Clock className="w-2.5 h-2.5 shrink-0" />
                                                <span className="truncate">{day.scheduled.length} agend.</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Event dots */}
                                {hasEvents && day.isCurrentMonth && (
                                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                                        {day.totalIncome > 0 && <div className="w-1 h-1 rounded-full bg-accent-green" />}
                                        {day.totalExpense > 0 && <div className="w-1 h-1 rounded-full bg-accent-red" />}
                                        {day.scheduled.length > 0 && <div className="w-1 h-1 rounded-full bg-accent-yellow" />}
                                    </div>
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Selected Day Detail */}
            <AnimatePresence>
                {selectedDay && (selectedDay.transactions.length > 0 || selectedDay.scheduled.length > 0) && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="card-premium overflow-hidden"
                    >
                        <div className="p-4 border-b border-white/[0.04]">
                            <h4 className="text-sm font-bold text-white">
                                {selectedDay.date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </h4>
                        </div>

                        <div className="divide-y divide-white/[0.03]">
                            {selectedDay.transactions.map(tx => (
                                <div key={tx.id} className="flex items-center justify-between p-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.type === 'income' ? 'bg-accent-green/10 text-accent-green' : 'bg-accent-red/10 text-accent-red'}`}>
                                            {tx.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">{tx.description}</p>
                                            <p className="text-xs text-gray-500">{tx.category}</p>
                                        </div>
                                    </div>
                                    <span className={`text-sm font-semibold number-font ${tx.type === 'income' ? 'text-accent-green' : 'text-accent-red'}`}>
                                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(tx.amount))}
                                    </span>
                                </div>
                            ))}

                            {selectedDay.scheduled.map(st => (
                                <div key={st.id} className="flex items-center justify-between p-4 bg-accent-yellow/[0.03]">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-accent-yellow/10 text-accent-yellow">
                                            <Clock className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">{st.description}</p>
                                            <p className="text-xs text-gray-500">{st.category} • {st.is_paid ? 'Pago' : 'Pendente'}</p>
                                        </div>
                                    </div>
                                    <span className={`text-sm font-semibold number-font ${st.type === 'income' ? 'text-accent-green' : 'text-accent-red'}`}>
                                        {formatCurrency(Math.abs(st.amount))}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
