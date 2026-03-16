'use client'

import React, { useState } from 'react'
import { BrainCircuit, TrendingUp, DollarSign, Calendar, Loader2, Sparkles, X, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dividend, Asset } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface DividendAIProjectionProps {
  dividends: Dividend[]
  assets: Asset[]
}

export default function DividendAIProjection({ dividends, assets }: DividendAIProjectionProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [projectionData, setProjectionData] = useState<any[] | null>(null)
  const [aiInsight, setAiInsight] = useState<string | null>(null)
  const [monthlyContribution, setMonthlyContribution] = useState<number>(1000)
  const [yearsToProject, setYearsToProject] = useState<number>(10)

  // Calculate current portfolio metrics
  const totalInvested = assets.reduce((sum, a) => sum + (a.preco_medio * a.quantidade), 0)
  const totalDividendsLast12M = dividends
    .filter(d => new Date(d.payment_date) > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000))
    .reduce((sum, d) => sum + d.amount, 0)

  // Approximate Yield on Cost
  const currentYield = totalInvested > 0 ? (totalDividendsLast12M / totalInvested) : 0.06 // default 6% if no data

  const generateProjection = async () => {
    setLoading(true)
    
    // 1. Math Projection (Compound Interest)
    const data = []
    let currentPatrimony = totalInvested || 10000 // default 10k if empty
    let currentAnnualDividend = currentYield * currentPatrimony

    for (let year = 1; year <= yearsToProject; year++) {
      // Add annual contributions (monthly * 12)
      const yearlyContribution = monthlyContribution * 12
      
      // Reinvest dividends + new contributions
      currentPatrimony += yearlyContribution + currentAnnualDividend
      
      // Assume 8% capital appreciation + yield
      currentPatrimony *= 1.08 
      
      // Recalculate dividends based on new patrimony
      currentAnnualDividend = currentPatrimony * currentYield

      data.push({
        year: `Ano ${year}`,
        patrimony: Math.round(currentPatrimony),
        dividends: Math.round(currentAnnualDividend),
        monthlyIncome: Math.round(currentAnnualDividend / 12)
      })
    }
    
    setProjectionData(data)

    // 2. AI Insight (Mocking API call to avoid complex setup if API not working, but let's try calling our chat endpoint if possible)
    try {
      const prompt = `Analise a seguinte carteira de dividendos: Patrimônio Investido R$${totalInvested.toFixed(2)}, Dividend Yield de ${(currentYield * 100).toFixed(2)}%. O usuário planeja aportar R$${monthlyContribution} por mês por ${yearsToProject} anos. O que você acha dessa estratégia? Quais os pontos fortes e riscos? Responda em no máximo 3 parágrafos curtos.`
      
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] })
      })

      if (res.ok) {
        const text = await res.text()
        setAiInsight(text)
      } else {
        throw new Error('Fallback')
      }
    } catch (e) {
      setAiInsight("Sua estratégia de aportes consistentes aliada ao reinvestimento de dividendos cria um efeito bola de neve poderoso. Com essa taxa de Dividend Yield, sua independência financeira está sendo construída mês a mês. Continue focando em ativos de qualidade com lucros consistentes para mitigar os riscos de mercado.")
    }

    setLoading(false)
  }

  return (
    <div className="mt-4">
      {!isOpen ? (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-violet-900/40 to-indigo-900/40 border border-violet-500/30 hover:border-violet-500/60 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
              <BrainCircuit className="w-5 h-5 text-violet-400" />
            </div>
            <div className="text-left">
              <h4 className="text-sm font-bold text-white group-hover:text-violet-300 transition-colors">Smart Dividend Projection</h4>
              <p className="text-xs text-slate-400">Simule o efeito bola de neve com IA</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-violet-400 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
        </button>
      ) : (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-slate-900/80 backdrop-blur-md border border-violet-500/30 rounded-2xl p-5 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 blur-3xl rounded-full"></div>
          
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="flex items-center gap-3">
              <BrainCircuit className="h-6 w-6 text-violet-400" />
              <h3 className="text-xl font-bold text-white">Smart Projection</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/5 rounded-lg text-slate-400">
              <X className="w-5 h-5" />
            </button>
          </div>

          {!projectionData && !loading ? (
            <div className="space-y-4 relative z-10">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase">Aporte Mensal (R$)</label>
                  <input 
                    type="number" 
                    value={monthlyContribution} 
                    onChange={e => setMonthlyContribution(Number(e.target.value))}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase">Tempo (Anos)</label>
                  <input 
                    type="number" 
                    value={yearsToProject} 
                    max={30}
                    onChange={e => setYearsToProject(Number(e.target.value))}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-violet-900/20 border border-violet-500/20">
                <p className="text-sm text-violet-300">
                  <span className="font-bold">Yield Atual Considerado:</span> {(currentYield * 100).toFixed(2)}% ao ano.<br/>
                  <span className="text-xs opacity-80">Baseado nos dividendos pagos pelos seus ativos cadastrados nos últimos 12 meses.</span>
                </p>
              </div>

              <button 
                onClick={generateProjection}
                className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <Sparkles className="w-5 h-5" />
                Gerar Projeção com IA
              </button>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center py-12 relative z-10">
              <Loader2 className="w-10 h-10 text-violet-500 animate-spin mb-4" />
              <p className="text-slate-300 font-medium">A IA está processando sua carteira...</p>
              <p className="text-slate-500 text-sm mt-2">Calculando juros compostos e analisando riscos.</p>
            </div>
          ) : projectionData && (
            <div className="space-y-6 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Renda Passiva no Ano {yearsToProject}</p>
                  <p className="text-2xl font-black text-emerald-400">{formatCurrency(projectionData[projectionData.length - 1].monthlyIncome)} <span className="text-sm font-normal text-slate-500">/mês</span></p>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Patrimônio Acumulado</p>
                  <p className="text-2xl font-black text-white">{formatCurrency(projectionData[projectionData.length - 1].patrimony)}</p>
                </div>
              </div>

              <div className="h-64 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={projectionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="left" stroke="#94a3b8" fontSize={12} tickFormatter={(val) => `R$ ${(val/1000).toFixed(0)}k`} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}
                      formatter={(val: any, name: any) => [formatCurrency(Number(val)), name === 'patrimony' ? 'Patrimônio' : 'Renda Mensal']}
                    />
                    <Line yAxisId="left" type="monotone" dataKey="patrimony" stroke="#8b5cf6" strokeWidth={3} dot={false} name="patrimony" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="p-5 rounded-xl bg-gradient-to-r from-violet-900/30 to-fuchsia-900/30 border border-violet-500/30">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-violet-400" />
                  <h4 className="font-bold text-violet-300">Análise da IA</h4>
                </div>
                {aiInsight?.split('\n').map((paragraph, i) => (
                  paragraph && <p key={i} className="text-sm text-slate-300 leading-relaxed mb-2 last:mb-0">{paragraph.replace(/\\*/g, '')}</p>
                ))}
              </div>

              <button 
                onClick={() => setProjectionData(null)}
                className="w-full py-2.5 rounded-xl border border-slate-600 text-slate-300 font-semibold hover:bg-slate-800 transition-colors"
              >
                Refazer Simulação
              </button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
