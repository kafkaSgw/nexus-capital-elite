'use client'

import { useState, useEffect, useMemo } from 'react'
import { CalendarCheck, TrendingUp, TrendingDown, Wallet, GraduationCap, ChevronDown, ChevronUp, X } from 'lucide-react'
import { getTransactions, getAssets, Transaction, Asset } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import { useAcademyProgress } from '@/hooks/useAcademyProgress'
import { motion, AnimatePresence } from 'framer-motion'

const STORAGE_KEY = 'nexus_weekly_summary_dismissed'

function getWeekNumber(): string {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1)
  const diff = now.getTime() - start.getTime()
  const oneWeek = 7 * 24 * 60 * 60 * 1000
  return `${now.getFullYear()}-W${Math.ceil(diff / oneWeek)}`
}

export default function WeeklySummary() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [dismissed, setDismissed] = useState(true)
  const [expanded, setExpanded] = useState(false)
  const { xp, streak } = useAcademyProgress()

  useEffect(() => {
    // Only show on Mondays, or if never seen this week
    const currentWeek = getWeekNumber()
    const lastDismissed = localStorage.getItem(STORAGE_KEY)
    if (lastDismissed !== currentWeek) {
      setDismissed(false)
    }

    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [txs, ast] = await Promise.all([getTransactions(), getAssets()])
      setTransactions(txs)
      setAssets(ast)
    } finally {
      setLoading(false)
    }
  }

  const dismiss = () => {
    setDismissed(true)
    localStorage.setItem(STORAGE_KEY, getWeekNumber())
  }

  // Calculate last 7 days stats
  const weekStats = useMemo(() => {
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const weekTxs = transactions.filter(t => new Date(t.created_at) >= weekAgo)
    const income = weekTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const expense = weekTxs.filter(t => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount), 0)
    const balance = income - expense

    const totalInvested = assets.reduce((s, a) => s + a.preco_medio * a.quantidade, 0)
    const totalCurrent = assets.reduce((s, a) => s + a.preco_atual * a.quantidade, 0)
    const investmentChange = totalInvested > 0 ? ((totalCurrent - totalInvested) / totalInvested * 100) : 0

    return { income, expense, balance, investmentChange, totalCurrent, txCount: weekTxs.length }
  }, [transactions, assets])

  if (dismissed || loading) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="card-premium mb-6 overflow-hidden border-primary/20 bg-gradient-to-r from-primary/[0.04] to-transparent"
      >
        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-accent-indigo/20 flex items-center justify-center border border-primary/10">
                <CalendarCheck className="w-4 h-4 text-primary-lighter" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Resumo da Semana</h3>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Últimos 7 dias</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setExpanded(!expanded)} className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors">
                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              <button onClick={dismiss} className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Compact summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white/[0.03] rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp className="w-3 h-3 text-accent-green" />
                <span className="text-[10px] text-gray-500 uppercase">Receitas</span>
              </div>
              <p className="text-sm font-bold text-accent-green number-font">{formatCurrency(weekStats.income)}</p>
            </div>
            <div className="bg-white/[0.03] rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingDown className="w-3 h-3 text-accent-red" />
                <span className="text-[10px] text-gray-500 uppercase">Despesas</span>
              </div>
              <p className="text-sm font-bold text-accent-red number-font">{formatCurrency(weekStats.expense)}</p>
            </div>
            <div className="bg-white/[0.03] rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Wallet className="w-3 h-3 text-primary-lighter" />
                <span className="text-[10px] text-gray-500 uppercase">Carteira</span>
              </div>
              <p className={`text-sm font-bold number-font ${weekStats.investmentChange >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                {weekStats.investmentChange >= 0 ? '+' : ''}{weekStats.investmentChange.toFixed(1)}%
              </p>
            </div>
            <div className="bg-white/[0.03] rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <GraduationCap className="w-3 h-3 text-accent-purple" />
                <span className="text-[10px] text-gray-500 uppercase">Academy</span>
              </div>
              <p className="text-sm font-bold text-accent-purple number-font">{xp} XP · {streak}🔥</p>
            </div>
          </div>

          {/* Expanded details */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 pt-4 border-t border-white/[0.04] space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Saldo Semanal</span>
                    <span className={`font-bold number-font ${weekStats.balance >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                      {weekStats.balance >= 0 ? '+' : ''}{formatCurrency(weekStats.balance)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Transações Registradas</span>
                    <span className="font-bold number-font text-white">{weekStats.txCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Valor Total da Carteira</span>
                    <span className="font-bold number-font text-white">{formatCurrency(weekStats.totalCurrent)}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
