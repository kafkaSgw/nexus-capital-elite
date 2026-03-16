'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap, UtensilsCrossed, Car, Briefcase, PiggyBank, TrendingUp,
  Home, Wifi, ShoppingBag, GraduationCap, Plus, X, ToggleLeft, ToggleRight,
  Sparkles, ArrowRight, RefreshCw
} from 'lucide-react'
import { getTransactions, getAssets, Transaction, Asset } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'

interface ScenarioCard {
  id: string
  icon: any
  label: string
  description: string
  type: 'save' | 'earn'
  monthlyImpact: number
  enabled: boolean
  color: string
}

const DEFAULT_SCENARIOS: Omit<ScenarioCard, 'enabled'>[] = [
  { id: 'delivery', icon: UtensilsCrossed, label: 'Cortar Delivery 50%', description: 'Cozinhar mais em casa', type: 'save', monthlyImpact: 400, color: 'text-orange-400' },
  { id: 'streaming', icon: Wifi, label: 'Cancelar Streaming Extra', description: 'Manter só 1 serviço', type: 'save', monthlyImpact: 80, color: 'text-purple-400' },
  { id: 'transport', icon: Car, label: 'Usar Transporte Público', description: 'Trocar uber por ônibus/metrô', type: 'save', monthlyImpact: 600, color: 'text-blue-400' },
  { id: 'shopping', icon: ShoppingBag, label: 'Reduzir Compras 30%', description: 'Compras mais conscientes', type: 'save', monthlyImpact: 350, color: 'text-pink-400' },
  { id: 'invest', icon: TrendingUp, label: 'Investir +R$500/mês', description: 'Reforçar aportes mensais', type: 'earn', monthlyImpact: 500, color: 'text-emerald-400' },
  { id: 'freelance', icon: Briefcase, label: 'Renda Extra Freelance', description: 'Projetos aos finais de semana', type: 'earn', monthlyImpact: 1500, color: 'text-cyan-400' },
  { id: 'rent', icon: Home, label: 'Mudar para Aluguel Menor', description: 'Economizar no aluguel', type: 'save', monthlyImpact: 800, color: 'text-amber-400' },
  { id: 'study', icon: GraduationCap, label: 'Curso + Promoção', description: 'Investir em carreira (+20%)', type: 'earn', monthlyImpact: 2000, color: 'text-indigo-400' },
]

export default function WhatIfSimulator() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)

  // Initialize from localStorage if exists, otherwise DEFAULT_SCENARIOS
  const [scenarios, setScenarios] = useState<ScenarioCard[]>([])

  const [customName, setCustomName] = useState('')
  const [customValue, setCustomValue] = useState('')
  const [customType, setCustomType] = useState<'save' | 'earn'>('save')
  const [showCustom, setShowCustom] = useState(false)

  // Load scenarios on mount
  useEffect(() => {
    const savedScenarios = localStorage.getItem('nexus_whatif_scenarios')
    if (savedScenarios) {
      try {
        const parsed = JSON.parse(savedScenarios)
        // Restore icons which are lost/mangled in JSON stringification
        const restored = parsed.map((s: any) => {
          const defaultRef = DEFAULT_SCENARIOS.find(d => d.id === s.id)
          return {
            ...s,
            icon: defaultRef ? defaultRef.icon : Sparkles
          }
        })
        setScenarios(restored)
      } catch (e) {
        console.error('Failed to parse scenarios:', e)
        setScenarios(DEFAULT_SCENARIOS.map(s => ({ ...s, enabled: false })))
      }
    } else {
      setScenarios(DEFAULT_SCENARIOS.map(s => ({ ...s, enabled: false })))
    }
  }, [])

  // Save to localStorage whenever scenarios change
  useEffect(() => {
    if (scenarios.length > 0) {
      // Omit the icon object to prevent NextJS hydration errors/JSON circular issues
      const cleanToSave = scenarios.map(({ icon, ...rest }) => rest)
      localStorage.setItem('nexus_whatif_scenarios', JSON.stringify(cleanToSave))
    }
  }, [scenarios])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [tx, ast] = await Promise.all([getTransactions(), getAssets()])
      setTransactions(tx)
      setAssets(ast)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const toggleScenario = (id: string) => {
    setScenarios(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s))
  }

  const addCustomScenario = () => {
    if (!customName || !customValue) return
    const newScenario: ScenarioCard = {
      id: `custom-${Date.now()}`,
      icon: Sparkles,
      label: customName,
      description: 'Cenário personalizado',
      type: customType,
      monthlyImpact: parseFloat(customValue),
      enabled: true,
      color: 'text-yellow-400'
    }
    setScenarios(prev => [...prev, newScenario])
    setCustomName('')
    setCustomValue('')
    setShowCustom(false)
  }

  const removeScenario = (id: string) => {
    setScenarios(prev => prev.filter(s => s.id !== id))
  }

  const resetAll = () => {
    setScenarios(DEFAULT_SCENARIOS.map(s => ({ ...s, enabled: false })))
  }

  const projection = useMemo(() => {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000)
    const recent = transactions.filter(t => new Date(t.created_at) >= thirtyDaysAgo)

    const monthlyIncome = recent.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0) || 5000
    const monthlyExpense = recent.filter(t => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount), 0) || 3000
    const monthlySaving = monthlyIncome - monthlyExpense

    const totalAssets = assets.reduce((s, a) => s + a.preco_atual * a.quantidade, 0)
    const totalBalance = transactions.reduce((s, t) => s + (t.type === 'income' ? t.amount : -Math.abs(t.amount)), 0)
    const currentWealth = totalBalance + totalAssets

    const enabledScenarios = scenarios.filter(s => s.enabled)
    const totalSaved = enabledScenarios.filter(s => s.type === 'save').reduce((s, sc) => s + sc.monthlyImpact, 0)
    const totalEarned = enabledScenarios.filter(s => s.type === 'earn').reduce((s, sc) => s + sc.monthlyImpact, 0)
    const extraMonthly = totalSaved + totalEarned

    const months = 12
    const monthlyReturn = 0.01 // 1% a.m. estimated return

    const currentPath: number[] = []
    const simulatedPath: number[] = []
    let cBal = currentWealth
    let sBal = currentWealth

    for (let i = 0; i <= months; i++) {
      currentPath.push(cBal)
      simulatedPath.push(sBal)
      cBal += monthlySaving
      cBal += cBal * monthlyReturn * (i > 0 ? 1 : 0)
      sBal += monthlySaving + extraMonthly
      sBal += sBal * monthlyReturn * (i > 0 ? 1 : 0)
    }

    const diff = simulatedPath[months] - currentPath[months]

    return {
      currentPath, simulatedPath, diff, extraMonthly,
      monthlySaving, monthlyIncome, monthlyExpense,
      finalSimulated: simulatedPath[months],
      finalCurrent: currentPath[months]
    }
  }, [transactions, assets, scenarios])

  // SVG chart
  const allValues = [...projection.currentPath, ...projection.simulatedPath]
  const maxV = Math.max(...allValues)
  const minV = Math.min(...allValues)
  const range = maxV - minV || 1
  const chartH = 140
  const chartW = 100

  const toPath = (data: number[]) =>
    data.map((v, i) => {
      const x = (i / (data.length - 1)) * chartW
      const y = chartH - ((v - minV) / range) * (chartH - 16)
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
    }).join(' ')

  const toArea = (data: number[]) =>
    `${toPath(data)} L ${chartW} ${chartH} L 0 ${chartH} Z`

  const enabledCount = scenarios.filter(s => s.enabled).length

  if (loading) {
    return <div className="card-premium p-6 loading-shimmer h-[400px]" />
  }

  return (
    <div className="card-premium overflow-visible">
      {/* Header */}
      <div className="p-6 border-b border-white/[0.04]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-xl flex items-center justify-center border border-violet-500/20">
              <Zap className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Simulador &quot;E se...&quot;</h3>
              <p className="text-sm text-gray-400">
                {enabledCount === 0 ? 'Ative cenários para ver o impacto' : `${enabledCount} cenário${enabledCount > 1 ? 's' : ''} ativo${enabledCount > 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCustom(!showCustom)}
              className="p-2 text-gray-400 hover:text-violet-400 hover:bg-violet-500/10 rounded-lg transition-colors"
              title="Adicionar cenário"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={resetAll}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Resetar tudo"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Custom Scenario Input */}
        <AnimatePresence>
          {showCustom && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-3">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Cenário Personalizado</p>
                <div className="flex gap-2">
                  <input
                    value={customName}
                    onChange={e => setCustomName(e.target.value)}
                    placeholder="Ex: Cancelar academia"
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50"
                  />
                  <input
                    type="number"
                    value={customValue}
                    onChange={e => setCustomValue(e.target.value)}
                    placeholder="R$/mês"
                    className="w-28 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCustomType('save')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${customType === 'save' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-gray-400 border border-white/10'}`}
                    >
                      💰 Economizar
                    </button>
                    <button
                      onClick={() => setCustomType('earn')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${customType === 'earn' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-white/5 text-gray-400 border border-white/10'}`}
                    >
                      📈 Ganhar Mais
                    </button>
                  </div>
                  <button onClick={addCustomScenario} className="px-4 py-1.5 bg-violet-500/20 text-violet-400 border border-violet-500/30 rounded-lg text-xs font-medium hover:bg-violet-500/30 transition-colors">
                    Adicionar
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scenario Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {scenarios.map(sc => {
            const Icon = sc.icon || Sparkles
            return (
              <motion.button
                key={sc.id}
                onClick={() => toggleScenario(sc.id)}
                whileTap={{ scale: 0.97 }}
                className={`relative flex items-center gap-3 p-3.5 rounded-xl text-left transition-all duration-300 group ${sc.enabled
                  ? 'bg-white/[0.06] border border-violet-500/30 shadow-[0_0_20px_rgba(139,92,246,0.08)]'
                  : 'bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12]'
                  }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${sc.enabled ? 'bg-violet-500/15' : 'bg-white/[0.04]'}`}>
                  <Icon className={`w-4 h-4 ${sc.enabled ? sc.color : 'text-gray-500'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${sc.enabled ? 'text-white' : 'text-gray-300'}`}>{sc.label}</p>
                  <p className="text-xs text-gray-500 truncate">{sc.description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs font-bold number-font ${sc.type === 'save' ? 'text-emerald-400' : 'text-cyan-400'}`}>
                    {sc.type === 'save' ? '-' : '+'}R${sc.monthlyImpact}
                  </span>
                  {sc.enabled
                    ? <ToggleRight className="w-5 h-5 text-violet-400" />
                    : <ToggleLeft className="w-5 h-5 text-gray-600" />
                  }
                </div>
                <button
                  onClick={e => { e.stopPropagation(); removeScenario(sc.id) }}
                  className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-red-500/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Apagar cenário"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </motion.button>
            )
          })}
        </div>

        {/* Projection Chart */}
        <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.04]">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-3">Projeção 12 Meses</p>
          <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-36" preserveAspectRatio="none">
            {/* Grid lines */}
            {[0.25, 0.5, 0.75].map(pct => (
              <line key={pct} x1="0" y1={chartH * pct} x2={chartW} y2={chartH * pct} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
            ))}
            {/* Current area */}
            <path d={toArea(projection.currentPath)} fill="rgba(100,116,139,0.08)" />
            {/* Simulated area */}
            {enabledCount > 0 && (
              <path d={toArea(projection.simulatedPath)} fill="url(#whatif-grad)" opacity="0.4" />
            )}
            {/* Current line */}
            <path d={toPath(projection.currentPath)} fill="none" stroke="#64748B" strokeWidth="1.5" strokeDasharray="4 3" />
            {/* Simulated line */}
            {enabledCount > 0 && (
              <path d={toPath(projection.simulatedPath)} fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" />
            )}
            <defs>
              <linearGradient id="whatif-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
          <div className="flex items-center gap-4 mt-2 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-0.5 bg-gray-500" style={{ borderTop: '2px dashed #64748b' }} />
              <span className="text-gray-400">Cenário Atual</span>
            </div>
            {enabledCount > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-0.5 bg-violet-500 rounded" />
                <span className="text-gray-400">Com Mudanças</span>
              </div>
            )}
          </div>
        </div>

        {/* Impact Summary */}
        <AnimatePresence>
          {enabledCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-3 gap-3"
            >
              <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15 text-center">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Extra/Mês</p>
                <p className="text-base font-bold text-emerald-400 number-font">
                  +{formatCurrency(projection.extraMonthly)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-violet-500/5 border border-violet-500/15 text-center">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Ganho em 12 Meses</p>
                <p className="text-base font-bold text-violet-400 number-font">
                  +{formatCurrency(projection.diff)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/15 text-center">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Patrimônio Final</p>
                <p className="text-base font-bold text-cyan-400 number-font">
                  {formatCurrency(projection.finalSimulated)}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {enabledCount === 0 && (
          <div className="text-center py-2">
            <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
              <ArrowRight className="w-4 h-4" /> Ative cenários acima para ver a projeção
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
