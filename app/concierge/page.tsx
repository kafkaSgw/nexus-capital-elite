'use client'

import { Plane, Star, CreditCard, ShieldCheck, Wine, Crown } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function ConciergePage() {
  const miles = [
    { program: 'Livelo', balance: 450000, valuePerMile: 0.035, icon: Star, color: 'text-pink-500' },
    { program: 'Smiles (Gol)', balance: 120000, valuePerMile: 0.015, icon: Plane, color: 'text-orange-500' },
    { program: 'Latam Pass', balance: 85000, valuePerMile: 0.022, icon: Plane, color: 'text-red-500' },
    { program: 'AAdvantage', balance: 45000, valuePerMile: 0.08, icon: Plane, color: 'text-blue-500' },
  ]

  const totalMilesValue = miles.reduce((sum, m) => sum + (m.balance * m.valuePerMile), 0)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in shadow-2xl">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-border pb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Crown className="w-8 h-8 text-accent-yellow" /> Concierge & Lifestyle
          </h1>
          <p className="text-gray-400">
            Gestão consolidada de milhas aéreas, benefícios de viagem e cartões Black/Infinite.
          </p>
        </div>
        <button className="btn-secondary whitespace-nowrap shadow-lg hover:shadow-primary/20">Conectar Novo Programa</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="card-premium p-6 lg:col-span-2 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-64 h-64 bg-accent-yellow/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-accent-yellow/10 transition-colors" />
           <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between mb-6 gap-4">
              <div>
                 <h2 className="text-xl font-bold text-white flex items-center gap-2">Capital em Milhas Aéreas</h2>
                 <p className="text-sm text-gray-400 mt-1">Estimativa de valor do seu patrimônio oculto em viagens.</p>
              </div>
              <div className="sm:text-right bg-dark-bg p-3 rounded-lg border border-dark-border/50">
                 <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Valor de Balcão Estimado</p>
                 <p className="text-3xl font-bold text-accent-yellow number-font">{formatCurrency(totalMilesValue)}</p>
              </div>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
             {miles.map(m => {
               const Icon = m.icon
               return (
               <div key={m.program} className="bg-dark-card p-4 rounded-xl border border-dark-border/50 flex flex-col justify-between hover:border-dark-border transition-all">
                  <div className="flex items-center gap-3 mb-3">
                     <div className="w-10 h-10 bg-dark-bg rounded-full flex items-center justify-center border border-dark-border/50">
                        <Icon className={`w-5 h-5 ${m.color}`} />
                     </div>
                     <div>
                        <p className="text-white font-medium text-sm">{m.program}</p>
                        <p className="text-xs text-gray-500 number-font mt-0.5">{m.balance.toLocaleString('pt-BR')} milhas</p>
                     </div>
                  </div>
                  <div className="text-right pt-2 border-t border-dark-border/50">
                     <span className="text-xs text-gray-500 float-left mt-1 block">Ref: {formatCurrency(m.valuePerMile)}/milha</span>
                     <p className="text-white font-bold text-sm number-font">{formatCurrency(m.balance * m.valuePerMile)}</p>
                  </div>
               </div>
             )})}
           </div>
        </div>

        <div className="card-premium p-6 flex flex-col justify-between">
           <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
                <Wine className="w-5 h-5 text-accent-purple" /> Acessos VIP (Lounges)
              </h2>
              <div className="space-y-5">
                 <div className="flex justify-between items-center pb-3 border-b border-dark-border/50">
                    <span className="text-gray-300 text-sm flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-dark-bg flex items-center justify-center border border-dark-border">
                         <CreditCard className="w-4 h-4 text-primary"/>
                      </div>
                      Visa Infinite
                    </span>
                    <span className="text-accent-green font-bold text-sm bg-accent-green/10 px-2 py-1 rounded">Ilimitado</span>
                 </div>
                 <div className="flex justify-between items-center pb-3 border-b border-dark-border/50">
                    <span className="text-gray-300 text-sm flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-dark-bg flex items-center justify-center border border-dark-border">
                         <CreditCard className="w-4 h-4 text-gray-400"/>
                      </div>
                      Mastercard Black
                    </span>
                    <span className="text-white font-bold text-sm">4 / 6 usáveis</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-dark-bg flex items-center justify-center border border-dark-border">
                         <CreditCard className="w-4 h-4 text-accent-yellow"/>
                      </div>
                      Amex Platinum
                    </span>
                    <span className="text-accent-red font-bold text-sm">Esgotado</span>
                 </div>
              </div>
           </div>
           <button className="w-full btn-primary text-sm mt-6 py-3">Gerar QR Code de Acesso</button>
        </div>
      </div>

      <div className="card-premium p-6 md:p-8">
         <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary" /> Seguros e Coberturas Ativas (Cartões)
         </h2>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-dark-bg p-5 rounded-xl border border-dark-border/50 hover:border-primary/30 transition-all cursor-pointer group">
               <p className="text-white font-medium mb-1 group-hover:text-primary transition-colors">Seguro Saúde Viagem</p>
               <p className="text-xs text-gray-400 mb-4 leading-relaxed">Cobertura de emissão $100k USD para emergências médicas, atendendo totalmente ao Tratado de Schengen na Europa.</p>
               <span className="text-[10px] uppercase font-bold tracking-wider text-accent-green bg-accent-green/10 px-2 py-1 rounded border border-accent-green/20">Ativo • Visa Infinite</span>
            </div>
            <div className="bg-dark-bg p-5 rounded-xl border border-dark-border/50 hover:border-primary/30 transition-all cursor-pointer group">
               <p className="text-white font-medium mb-1 group-hover:text-primary transition-colors">Proteção de Preço</p>
               <p className="text-xs text-gray-400 mb-4 leading-relaxed">Reembolso imediato da diferença se você encontrar o mesmo item mais barato em até 30 dias após sua compra.</p>
               <span className="text-[10px] uppercase font-bold tracking-wider text-accent-green bg-accent-green/10 px-2 py-1 rounded border border-accent-green/20">Ativo • Mastercard Black</span>
            </div>
            <div className="bg-dark-bg p-5 rounded-xl border border-dark-border/50 hover:border-primary/30 transition-all cursor-pointer group">
               <p className="text-white font-medium mb-1 group-hover:text-primary transition-colors">Locação de Veículos</p>
               <p className="text-xs text-gray-400 mb-4 leading-relaxed">Isenção do CDW/LDW global e automático ao abrir mão do seguro oferecido pela locadora matriz.</p>
               <span className="text-[10px] uppercase font-bold tracking-wider text-accent-green bg-accent-green/10 px-2 py-1 rounded border border-accent-green/20">Cobertura Global Livre</span>
            </div>
         </div>
      </div>
    </div>
  )
}
