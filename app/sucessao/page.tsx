'use client'

import { useState } from 'react'
import { Scale, ShieldAlert, ArrowRight, FileText, CheckCircle2, TrendingDown, Clock, Info } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function SuccessionPage() {
  const [patrimony, setPatrimony] = useState(8500000)
  
  // ITCMD varies by state, using a max possible of 8% for aggressive planning + 5% lawyer + 2% judicial
  const itcmdRate = 0.08
  const honorariosRate = 0.05
  const custasRate = 0.02

  const itcmdValue = patrimony * itcmdRate
  const honorariosValue = patrimony * honorariosRate
  const custasValue = patrimony * custasRate
  
  const totalPerda = itcmdValue + honorariosValue + custasValue
  const patrimonioLiquido = patrimony - totalPerda

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-border pb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Scale className="w-8 h-8 text-primary" /> Planejamento Sucessório
          </h1>
          <p className="text-gray-400">
            Simulador de perda patrimonial via Inventário Litigioso vs. Estratégias de Holding (Clonagem Patrimonial).
          </p>
        </div>
        <button className="btn-secondary whitespace-nowrap hidden sm:flex items-center gap-2">
           <FileText className="w-4 h-4" /> Exportar Estratégia PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="card-premium p-6 lg:col-span-1 border-accent-red/30 shadow-[0_4px_30px_rgba(239,68,68,0.05)]">
           <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <TrendingDown className="w-6 h-6 text-accent-red" /> Cenário Base (Inventário)
           </h2>
           <p className="text-sm text-gray-400 mb-6">Mapeamento dos custos inevitáveis (em média de 1 a 3 anos de bloqueio judiciário) na pessoa física.</p>
           
           <div className="space-y-4">
             <div>
                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-2">Simulação de Patrimônio (R$)</label>
                <div className="relative group">
                   <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">R$</span>
                   <input 
                     type="number" 
                     value={patrimony}
                     onChange={(e) => setPatrimony(Number(e.target.value))}
                     className="w-full bg-dark-bg border border-dark-border text-white text-lg font-bold rounded-xl py-3 pl-12 pr-4 focus:border-accent-red transition-colors focus:shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                   />
                </div>
             </div>

             <div className="pt-4 space-y-3">
                <div className="flex justify-between items-center bg-dark-bg p-3 rounded-lg border border-dark-border/50 group hover:border-accent-red/50 transition-colors">
                    <span className="text-sm text-gray-400 flex items-center gap-2"><Info className="w-3 h-3"/> ITCMD (Teto STF 8%)</span>
                    <span className="text-sm font-bold text-accent-red number-font">-{formatCurrency(itcmdValue)}</span>
                </div>
                <div className="flex justify-between items-center bg-dark-bg p-3 rounded-lg border border-dark-border/50 group hover:border-accent-red/50 transition-colors">
                    <span className="text-sm text-gray-400 flex items-center gap-2"><Info className="w-3 h-3"/> Honorários Adv. OAB (5%)</span>
                    <span className="text-sm font-bold text-accent-red number-font">-{formatCurrency(honorariosValue)}</span>
                </div>
                <div className="flex justify-between items-center bg-dark-bg p-3 rounded-lg border border-dark-border/50 group hover:border-accent-red/50 transition-colors">
                    <span className="text-sm text-gray-400 flex items-center gap-2"><Info className="w-3 h-3"/> Custas / Cartório (2%)</span>
                    <span className="text-sm font-bold text-accent-red number-font">-{formatCurrency(custasValue)}</span>
                </div>
             </div>

             <div className="mt-6 p-5 bg-gradient-to-br from-accent-red/10 to-dark-bg border border-accent-red/30 rounded-xl relative overflow-hidden shadow-inner">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent-red/20 blur-3xl pointer-events-none" />
                <p className="text-xs text-accent-red font-bold uppercase tracking-widest mb-1">Custo Estimado da Herança</p>
                <p className="text-3xl font-bold text-white number-font pb-3 border-b border-accent-red/20">-{formatCurrency(totalPerda)}</p>
                
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-4 mb-2">Líquido Repassado p/ Herdeiros</p>
                <div className="flex items-center justify-between">
                   <p className="text-2xl font-bold text-white number-font">{formatCurrency(patrimonioLiquido)}</p>
                   <span className="text-xs text-accent-red font-bold bg-accent-red/10 px-2 py-1 rounded">-15.0%</span>
                </div>
             </div>
           </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
           <div className="card-premium p-6 md:p-8 border-primary/30 relative overflow-hidden shadow-[0_4px_30px_rgba(37,99,235,0.05)]">
               <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
               <h2 className="text-xl md:text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <ShieldAlert className="w-6 h-6 text-primary" /> Blindagem via Holding Familiar
               </h2>
               <p className="text-sm text-gray-300 mb-8 leading-relaxed max-w-2xl">
                 A liquidação de bens na pessoa física consome pesadamente o patrimônio através do inventário (pagamento em dinheiro para liberar imóveis e ativos bloqueados). 
                 A conversão desses mesmos ativos para <strong>Cotas de uma Empresa Cofre</strong> garante a proteção judicial familiar.
               </p>

               <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="bg-dark-bg p-5 rounded-xl border border-dark-border/50 relative group hover:border-primary transition-all cursor-pointer">
                     <CheckCircle2 className="w-6 h-6 text-accent-green mb-3 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                     <p className="text-white font-bold text-md mb-2">Doação de Cotas em Vida</p>
                     <p className="text-sm text-gray-500">O ITCMD é quitado sobre o valor histórico inicial contabilizado (muito menor), isolado das flutuações e mercado imobiliário futuro.</p>
                  </div>
                  <div className="bg-dark-bg p-5 rounded-xl border border-dark-border/50 relative group hover:border-primary transition-all cursor-pointer">
                     <CheckCircle2 className="w-6 h-6 text-accent-green mb-3 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                     <p className="text-white font-bold text-md mb-2">Cláusulas de Usufruto</p>
                     <p className="text-sm text-gray-500">O patriarca doa as cotas nominais aos herdeiros hoje, mas retém 100% dos direitos de voto, dividendos e venda total pela vida.</p>
                  </div>
                  <div className="bg-dark-bg p-5 rounded-xl border border-dark-border/50 relative group hover:border-primary transition-all cursor-pointer">
                     <CheckCircle2 className="w-6 h-6 text-accent-green mb-3 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                     <p className="text-white font-bold text-md mb-2">Gatilho Sucessório (Zero Bloqueios)</p>
                     <p className="text-sm text-gray-500">No evento do óbito, o usufruto apaga-se automaticamente via junta comercial. Liquidez imediata no D+1 sem advogados.</p>
                  </div>
               </div>

               <div className="mt-8 flex flex-col sm:flex-row gap-4">
                 <button className="flex-1 btn-primary py-3.5 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(37,99,235,0.3)]">
                   Iniciar Criação de Holding <ArrowRight className="w-4 h-4" />
                 </button>
               </div>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-gradient-to-r from-dark-card to-dark-bg border border-dark-border rounded-xl p-6 hover:border-primary/50 transition-all cursor-pointer group">
                 <h3 className="text-white font-bold text-base mb-2 group-hover:text-primary transition-colors flex items-center gap-2"><Globe className="w-4 h-4"/> Offshore (PIC/BVI)</h3>
                 <p className="text-sm text-gray-400">Isolamento jurisdicional duplo para capital em Dólar. Evite a regra de imposto morte ("Estate Tax") americano que toma até <strong className="text-white">40%</strong> acima de 60K USD.</p>
              </div>
              <div className="bg-gradient-to-r from-dark-card to-dark-bg border border-dark-border rounded-xl p-6 hover:border-primary/50 transition-all cursor-pointer group">
                 <h3 className="text-white font-bold text-base mb-2 group-hover:text-primary transition-colors flex items-center gap-2"><Clock className="w-4 h-4"/> Seguro de Vida Global</h3>
                 <p className="text-sm text-gray-400">Com a holding pagando um Prêmio Universal, o prêmio em vida é depositado diretamente na conta dos filhos imune a qualquer penhora para o caixa emergencial judicial.</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}

function Globe({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
  )
}
