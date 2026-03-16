'use client'

import { motion } from 'framer-motion'
import { Users } from 'lucide-react'
import PartnersControl from '@/components/PartnersControl'
import CostCenters from '@/components/CostCenters'
import DividendDistribution from '@/components/DividendDistribution'
import VotingSystem from '@/components/VotingSystem'

export default function SociosPage() {
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100, damping: 15 } }
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">

            {/* Page Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 flex items-center justify-between"
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 border border-white/10">
                        <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Conselho Societário</h1>
                        <p className="text-sm text-gray-400">Gestão de participações e controle estratégico</p>
                    </div>
                </div>
            </motion.div>

            {/* Content Grid */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
                <motion.div variants={itemVariants} className="h-full">
                    <PartnersControl />
                </motion.div>

                <motion.div variants={itemVariants} className="h-full">
                    <DividendDistribution />
                </motion.div>

                <motion.div variants={itemVariants} className="h-full">
                    <VotingSystem />
                </motion.div>

                <motion.div variants={itemVariants} className="h-full">
                    <CostCenters />
                </motion.div>
            </motion.div>
        </div>
    )
}
