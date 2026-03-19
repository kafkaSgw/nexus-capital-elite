'use client'

import { useState } from 'react'
import { Flame, Info } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function FIRECalculator({ patrimony = 1000000 }: { patrimony?: number }) {
  const [mensal, setMensal] = useState(30000)
  const [aporte, setAporte] = useState(10000)
  const [txJuros, setTxJuros] = useState(6) // 6% real acima inflação

  // FIRE Number (Regra dos 4% => 300x custo mensal)
  const fireNumber = mensal * 300 
  
  let years = 0
  let currentSim = patrimony
  const monthlyRate = (txJuros / 100) / 12

  if (currentSim < fireNumber) {
     while (currentSim < fireNumber && years < 60) {
        let yearBalance = currentSim
        for (let i = 0; i < 12; i++) {
           yearBalance = yearBalance * (1 + monthlyRate) + aporte
        }
        currentSim = yearBalance
        years++
     }
  }

  const reached = years === 0

  return (
    <div className="card-premium p-6 md:p-8 animate-fade-in relative overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent-red/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
            <Flame className="w-6 h-6 text-accent-red" /> Simulador FIRE & Aposentadoria
          </h2>
          <p className="text-gray-400 mt-1 text-sm">Monte Carlo Lite: Calcule o rastro patrimonial para independência financeira.</p>
        </div>
        <div className="bg-dark-bg p-3 px-4 flex items-center gap-3 rounded-xl border border-dark-border/50">
           <span className="text-xs text-gray-500 font-medium">Patrimônio Base:</span>
           <span className="font-bold text-white number-font text-lg">{formatCurrency(patrimony)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        {/* Controles */}
        <div className="space-y-6 lg:col-span-1 bg-dark-card/50 p-6 rounded-2xl border border-dark-border/50">
          <div>
            <label className="text-sm font-medium text-gray-300 block mb-2">Custo de Vida Desejado (Mês)</label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">R$</span>
              <input 
                type="number" 
                value={mensal}
                onChange={(e) => setMensal(Number(e.target.value))}
                className="w-full bg-dark-bg border border-dark-border text-white font-bold rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-accent-red/50 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-300 block mb-2">Aporte Mensal Atual</label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">R$</span>
              <input 
                type="number" 
                value={aporte}
                onChange={(e) => setAporte(Number(e.target.value))}
                className="w-full bg-dark-bg border border-dark-border text-white font-bold rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-accent-red/50 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-300 block mb-2">Lucro Real Anual (Acima da Inflação)</label>
            <div className="flex items-center gap-4 bg-dark-bg border border-dark-border py-2 px-4 rounded-xl">
              <input 
                type="range" 
                min="2" max="15" step="0.5"
                value={txJuros}
                onChange={(e) => setTxJuros(Number(e.target.value))}
                className="flex-1 accent-accent-red h-2 rounded-lg"
              />
              <span className="text-white font-bold w-12 text-right">{txJuros}%</span>
            </div>
          </div>
        </div>

        {/* Resultados */}
        <div className="lg:col-span-2 bg-gradient-to-b from-dark-card to-dark-bg rounded-2xl border border-dark-border p-6 md:p-8 flex flex-col justify-between shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-dark-bg/50 p-4 rounded-xl border border-dark-border/30">
               <p className="text-gray-400 text-sm mb-1 uppercase tracking-wider font-semibold">Teto Mágico (Número FIRE)</p>
               <p className="text-3xl font-bold text-white number-font">{formatCurrency(fireNumber)}</p>
               <p className="text-xs text-gray-500 mt-2 flex items-center gap-1.5 bg-dark-bg px-2 py-1 rounded w-fit border border-dark-border">
                 <Info className="w-3 h-3" /> Regra de Saque Seguro de 4%
               </p>
            </div>
            <div className="bg-dark-bg/50 p-4 rounded-xl border border-dark-border/30">
               <p className="text-gray-400 text-sm mb-1 uppercase tracking-wider font-semibold">Tempo até Liberdade</p>
               {reached ? (
                 <p className="text-3xl font-bold text-accent-green">Atingido! 🎉</p>
               ) : (
                 <p className="text-3xl font-bold text-accent-red">{years} <span className="text-xl text-gray-400 font-normal">anos</span></p>
               )}
               <p className="text-xs text-gray-500 mt-2">
                 Cruzamento em {new Date().getFullYear() + years}
               </p>
            </div>
          </div>

          {/* Mini Chart Mock for Monte Carlo visually */}
          <div className="relative h-40 w-full border-b-2 border-l-2 border-dark-border/80 mt-2 overflow-hidden bg-dark-bg/20 rounded-bl-lg">
             {/* FI Line */}
             <div className="absolute top-[30%] w-full border-t border-dashed border-gray-500"></div>
             <div className="absolute top-[18%] right-2 bg-dark-card/80 backdrop-blur-sm border border-dark-border px-2 py-1 rounded">
                <span className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">Meta FIRE</span>
             </div>
             
             {/* Growth Curve */}
             <svg className="absolute bottom-0 left-0 w-full h-[85%]" preserveAspectRatio="none" viewBox="0 0 100 100">
                <path d={reached ? "M 0 30 Q 50 20, 100 10" : "M 0 100 Q 60 80, 100 30"} fill="none" stroke="url(#fireGradient)" strokeWidth="4" className="drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                <defs>
                  <linearGradient id="fireGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity="1" />
                  </linearGradient>
                </defs>
             </svg>
             
             {/* Intersection dot */}
             {!reached ? (
                <div className="absolute top-[30%] right-[0%] -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-4 border-accent-red shadow-[0_0_15px_#ef4444] animate-pulse" />
             ) : (
                <div className="absolute top-[30%] left-[20%] -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-4 border-accent-green shadow-[0_0_15px_#22c55e]" />
             )}

             {/* Year Labels */}
             <div className="absolute bottom-1 right-2 text-[10px] text-gray-600 font-mono">{new Date().getFullYear() + years}</div>
             <div className="absolute bottom-1 w-full border-b border-white/5 opacity-50" style={{bottom: '20%'}}></div>
             <div className="absolute bottom-1 w-full border-b border-white/5 opacity-50" style={{bottom: '40%'}}></div>
             <div className="absolute bottom-1 w-full border-b border-white/5 opacity-50" style={{bottom: '60%'}}></div>
             <div className="absolute bottom-1 w-full border-b border-white/5 opacity-50" style={{bottom: '80%'}}></div>
          </div>
        </div>
      </div>
    </div>
  )
}
