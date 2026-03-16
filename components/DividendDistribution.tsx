'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Coins, User, TrendingUp, DollarSign, Calculator, Loader2 } from 'lucide-react'
import { getTransactions, Transaction, getPartners, Partner } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'

export default function DividendDistribution() {
    const [partners, setPartners] = useState<Partner[]>([])
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)
    const [distributionType, setDistributionType] = useState<'profit' | 'custom'>('profit')
    const [customAmount, setCustomAmount] = useState('')

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const [pData, tData] = await Promise.all([
                getPartners(),
                getTransactions()
            ])
            setPartners(pData)
            setTransactions(tData)
        } catch (error) {
            console.error('Error loading data:', error)
        } finally {
            setLoading(false)
        }
    }

    const totalProfit = useMemo(() => {
        const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
        const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0)
        return income - expense
    }, [transactions])

    const amountToDistribute = distributionType === 'profit' ? totalProfit : (parseFloat(customAmount) || 0)

    // Calculate total shares
    const totalShares = partners.reduce((sum, p) => sum + p.share, 0) || 1

    if (loading) {
        return (
            <div className="card-premium p-6 flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500/50 mb-3" />
                <p className="text-sm text-gray-500">Carregando dados societários...</p>
            </div>
        )
    }

    return (
        <div className="card-premium flex flex-col h-full relative overflow-hidden">
            <div className="relative z-10 p-5 border-b border-dark-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 rounded-xl flex items-center justify-center">
                        <Coins className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="font-bold tracking-wide text-white">Distribuição Societária</h3>
                        <p className="text-xs text-gray-400">Simulação de dividendos</p>
                    </div>
                </div>
            </div>

            <div className="relative z-10 p-5 space-y-5 flex-1 overflow-y-auto">
                {/* Global Stats */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/[0.02] border border-white/[0.05] shadow-inner rounded-xl p-3 flex flex-col justify-center">
                        <p className="text-[10px] uppercase text-gray-500 tracking-wider mb-1.5 flex items-center gap-1.5">
                            <TrendingUp className="w-3 h-3 text-emerald-400" /> Lucro Líquido Real
                        </p>
                        <p className="font-bold text-white number-font text-lg">{formatCurrency(totalProfit)}</p>
                    </div>
                    <div className="bg-white/[0.02] border border-white/[0.05] shadow-inner rounded-xl p-3 flex flex-col justify-center">
                        <p className="text-[10px] uppercase text-gray-500 tracking-wider mb-1.5">Total de Cotas Ativas</p>
                        <p className="font-bold text-emerald-400 number-font text-lg">{totalShares}%</p>
                    </div>
                </div>

                {/* Simulation Controls */}
                <div className="bg-[#0f1115]/50 p-4 rounded-xl border border-white/[0.05] space-y-3 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent pointer-events-none" />

                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 relative z-10">
                        <Calculator className="w-3 h-3" /> Configuração do Rateio
                    </p>

                    <div className="flex gap-2 p-1 bg-black/40 rounded-lg border border-white/[0.02] shadow-inner relative z-10">
                        <button
                            onClick={() => setDistributionType('profit')}
                            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${distributionType === 'profit' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            Lucro do Trimestre
                        </button>
                        <button
                            onClick={() => setDistributionType('custom')}
                            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${distributionType === 'custom' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            Outro Montante
                        </button>
                    </div>

                    {distributionType === 'custom' && (
                        <div className="relative z-10">
                            <DollarSign className="w-4 h-4 text-emerald-500/50 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="number"
                                value={customAmount}
                                onChange={e => setCustomAmount(e.target.value)}
                                placeholder="Montante em espécie a distribuir"
                                className="w-full bg-[#161922] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors shadow-inner"
                            />
                        </div>
                    )}
                </div>

                {/* Distribution List */}
                <div className="space-y-2">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Rateio por Quotista</p>
                    {partners.length === 0 ? (
                        <div className="text-center py-6 bg-white/[0.01] border border-white/[0.02] rounded-xl border-dashed">
                            <User className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">Nenhum sócio ativo.</p>
                        </div>
                    ) : (
                        partners.map((partner, idx) => {
                            const partnerSharePercentage = partner.share / totalShares
                            const estimatedDividend = amountToDistribute * partnerSharePercentage

                            return (
                                <motion.div
                                    key={partner.id}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-emerald-500/20 transition-all group"
                                >
                                    <div className="flex items-center gap-3 relative">
                                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 shadow-inner group-hover:bg-emerald-500/20 transition-colors">
                                            <span className="text-sm font-bold text-emerald-400">{partner.name.charAt(0).toUpperCase()}</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white tracking-wide">{partner.name}</p>
                                            <p className="text-[11px] text-gray-500 flex items-center gap-1.5 uppercase tracking-wider mt-0.5">
                                                Cotas Oficiais <span className="text-emerald-500/80 font-bold">• {partner.share}%</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Montante Devido</p>
                                        <p className="text-base font-bold text-emerald-400 number-font drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">
                                            +{formatCurrency(Math.max(0, estimatedDividend))}
                                        </p>
                                    </div>
                                </motion.div>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    )
}
