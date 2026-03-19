'use client'

import { Activity, AlertTriangle, ShieldAlert, TrendingDown, Target, BarChart2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function AnaliseRisco() {
  const portfolioValue = 8500000 // Mock value

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      <div className="mb-8 border-b border-dark-border pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            Análise de Risco <span className="text-gray-500 font-light hidden sm:inline">|</span> Stress Test
            <span className="px-3 py-1 bg-accent-red/20 text-accent-red text-xs sm:text-sm rounded-full flex items-center gap-1 font-medium ml-2">
              <Activity className="w-4 h-4" /> Quant Mode
            </span>
          </h1>
          <p className="text-gray-400">
            Métricas avançadas institucionais e testes de cenário extremo para o portfólio.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary h-10 px-4 text-sm font-medium">Exportar Relatório</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card-premium p-6 hover:border-accent-red/30 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-gray-400" />
            <p className="text-sm font-medium text-gray-400">Value at Risk (VaR 95%)</p>
          </div>
          <p className="text-3xl font-bold text-accent-red number-font">{formatCurrency(portfolioValue * 0.08)}</p>
          <div className="mt-4 p-3 bg-dark-bg rounded-lg border border-dark-border">
            <p className="text-xs text-gray-400 leading-relaxed">
              Perda potencial máxima em <strong className="text-gray-300">95%</strong> dos cenários de mercado nos próximos 30 dias.
            </p>
          </div>
        </div>

        <div className="card-premium p-6 hover:border-primary/30 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-gray-400" />
            <p className="text-sm font-medium text-gray-400">Índice Sharpe</p>
          </div>
          <p className="text-3xl font-bold text-white number-font">1.85</p>
          <div className="mt-4 p-3 bg-dark-bg rounded-lg border border-dark-border">
            <p className="text-xs text-gray-400 leading-relaxed flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent-green"></span>
              Retorno ajustado ao risco excelente. Acima da média (1.0).
            </p>
          </div>
        </div>

        <div className="card-premium p-6 hover:border-accent-yellow/30 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <BarChart2 className="w-4 h-4 text-gray-400" />
            <p className="text-sm font-medium text-gray-400">Beta do Portfólio</p>
          </div>
          <p className="text-3xl font-bold text-white number-font">0.82</p>
          <div className="mt-4 p-3 bg-dark-bg rounded-lg border border-dark-border">
            <p className="text-xs text-gray-400 leading-relaxed">
              Sua carteira é <strong className="text-gray-300">18% menos volátil</strong> que o IBOVESPA, protegendo o capital na queda.
            </p>
          </div>
        </div>
      </div>

      <div className="card-premium p-6 md:p-8 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-red/5 rounded-full blur-[100px] -mr-64 -mt-64 pointer-events-none" />

        <div className="relative z-10">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-accent-red/10 rounded-xl flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-accent-red" />
            </div>
            Simulador de Estresse Macro-Econômico
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
            <div className="space-y-3">
              {[
                { event: 'Queda de 20% no IBOVESPA', impact: -12.5, type: 'danger' },
                { event: 'Alta de 2% na Selic', impact: +4.2, type: 'positive' },
                { event: 'Crash Mundial (Estilo 2020)', impact: -28.0, type: 'danger' },
                { event: 'Dólar batendo R$ 6,50', impact: +15.5, type: 'positive' },
              ].map((scenario, index) => (
                <div key={index} className="bg-dark-bg p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between group border border-transparent hover:border-dark-border transition-all gap-4">
                  <span className="text-gray-300 font-medium">{scenario.event}</span>
                  <div className={`flex items-center gap-3 font-bold number-font ${scenario.type === 'positive' ? 'text-accent-green' : 'text-accent-red'}`}>
                    {scenario.type === 'positive' ? '+' : ''}{scenario.impact}%
                    <span className="text-sm px-3 py-1.5 rounded-lg bg-dark-card text-gray-400 min-w-[120px] text-right font-mono border border-dark-border/50">
                      {formatCurrency(portfolioValue * (1 + (scenario.impact / 100)))}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-gradient-to-br from-dark-card to-dark-bg border border-dark-border rounded-xl p-6 flex flex-col justify-center items-center text-center h-full min-h-[250px]">
              <div className="w-16 h-16 bg-accent-green/10 rounded-full flex items-center justify-center mb-4 ring-4 ring-dark-bg">
                <Activity className="w-8 h-8 text-accent-green" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Resiliência Média-Alta</h3>
              <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
                O portfólio demonstra forte proteção contra quedas da bolsa e cenários de alta de juros, devido à robusta alocação em ativos atrelados à inflação e CDI.
              </p>
              <button className="mt-6 text-sm text-primary hover:text-primary-lighter font-medium bg-primary/10 px-4 py-2 rounded-lg transition-colors">
                Ver diagnóstico completo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
