'use client'

import { Calculator, ArrowRight, ShieldCheck } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function TaxOptimizer() {
  const stockSalesMonth = 14500
  const limit = 20000
  const remaining = limit - stockSalesMonth
  const percentUsed = (stockSalesMonth / limit) * 100

  return (
    <div className="card-premium">
      <div className="p-6 border-b border-dark-border">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-lg flex items-center gap-2">
            <Calculator className="w-5 h-5 text-accent-purple" />
            Otimizador Tributário
          </h3>
          <span className="text-xs font-medium px-2 py-1 bg-accent-purple/10 text-accent-purple rounded-md border border-accent-purple/20">Smart Tax</span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <div className="flex justify-between items-end mb-2">
            <div>
               <p className="text-sm text-gray-400">Vendas Isentas - Ações</p>
               <p className="text-2xl font-bold text-white number-font mt-1">
                 {formatCurrency(stockSalesMonth)} <span className="text-sm font-normal text-gray-500">/ {formatCurrency(limit)}</span>
               </p>
            </div>
            <div className="text-right">
               <p className="text-sm font-medium text-accent-green mb-1">
                 {formatCurrency(remaining)} restantes
               </p>
            </div>
          </div>
          <div className="h-3 bg-dark-bg rounded-full overflow-hidden border border-dark-border/50">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${percentUsed > 90 ? 'bg-accent-red' : percentUsed > 70 ? 'bg-accent-yellow' : 'bg-primary'}`} 
              style={{ width: `${Math.min(percentUsed, 100)}%` }} 
            />
          </div>
        </div>

        <div className="bg-gradient-to-br from-dark-card to-dark-bg p-4 rounded-xl border border-dark-border hover:border-accent-purple/30 transition-all group">
          <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-accent-green" /> Oportunidade PGBL
          </h4>
          <p className="text-xs text-gray-400 leading-relaxed mb-3">
            Aporte até <strong className="text-gray-300">R$ 12.400</strong> em PGBL até Dezembro de {new Date().getFullYear()} para maximizar sua dedução no IRPF.
          </p>
          <button className="text-primary text-sm font-medium hover:text-primary-lighter flex items-center gap-1 group-hover:gap-2 transition-all">
            Simular aporte detalhado <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
