'use client'

import { useState, useEffect } from 'react'
import { Brain, TrendingUp, AlertCircle, RefreshCw, Zap } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface AIWealthManagerProps {
  portfolioValue?: number;
  isPremium?: boolean;
}

export default function AIWealthManager({ portfolioValue = 0, isPremium = true }: AIWealthManagerProps) {
  const [analyzing, setAnalyzing] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setAnalyzing(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="card-premium relative overflow-hidden">
      {/* Background Effect */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent-purple/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
      
      <div className="p-5 sm:p-6 border-b border-dark-border relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent-purple/20 rounded-xl flex items-center justify-center shrink-0">
            <Brain className="w-5 h-5 text-accent-purple" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              Nexus AI Wealth Manager
              {isPremium && <Zap className="w-4 h-4 text-accent-purple" fill="currentColor" />}
            </h3>
            <p className="text-sm text-gray-400">Análise Macro-Econômica Proativa</p>
          </div>
        </div>
        {analyzing ? (
          <div className="flex items-center gap-2 text-sm text-accent-purple bg-accent-purple/10 px-3 py-1.5 rounded-full shrink-0 w-fit">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Analisando mercado...
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-accent-green bg-accent-green/10 px-3 py-1.5 rounded-full shrink-0 w-fit">
            <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
            Monitoramento Ativo
          </div>
        )}
      </div>

      <div className="p-5 sm:p-6 relative z-10">
        {analyzing ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-4 bg-dark-bg/60 rounded w-3/4"></div>
            <div className="h-4 bg-dark-bg/60 rounded w-1/2"></div>
            <div className="h-24 bg-dark-bg/60 rounded mt-6"></div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-700">
            {/* Insights Container */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-up">
              {/* Insight 1 */}
              <div className="bg-dark-card p-5 rounded-xl border border-dark-border hover:border-accent-purple/30 transition-all group">
                <div className="flex items-start gap-4">
                  <div className="mt-1 bg-accent-green/10 p-2 rounded-lg group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-5 h-5 text-accent-green" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1.5">Impacto da Selic Mensal</h4>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      A manutenção da taxa de juros beneficia os {formatCurrency(portfolioValue > 0 ? portfolioValue * 0.4 : 50000)} em alocação de renda fixa. A projeção de rendimento extra estimada é de <span className="text-accent-green font-bold">+1.2%</span> neste mês.
                    </p>
                  </div>
                </div>
              </div>

              {/* Insight 2 */}
              <div className="bg-dark-card p-5 rounded-xl border border-dark-border hover:border-accent-yellow/30 transition-all group">
                <div className="flex items-start gap-4">
                  <div className="mt-1 bg-accent-yellow/10 p-2 rounded-lg group-hover:scale-110 transition-transform">
                    <AlertCircle className="w-5 h-5 text-accent-yellow" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1.5">Volatilidade Externa Prevista</h4>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      Detectada alta volatilidade no S&P 500 nesta semana. Recomendamos um hedge cambial preventivo para os {formatCurrency(portfolioValue > 0 ? portfolioValue * 0.15 : 15000)} expostos diretamente ao dólar.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Recommendation Banner */}
            <div className="bg-gradient-to-r from-accent-purple/10 via-accent-purple/5 to-transparent border border-accent-purple/20 p-5 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h4 className="text-white font-medium flex items-center gap-2">
                  <span className="text-xl">✨</span> Sugestão Estratégica
                </h4>
                <p className="text-sm text-gray-400 mt-1 max-w-2xl">
                  Mover 5% do portfólio em ativos de risco elevado para liquidez imediata. Isso preparará a carteira para absorver oportunidades após as correções previstas do mercado.
                </p>
              </div>
              <button className="btn-primary whitespace-nowrap text-sm px-6 py-2.5 shadow-lg shadow-accent-purple/20 shrink-0">
                Aplicar Estratégia
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
