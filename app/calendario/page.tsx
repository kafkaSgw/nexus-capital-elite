'use client'

import FinancialCalendar from '@/components/FinancialCalendar'
import { CalendarDays } from 'lucide-react'
import { motion } from 'framer-motion'

export default function CalendarioPage() {
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
                <p className="text-sm text-gray-400">Visualize suas transações e contas agendadas por dia</p>
            </div>

            <FinancialCalendar />
        </motion.div>
    )
}
