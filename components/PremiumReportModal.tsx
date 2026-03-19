'use client'

import { useState } from 'react'
import { X, FileDown, Lock, ShieldCheck } from 'lucide-react'

export default function PremiumReportModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [generating, setGenerating] = useState(false)

  if (!isOpen) return null

  const handleGenerate = () => {
    setGenerating(true)
    setTimeout(() => {
      setGenerating(false)
      onClose()
      alert("Relatório Elite gerado e baixado em PDF com sucesso! (Fluxo Simulado)")
    }, 2500)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-dark-card w-full max-w-2xl rounded-2xl border border-dark-border shadow-2xl overflow-hidden relative">
        {/* Top Strip */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent-purple to-primary" />
        
        <div className="p-6 border-b border-dark-border flex justify-between items-center bg-dark-bg/30">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-gray-400" /> Relatório Elite "Tear Sheet"
            </h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white bg-dark-bg rounded-lg transition-colors border border-transparent hover:border-dark-border">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gradient-to-r from-dark-bg to-dark-card p-5 rounded-xl border border-dark-border/50 text-center relative overflow-hidden flex flex-col items-center">
             <div className="absolute -right-4 -top-8 opacity-5">
               <ShieldCheck className="w-40 h-40" />
             </div>
             
             <ShieldCheck className="w-10 h-10 text-primary mb-3 relative z-10" />
             
             <p className="text-gray-300 text-sm mb-5 leading-relaxed relative z-10 max-w-lg">
               Este gerador compilará todo o seu portfólio de ações, criptos, dividendos e ativos alternativos em um PDF confidencial estilizado como uma carta mensal de Hedge Fund. Ideal para controles de Family Office.
             </p>
             
             <div className="flex justify-center gap-2 relative z-10">
                <span className="px-3 py-1 bg-dark-card border border-dark-border text-xs rounded text-gray-500 font-mono tracking-widest uppercase">Strictly Confidential</span>
                <span className="px-3 py-1 bg-dark-card border border-dark-border text-xs rounded text-gray-500 font-mono tracking-widest uppercase">Internal Use Only</span>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center gap-4 p-4 border border-primary/30 bg-primary/5 rounded-xl cursor-pointer hover:bg-primary/10 transition-colors">
              <input type="checkbox" defaultChecked className="accent-primary w-5 h-5" />
              <div>
                 <p className="text-white font-medium text-sm">Resumo Mensal (1 Pág)</p>
                 <p className="text-xs text-gray-500 mt-1">Métricas pricipais e VaR.</p>
              </div>
            </label>
            <label className="flex items-center gap-4 p-4 border border-dark-border bg-dark-bg rounded-xl cursor-pointer hover:border-gray-600 transition-colors">
              <input type="checkbox" defaultChecked className="accent-primary w-5 h-5" />
              <div>
                 <p className="text-white font-medium text-sm">Desdobramento Completo</p>
                 <p className="text-xs text-gray-500 mt-1">Breakdown de posições abertas.</p>
              </div>
            </label>
          </div>
        </div>

        <div className="p-6 border-t border-dark-border bg-dark-bg/50 flex justify-end gap-3 items-center">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-gray-400 hover:text-white font-medium transition-colors">
            Cancelar
          </button>
          <button 
            onClick={handleGenerate} 
            disabled={generating}
            className="btn-primary flex items-center gap-2 shadow-lg shadow-primary/20 px-6"
          >
            {generating ? (
              <span className="animate-pulse flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Compilando PDF...
              </span>
            ) : (
              <><FileDown className="w-4 h-4" /> Gerar Envelope Seguro</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
