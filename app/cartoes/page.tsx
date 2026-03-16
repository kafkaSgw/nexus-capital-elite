'use client'

import CreditCards from '@/components/CreditCards'
import { CreditCard } from 'lucide-react'
import { motion } from 'framer-motion'

export default function CartoesPage() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto pb-20"
        >
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-1">
                    <CreditCard className="w-6 h-6 text-primary-lighter" />
                    <h1 className="text-2xl font-extrabold text-white tracking-tight">Cartões de Crédito</h1>
                </div>
                <p className="text-sm text-gray-400">Gerencie seus cartões, limites e parcelas</p>
            </div>

            <CreditCards />
        </motion.div>
    )
}
