'use client'

import { useState, useEffect } from 'react'
import { CalendarDays } from 'lucide-react'
import { motion } from 'framer-motion'
import { getTransactions } from '@/lib/supabase'
import dynamic from 'next/dynamic'
import FinancialCalendar from '@/components/FinancialCalendar'
import RecurringTransactions from '@/components/RecurringTransactions'

const CashFlowProjection = dynamic(() => import('@/components/CashFlowProjection'), {
    ssr: false,
    loading: () => <div className="h-[400px] w-full bg-dark-card/50 rounded-xl animate-pulse" />
})

export default function CalendarioPage() {
    const [currentBalance, setCurrentBalance] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadBalance()
    }, [])

    const loadBalance = async () => {
        try {
            const transactions = await getTransactions()
            const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
            const expense = Math.abs(transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0))
            setCurrentBalance(income - expense)
        } catch (error) {
            console.error('Erro ao carregar saldo:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto pb-20"
        >
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-1">
                    <CalendarDays className="w-6 h-6 text-primary-lighter" />
                    <h1 className="text-2xl font-extrabold text-white tracking-tight">Calendário Financeiro</h1>
                </div>
                <p className="text-sm text-gray-400">Visualize suas transações, contas agendadas e recorrentes</p>
            </div>

            <FinancialCalendar />

            {/* Fluxo de Caixa Projetado */}
            <div className="mt-8">
                <CashFlowProjection currentBalance={currentBalance} />
            </div>

            {/* Transações Recorrentes */}
            <div className="mt-8">
                <RecurringTransactions />
            </div>
        </motion.div>
    )
}
