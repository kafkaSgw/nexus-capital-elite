'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  DollarSign, TrendingUp, TrendingDown, Plus, Wallet,
  PieChart, ArrowUpRight, ArrowDownRight, Sparkles,
  BarChart3, Target, Activity, Copy, FileText, Search, Edit,
  GraduationCap, Flame, Zap, ChevronRight, LayoutDashboard, Check
} from 'lucide-react'
import Link from 'next/link'
import { getTransactions, getAssets, Transaction, Asset, createTransaction, deleteTransaction } from '@/lib/supabase'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from '@/components/SortableItem';
import { formatCurrency, formatDate, calculatePercentageChange } from '@/lib/utils'
import { useSoundFX } from '@/components/useSoundFX'
import CategoryBreakdown from '@/components/CategoryBreakdown'
import HealthScore from '@/components/HealthScore'
import TransactionModal from '@/components/TransactionModal'
import DateFilter from '@/components/DateFilter'
import SparklineChart from '@/components/SparklineChart'
import ExportReport from '@/components/ExportReport'
import SmartInsights from '@/components/SmartInsights'
import BankAccounts from '@/components/BankAccounts'
import { SpotlightCard } from '@/components/SpotlightCard'
import dynamic from 'next/dynamic'
import Tilt from 'react-parallax-tilt'
import { motion, Variants } from 'framer-motion'
import MacroIndicators from '@/components/MacroIndicators'
import Achievements from '@/components/Achievements'
import MonthlyReport from '@/components/MonthlyReport'
import ShareDashboard from '@/components/ShareDashboard'
import ReceiptScanner from '@/components/ReceiptScanner'
import OpenFinance from '@/components/OpenFinance'
import { useAcademyProgress } from '@/hooks/useAcademyProgress'
import WeeklySummary from '@/components/WeeklySummary'

const LiveMarketBackground = dynamic(() => import('@/components/LiveMarketBackground'), { ssr: false })

// Hook to detect mobile/touch devices
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
}

// Wrapper: renders Tilt on desktop, plain div on mobile
function CardWrapper({ children, className }: { children: React.ReactNode; className?: string }) {
  const isMobile = useIsMobile()
  // Removendo 'card-premium' pois o SpotlightCard já adiciona essa classe base
  const cleanClassName = className?.replace('card-premium', '').trim()

  if (isMobile) {
    return <SpotlightCard className={cleanClassName}>{children}</SpotlightCard>
  }
  return (
    <Tilt tiltMaxAngleX={5} tiltMaxAngleY={5} scale={1.02} transitionSpeed={2000} className="h-full">
      <SpotlightCard className={`h-full ${cleanClassName}`}>
        {children}
      </SpotlightCard>
    </Tilt>
  )
}

// Lazy loaded heavy components
const CashFlowChart = dynamic(() => import('@/components/CashFlowChart'), { ssr: false, loading: () => <div className="h-[400px] w-full bg-dark-card/50 rounded-xl animate-pulse" /> })
const FinancialRadar = dynamic(() => import('@/components/FinancialRadar'), { ssr: false, loading: () => <div className="h-[300px] w-full bg-dark-card/50 rounded-xl animate-pulse" /> })
const NeuralGraph = dynamic(() => import('@/components/NeuralGraph'), { ssr: false, loading: () => <div className="h-[300px] w-full bg-dark-card/50 rounded-xl animate-pulse" /> })
const TerminalEngine = dynamic(() => import('@/components/TerminalEngine'), { ssr: false, loading: () => <div className="h-[300px] w-full bg-dark-card/50 rounded-xl animate-pulse" /> })
const QuantumSimulator = dynamic(() => import('@/components/QuantumSimulator'), { ssr: false, loading: () => <div className="h-[300px] w-full bg-dark-card/50 rounded-xl animate-pulse" /> })
const InteractiveNebula = dynamic(() => import('@/components/InteractiveNebula'), { ssr: false, loading: () => <div className="h-[400px] w-full bg-dark-card/50 rounded-xl animate-pulse" /> })

import toast from 'react-hot-toast'
import { Trash2 } from 'lucide-react'

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [duplicating, setDuplicating] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [visibleCount, setVisibleCount] = useState(10)
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })
  const { playSound } = useSoundFX()
  const { xp, streak, level, completedChapters } = useAcademyProgress()

  const [isEditMode, setIsEditMode] = useState(false)
  const defaultOrder = ['smart-insights', 'kpi-cards', 'academy-progress', 'macro-indicators', 'content-grid', 'cash-flow', 'bottom-charts', 'quick-stats']
  const [layoutOrder, setLayoutOrder] = useState<string[]>(defaultOrder)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  useEffect(() => {
    const saved = localStorage.getItem('nexus_dashboard_layout')
    if (saved) {
      try {
         const parsed = JSON.parse(saved)
         if (parsed.length === defaultOrder.length) setLayoutOrder(parsed)
      } catch (e) {}
    }
    loadData()

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        setEditingTransaction(null)
        setShowModal(true)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
       setLayoutOrder((items) => {
          const oldIndex = items.indexOf(active.id as string)
          const newIndex = items.indexOf(over.id as string)
          const newOrder = arrayMove(items, oldIndex, newIndex)
          localStorage.setItem('nexus_dashboard_layout', JSON.stringify(newOrder))
          return newOrder
       })
    }
  }

  const loadData = async () => {
    try {
      const [txs, ast] = await Promise.all([getTransactions(), getAssets()])
      setTransactions(txs)
      setAssets(ast)
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDuplicate = async (tx: Transaction) => {
    setDuplicating(tx.id)
    try {
      await createTransaction({
        description: `${tx.description} (Cópia)`,
        amount: tx.amount,
        type: tx.type,
        category: tx.category,
        company_id: tx.company_id || null,
        account_id: tx.account_id || null
      })
      toast.success('Transação duplicada!')
      playSound('cash')
      loadData()
    } catch (err) {
      toast.error('Erro ao duplicar transação')
    } finally {
      setDuplicating(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta transação?')) return

    setDeleting(id)
    try {
      await deleteTransaction(id)
      toast.success('Transação excluída com sucesso!')
      playSound('error')
      loadData()
    } catch (err) {
      toast.error('Erro ao excluir transação')
    } finally {
      setDeleting(null)
    }
  }

  const handleEdit = (tx: Transaction) => {
    setEditingTransaction(tx)
    setShowModal(true)
  }

  // Filtrar transações pelo DateRange
  const filteredTransactions = transactions.filter(t => {
    const d = new Date(t.created_at).toISOString().split('T')[0]
    return d >= dateRange.start && d <= dateRange.end
  })

  // Cálculos
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  const balance = totalIncome - totalExpense

  const totalInvested = assets.reduce((sum, a) => sum + a.preco_medio * a.quantidade, 0)
  const totalCurrentValue = assets.reduce((sum, a) => sum + a.preco_atual * a.quantidade, 0)
  const investmentProfit = totalCurrentValue - totalInvested
  const investmentROI = totalInvested > 0 ? (investmentProfit / totalInvested) * 100 : 0

  const patrimonio = balance + totalCurrentValue

  const marketSentiment = useMemo(() => {
    if (totalInvested === 0 && balance === 0) return 'neutral' as const
    if (balance > 0) return 'bullish' as const
    if (balance < 0) return 'bearish' as const
    return 'neutral' as const
  }, [balance, totalInvested])

  // Sparkline data (últimos 14 dias)
  const getSparklineData = (type: 'income' | 'expense' | 'balance') => {
    const days = 14;
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(new Date(dateRange.end).getTime() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const dayTxs = filteredTransactions.filter(t => t.created_at.startsWith(d))
      const inc = dayTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
      const exp = Math.abs(dayTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0))

      if (type === 'income') result.push(inc)
      else if (type === 'expense') result.push(exp)
      else result.push(inc - exp)
    }
    return result
  }

  const incomeSparkline = getSparklineData('income')
  const expenseSparkline = getSparklineData('expense')
  const balanceSparkline = getSparklineData('balance')

  // Pesquisa e Paginação
  const searchedTransactions = filteredTransactions.filter(t =>
    t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.category.toLowerCase().includes(searchTerm.toLowerCase())
  )
  const displayedTransactions = searchedTransactions.slice(0, visibleCount)

  // Monthly change
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

  const recentIncome = transactions
    .filter(t => t.type === 'income' && new Date(t.created_at) >= thirtyDaysAgo)
    .reduce((s, t) => s + t.amount, 0)
  const prevIncome = transactions
    .filter(t => {
      const d = new Date(t.created_at)
      return t.type === 'income' && d >= sixtyDaysAgo && d < thirtyDaysAgo
    })
    .reduce((s, t) => s + t.amount, 0)
  const incomeChange = calculatePercentageChange(recentIncome, prevIncome)

  const recentExpense = transactions
    .filter(t => t.type === 'expense' && new Date(t.created_at) >= thirtyDaysAgo)
    .reduce((s, t) => s + Math.abs(t.amount), 0)
  const prevExpense = transactions
    .filter(t => {
      const d = new Date(t.created_at)
      return t.type === 'expense' && d >= sixtyDaysAgo && d < thirtyDaysAgo
    })
    .reduce((s, t) => s + Math.abs(t.amount), 0)
  const expenseChange = calculatePercentageChange(recentExpense, prevExpense)

  const recentBalance = recentIncome - recentExpense
  const prevBalance = prevIncome - prevExpense
  const balanceChange = calculatePercentageChange(recentBalance, prevBalance)

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="loading-shimmer h-[140px]" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 loading-shimmer h-[400px]" />
          <div className="loading-shimmer h-[400px]" />
        </div>
      </div>
    )
  }

  // Animações
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto pb-32 sm:pb-20"
    >
      {/* Live Market Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <LiveMarketBackground sentiment={marketSentiment} />
      </div>

      {/* Weekly Summary Digest */}
      <WeeklySummary />

      {/* Page Header */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Visão geral da sua saúde financeira
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <DateFilter onFilterChange={(start, end) => setDateRange({ start, end })} />
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`flex items-center gap-2 text-sm whitespace-nowrap px-4 py-2.5 rounded-lg border transition-all ${isEditMode ? 'bg-accent-green/10 text-accent-green border-accent-green/20' : 'bg-transparent text-gray-300 border-white/10 hover:bg-white/5'}`}
          >
            {isEditMode ? <Check className="w-4 h-4" /> : <LayoutDashboard className="w-4 h-4" />}
            {isEditMode ? 'Salvar Layout' : 'Editar Layout'}
          </button>
          <button
            id="tour-new-tx"
            onClick={() => { setEditingTransaction(null); setShowModal(true) }}
            className="btn-primary flex items-center gap-2 text-sm whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Nova Transação
            <kbd className="hidden sm:inline-flex items-center ml-2 text-[10px] px-1.5 py-0.5 bg-white/10 rounded font-mono">
              ⌘N
            </kbd>
          </button>
        </div>
      </motion.div>

      {/* Action Buttons Row */}
      <motion.div variants={itemVariants} className="flex flex-wrap gap-2 my-4">
        <MonthlyReport />
        <ShareDashboard />
        <ReceiptScanner />
        <OpenFinance />
      </motion.div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={layoutOrder} strategy={verticalListSortingStrategy}>
          {layoutOrder.map(sectionId => (
            <SortableItem key={sectionId} id={sectionId} isEditMode={isEditMode}>

              {/* AI Smart Insights */}
              {sectionId === 'smart-insights' && (
                <motion.div variants={itemVariants} id="tour-smart-insights">
                  <SmartInsights transactions={filteredTransactions} />
                </motion.div>
              )}

              {/* KPI Cards */}
              {sectionId === 'kpi-cards' && (
              <motion.div variants={itemVariants} id="tour-kpi-cards" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8 stagger-children">
        {/* Patrimônio Total */}
        <CardWrapper className="card-premium p-4 sm:p-5 group flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent-indigo/20 flex items-center justify-center border border-primary/10">
                <DollarSign className="w-5 h-5 text-primary-lighter" />
              </div>
            </div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Patrimônio Total</p>
            <p className="text-2xl font-bold text-white number-font tracking-tight">
              {formatCurrency(patrimonio)}
            </p>
            <div className="flex justify-between items-end mt-4">
              <span className={`badge-premium ${balanceChange >= 0 ? 'badge-success' : 'badge-danger'}`}>
                {balanceChange >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                {Math.abs(balanceChange).toFixed(1)}% vs mês ant.
              </span>
              <SparklineChart data={balanceSparkline} color={balanceChange >= 0 ? "#10B981" : "#EF4444"} />
            </div>
          </div>
        </CardWrapper>

        {/* Investimentos */}
        <CardWrapper className="card-premium p-4 sm:p-5 group flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-purple/20 to-accent-pink/20 flex items-center justify-center border border-accent-purple/10">
                <TrendingUp className="w-5 h-5 text-accent-purple" />
              </div>
              {investmentROI !== 0 && (
                <span className={`badge-premium text-[11px] ${investmentROI > 0 ? 'badge-success' : 'badge-danger'}`}>
                  {investmentROI > 0 ? '+' : ''}{investmentROI.toFixed(1)}%
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Investimentos</p>
            <p className="text-2xl font-bold text-white number-font tracking-tight">
              {formatCurrency(totalCurrentValue)}
            </p>
            <Link href="/investimentos" className="mt-3 flex items-center gap-1 text-xs text-primary hover:text-primary-lighter transition-colors group/link">
              Ver Carteira
              <ChevronRight className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </CardWrapper>

        {/* Receitas */}
        <CardWrapper className="card-premium p-4 sm:p-5 group flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-green/20 to-accent-cyan/20 flex items-center justify-center border border-accent-green/10">
                <ArrowUpRight className="w-5 h-5 text-accent-green" />
              </div>
            </div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Total Receitas</p>
            <p className="text-2xl font-bold text-accent-green number-font tracking-tight">
              {formatCurrency(totalIncome)}
            </p>
            <div className="flex justify-between items-end mt-4">
              <span className={`badge-premium ${incomeChange >= 0 ? 'badge-success' : 'badge-danger'}`}>
                {incomeChange >= 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                {Math.abs(incomeChange).toFixed(1)}% vs mês ant.
              </span>
              <SparklineChart data={incomeSparkline} color="#10B981" />
            </div>
          </div>
        </CardWrapper>

        {/* Despesas */}
        <CardWrapper className="card-premium p-4 sm:p-5 group flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-red/20 to-accent-orange/20 flex items-center justify-center border border-accent-red/10">
                <ArrowDownRight className="w-5 h-5 text-accent-red" />
              </div>
            </div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Total Despesas</p>
            <p className="text-2xl font-bold text-accent-red number-font tracking-tight">
              {formatCurrency(totalExpense)}
            </p>
            <div className="flex justify-between items-end mt-4">
              <span className={`badge-premium ${expenseChange <= 0 ? 'badge-success' : 'badge-danger'}`}>
                {expenseChange <= 0 ? <ArrowDownRight className="w-3 h-3 mr-1" /> : <ArrowUpRight className="w-3 h-3 mr-1" />}
                {Math.abs(expenseChange).toFixed(1)}% vs mês ant.
              </span>
              <SparklineChart data={expenseSparkline} color="#EF4444" />
            </div>
          </div>
        </CardWrapper>
              </motion.div>
              )}

              {/* Academy Progress + Month Comparison */}
              {sectionId === 'academy-progress' && (
              <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 mb-8">
        {/* Academy Progress Widget */}
        <div className="card-premium p-5 relative overflow-hidden group hover:border-accent-purple/30 transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent-purple/5 rounded-full blur-[60px] -z-10" />
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-purple/20 to-accent-pink/20 flex items-center justify-center border border-accent-purple/10">
                <GraduationCap className="w-5 h-5 text-accent-purple" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Academy</h3>
                <p className="text-xs text-gray-500">Sua jornada de aprendizado</p>
              </div>
            </div>
            <Link href="/academy" className="text-xs text-primary hover:text-primary-lighter transition-colors flex items-center gap-1 group/link">
              Acessar
              <ChevronRight className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/[0.03] rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Zap className="w-3.5 h-3.5 text-accent-yellow" />
                <span className="text-lg font-bold text-white number-font">{xp.toLocaleString()}</span>
              </div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">XP Total</p>
            </div>
            <div className="bg-white/[0.03] rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Flame className="w-3.5 h-3.5 text-accent-orange" />
                <span className="text-lg font-bold text-white number-font">{streak}</span>
              </div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Streak</p>
            </div>
            <div className="bg-white/[0.03] rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Target className="w-3.5 h-3.5 text-accent-green" />
                <span className="text-lg font-bold text-white number-font">Nv {level}</span>
              </div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Nível</p>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-gray-500">Progresso para Nível {level + 1}</span>
              <span className="text-[10px] text-gray-400 number-font">{xp % 500}/500 XP</span>
            </div>
            <div className="h-1.5 bg-dark-bg rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-accent-purple to-accent-pink rounded-full transition-all duration-1000" style={{ width: `${(xp % 500) / 5}%` }} />
            </div>
          </div>
        </div>

        {/* Month vs Month Comparison Bar Chart */}
        <div className="card-premium p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent-cyan/20 flex items-center justify-center border border-primary/10">
                <BarChart3 className="w-5 h-5 text-primary-lighter" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Este Mês vs Anterior</h3>
                <p className="text-xs text-gray-500">Comparativo visual</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-gray-400">Receitas</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs number-font text-gray-500">{formatCurrency(prevIncome)}</span>
                  <span className="text-xs text-gray-600">→</span>
                  <span className="text-xs number-font text-accent-green font-medium">{formatCurrency(recentIncome)}</span>
                </div>
              </div>
              <div className="flex gap-1 h-4">
                <div className="bg-accent-green/20 rounded-l-md transition-all duration-1000" style={{ width: `${Math.max(recentIncome, prevIncome) > 0 ? (prevIncome / Math.max(recentIncome, prevIncome)) * 100 : 0}%` }}>
                  <div className="h-full bg-accent-green/40 rounded-l-md" />
                </div>
                <div className="bg-accent-green rounded-r-md transition-all duration-1000" style={{ width: `${Math.max(recentIncome, prevIncome) > 0 ? (recentIncome / Math.max(recentIncome, prevIncome)) * 100 : 0}%` }} />
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-accent-green/40" /><span className="text-[10px] text-gray-500">Anterior</span></div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-accent-green" /><span className="text-[10px] text-gray-500">Atual</span></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-gray-400">Despesas</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs number-font text-gray-500">{formatCurrency(prevExpense)}</span>
                  <span className="text-xs text-gray-600">→</span>
                  <span className="text-xs number-font text-accent-red font-medium">{formatCurrency(recentExpense)}</span>
                </div>
              </div>
              <div className="flex gap-1 h-4">
                <div className="bg-accent-red/20 rounded-l-md transition-all duration-1000" style={{ width: `${Math.max(recentExpense, prevExpense) > 0 ? (prevExpense / Math.max(recentExpense, prevExpense)) * 100 : 0}%` }}>
                  <div className="h-full bg-accent-red/40 rounded-l-md" />
                </div>
                <div className="bg-accent-red rounded-r-md transition-all duration-1000" style={{ width: `${Math.max(recentExpense, prevExpense) > 0 ? (recentExpense / Math.max(recentExpense, prevExpense)) * 100 : 0}%` }} />
              </div>
            </div>
            <div className="pt-3 border-t border-white/[0.04]">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Saldo</span>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold number-font ${recentBalance >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                    {recentBalance >= 0 ? '+' : ''}{formatCurrency(recentBalance)}
                  </span>
                  <span className={`badge-premium text-[10px] ${balanceChange >= 0 ? 'badge-success' : 'badge-danger'}`}>
                    {balanceChange >= 0 ? '+' : ''}{balanceChange.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
              </motion.div>
              )}

              {/* Macro Indicators */}
              {sectionId === 'macro-indicators' && (
              <motion.div variants={itemVariants} className="mb-8">
                <MacroIndicators />
              </motion.div>
              )}

              {/* Content Grid */}
              {sectionId === 'content-grid' && (
              <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6">
        <div className="lg:col-span-2 flex flex-col gap-5 z-10">
          {/* Transações Recentes */}
          <div className="card-premium flex flex-col h-[400px] sm:h-[500px] z-10 relative">
            <div className="p-5 border-b border-white/[0.04] shrink-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-accent-indigo/20 flex items-center justify-center border border-primary/10">
                    <BarChart3 className="w-4 h-4 text-primary-lighter" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Transações do Período</h3>
                    <p className="text-xs text-gray-500">{filteredTransactions.length} total</p>
                  </div>
                </div>
                <div className="relative w-full sm:w-auto">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar transação..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-64 bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors focus:bg-white/10"
                  />
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar divide-y divide-white/[0.03]">
              {displayedTransactions.length === 0 ? (
                <div className="p-12 text-center h-full flex flex-col justify-center">
                  <Wallet className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">Nenhuma transação registrada</p>
                  <button
                    onClick={() => { setEditingTransaction(null); setShowModal(true) }}
                    className="btn-primary text-sm mt-4"
                  >
                    Registrar Primeira
                  </button>
                </div>
              ) : (
                <>
                  {displayedTransactions.map((tx, index) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02] transition-colors duration-200 group"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.type === 'income'
                          ? 'bg-accent-green/10 text-accent-green'
                          : 'bg-accent-red/10 text-accent-red'
                          }`}>
                          {tx.type === 'income'
                            ? <ArrowUpRight className="w-4 h-4" />
                            : <ArrowDownRight className="w-4 h-4" />
                          }
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{tx.description}</p>
                          <p className="text-xs text-gray-500">{tx.category} • {formatDate(tx.created_at)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-3 shrink-0">
                        <span className={`text-xs sm:text-sm font-semibold number-font ${tx.type === 'income' ? 'text-accent-green' : 'text-accent-red'}`}>
                          {tx.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(tx.amount))}
                        </span>
                        <button
                          onClick={() => handleEdit(tx)}
                          title="Editar"
                          className="p-1.5 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors lg:opacity-0 lg:group-hover:opacity-100"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(tx)}
                          disabled={duplicating === tx.id}
                          title="Duplicar"
                          className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors lg:opacity-0 lg:group-hover:opacity-100 hidden sm:block"
                        >
                          {duplicating === tx.id ? (
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(tx.id)}
                          disabled={deleting === tx.id}
                          title="Excluir"
                          className="p-1.5 text-gray-500 hover:text-accent-red hover:bg-accent-red/10 rounded-lg transition-colors lg:opacity-0 lg:group-hover:opacity-100"
                        >
                          {deleting === tx.id ? (
                            <div className="w-4 h-4 border-2 border-accent-red/20 border-t-accent-red rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}

                  {visibleCount < searchedTransactions.length && (
                    <div className="p-4 text-center">
                      <button
                        onClick={() => setVisibleCount(prev => prev + 10)}
                        className="text-sm text-primary hover:text-primary-light transition-colors py-2 px-4 rounded-lg bg-primary/5 hover:bg-primary/10 border border-primary/20"
                      >
                        Carregar mais transações
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="flex-1 flex flex-col min-h-[400px]">
            <InteractiveNebula />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Exportar Relatórios */}
          <div className="card-premium">
            <div className="p-5 border-b border-white/[0.04]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-purple/20 to-accent-pink/20 flex items-center justify-center border border-accent-purple/10">
                  <FileText className="w-4 h-4 text-accent-purple" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Exportação</h3>
                  <p className="text-xs text-gray-500">Baixar relatórios</p>
                </div>
              </div>
            </div>
            <div className="p-5">
              <ExportReport
                transactions={filteredTransactions}
                assets={assets}
                totalWealth={patrimonio}
                totalIncome={totalIncome}
                totalExpense={totalExpense}
              />
            </div>
          </div>

          <HealthScore />
          <BankAccounts />
        </div>
              </motion.div>
              )}

              {/* Cash Flow Projection */}
              {sectionId === 'cash-flow' && (
              <motion.div variants={itemVariants} className="mt-8">
                <CashFlowChart currentBalance={balance} />
              </motion.div>
              )}

              {/* Bottom Section */}
              {sectionId === 'bottom-charts' && (
              <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6 mt-8">
        <CategoryBreakdown transactions={transactions} />
        <FinancialRadar />
              </motion.div>
              )}

              {/* Extra bottom grid for stats */}
              {sectionId === 'quick-stats' && (
              <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6 mt-8">
        {/* Quick Stats */}
        <div className="card-premium">
          <div className="p-5 border-b border-white/[0.04]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-yellow/20 to-accent-orange/20 flex items-center justify-center border border-accent-yellow/10">
                <Target className="w-4 h-4 text-accent-yellow" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Resumo Financeiro</h3>
                <p className="text-xs text-gray-500">Visão rápida</p>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <Activity className="w-4 h-4 text-primary-lighter" />
                <span className="text-sm text-gray-300">Saldo em Conta</span>
              </div>
              <span className={`text-sm font-bold number-font ${balance >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                {formatCurrency(balance)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-4 h-4 text-accent-purple" />
                <span className="text-sm text-gray-300">Lucro Investimentos</span>
              </div>
              <span className={`text-sm font-bold number-font ${investmentProfit >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                {formatCurrency(investmentProfit)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <PieChart className="w-4 h-4 text-accent-orange" />
                <span className="text-sm text-gray-300">Nº de Ativos</span>
              </div>
              <span className="text-sm font-bold number-font text-white">
                {assets.length}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-accent-yellow" />
                <span className="text-sm text-gray-300">Transações (30d)</span>
              </div>
              <span className="text-sm font-bold number-font text-white">
                {transactions.filter(t => new Date(t.created_at) >= thirtyDaysAgo).length}
              </span>
            </div>

            {/* Margem de Lucro */}
            <div className="pt-4 mt-2 border-t border-white/[0.04]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">Margem de Lucro</span>
                <span className={`text-sm font-bold number-font ${balance >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                  {totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : '0'}%
                </span>
              </div>
              <div className="h-2 bg-dark-bg rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000 bg-gradient-to-r from-primary to-accent-green"
                  style={{ width: `${Math.min(Math.max(totalIncome > 0 ? (balance / totalIncome) * 100 : 0, 0), 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
              )}
            </SortableItem>
          ))}
        </SortableContext>
      </DndContext>

      {/* Achievements / Gamificação */}
      <motion.div variants={itemVariants} className="mt-8">
        <Achievements />
      </motion.div>

      {/* NEXUS COMMAND CENTER */}
      <motion.div variants={itemVariants} className="mt-8 mb-4" id="tour-command-center">
        <div className="flex items-center gap-2 mb-4 px-1">
          <div className="w-1.5 h-4 bg-primary rounded-full animate-pulse" />
          <h2 className="text-sm font-bold text-white tracking-widest uppercase font-mono">Nexus Command Center</h2>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent ml-4" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <NeuralGraph />
          <TerminalEngine />
          <QuantumSimulator />
        </div>
      </motion.div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingTransaction(null) }}
        onSuccess={loadData}
        editingTransaction={editingTransaction}
      />
    </motion.div>
  )
}
