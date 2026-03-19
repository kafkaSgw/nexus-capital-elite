'use client'

import { Globe, DollarSign, Euro, MapPin } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function GlobalAllocationMap({ totalInvestido = 5000000 }: { totalInvestido?: number }) {
  const regions = [
    { name: 'América do Norte', percentage: 45, value: totalInvestido * 0.45, color: 'bg-primary' },
    { name: 'Brasil & LatAm', percentage: 40, value: totalInvestido * 0.40, color: 'bg-accent-green' },
    { name: 'Europa', percentage: 10, value: totalInvestido * 0.10, color: 'bg-accent-purple' },
    { name: 'Ásia & Emergentes', percentage: 5, value: totalInvestido * 0.05, color: 'bg-accent-yellow' },
  ]

  const currencies = [
    { name: 'Dólar Americano (USD)', percentage: 48, value: totalInvestido * 0.48, icon: DollarSign, color: 'text-primary' },
    { name: 'Real Brasileiro (BRL)', percentage: 40, value: totalInvestido * 0.40, icon: MapPin, color: 'text-accent-green' },
    { name: 'Euro (EUR)', percentage: 10, value: totalInvestido * 0.10, icon: Euro, color: 'text-accent-purple' },
    { name: 'Multimoedas (MIX)', percentage: 2, value: totalInvestido * 0.02, icon: Globe, color: 'text-accent-yellow' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card-premium p-6 md:p-8 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
              <Globe className="w-6 h-6 text-primary" /> Visão Geográfica & Câmbio
            </h2>
            <p className="text-gray-400 mt-1">Exposição do portfólio por região global e moedas fortes.</p>
          </div>
          <div className="bg-dark-bg p-4 rounded-xl border border-dark-border/50 text-right">
             <p className="text-xs text-gray-400">Patrimônio Base</p>
             <p className="text-xl font-bold text-white number-font">{formatCurrency(totalInvestido)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
          {/* Regiões */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wider">Alocação Geográfica</h3>
            <div className="space-y-4">
               {regions.map((region) => (
                 <div key={region.name} className="bg-dark-card p-4 rounded-xl border border-dark-border/50 hover:border-dark-border transition-colors group">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-white font-medium group-hover:text-primary transition-colors">{region.name}</span>
                       <span className="text-gray-300 number-font text-sm">{formatCurrency(region.value)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                       <div className="flex-1 h-2 bg-dark-bg rounded-full overflow-hidden border border-dark-border/30">
                          <div className={`h-full ${region.color} rounded-full transition-all duration-1000`} style={{ width: `${region.percentage}%` }} />
                       </div>
                       <span className="text-sm font-bold text-white w-10 text-right">{region.percentage}%</span>
                    </div>
                 </div>
               ))}
            </div>
          </div>

          {/* Moedas */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wider">Exposição Cambial</h3>
            <div className="space-y-4">
               {currencies.map((curr) => {
                 const Icon = curr.icon
                 return (
                 <div key={curr.name} className="flex items-center justify-between p-4 bg-dark-card rounded-xl border border-dark-border/50 group hover:border-dark-border transition-colors">
                    <div className="flex items-center gap-3">
                       <div className={`w-10 h-10 rounded-full bg-dark-bg flex items-center justify-center border border-dark-border/50 ${curr.color}`}>
                          <Icon className="w-5 h-5" />
                       </div>
                       <div>
                          <p className="text-white font-medium group-hover:text-primary transition-colors">{curr.name}</p>
                          <p className="text-xs text-gray-500">{curr.percentage}% do portfólio líquido</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-white font-bold number-font">{formatCurrency(curr.value)}</p>
                    </div>
                 </div>
               )})}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
