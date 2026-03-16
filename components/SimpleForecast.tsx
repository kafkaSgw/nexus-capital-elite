import { TrendingUp, Calendar, Target } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface SimpleForecastProps {
  historicalData: number[] // Últimos 3-6 meses
  targetMonth: string
}

export default function SimpleForecast({ historicalData, targetMonth }: SimpleForecastProps) {
  // Cálculo de previsão simples usando média móvel
  const calculateForecast = () => {
    if (historicalData.length < 2) return { forecast: 0, avgGrowth: 0, average: 0 }

    // Média dos últimos períodos
    const average = historicalData.reduce((sum, val) => sum + val, 0) / historicalData.length

    // Calcular tendência (crescimento médio)
    let totalGrowth = 0
    for (let i = 1; i < historicalData.length; i++) {
      const growth = ((historicalData[i] - historicalData[i - 1]) / historicalData[i - 1]) * 100
      totalGrowth += growth
    }
    const avgGrowth = totalGrowth / (historicalData.length - 1)

    // Projetar próximo mês
    const lastValue = historicalData[historicalData.length - 1]
    const forecast = lastValue * (1 + avgGrowth / 100)

    return { forecast, avgGrowth, average }
  }

  const { forecast, avgGrowth, average } = calculateForecast()
  const isGrowing = avgGrowth > 0
  const confidence = Math.min(95, 60 + (historicalData.length * 5)) // Mais dados = mais confiança

  if (historicalData.length < 2) {
    return (
      <div className="card-premium p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-accent-purple/10 flex items-center justify-center">
            <Target className="w-5 h-5 text-accent-purple" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Previsão Financeira</h3>
            <p className="text-sm text-gray-400">Adicione mais dados para ver previsões</p>
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500">Registre transações por pelo menos 2 meses para gerar previsões</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card-premium p-6 hover-lift">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-purple to-primary flex items-center justify-center">
          <Target className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Previsão Financeira</h3>
          <p className="text-sm text-gray-400">Baseada nos últimos {historicalData.length} meses</p>
        </div>
      </div>

      {/* Previsão Principal */}
      <div className="bg-dark-card rounded-xl p-6 mb-4 border border-dark-border">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2 text-gray-400">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">Previsão para {targetMonth}</span>
          </div>
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${isGrowing ? 'bg-accent-green/10 text-accent-green' : 'bg-accent-red/10 text-accent-red'
            }`}>
            {isGrowing ? <TrendingUp className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
            {isGrowing ? '+' : ''}{avgGrowth.toFixed(1)}%
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-3xl font-bold text-white number-font">
            {formatCurrency(forecast)}
          </p>
          <p className="text-sm text-gray-400">
            Tendência: <span className={isGrowing ? 'text-accent-green' : 'text-accent-red'}>
              {isGrowing ? 'Crescimento' : 'Queda'}
            </span> de {Math.abs(avgGrowth).toFixed(1)}% ao mês
          </p>
        </div>
      </div>

      {/* Métricas Adicionais */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-dark-card rounded-lg p-4 border border-dark-border">
          <p className="text-xs text-gray-500 mb-1">Média Histórica</p>
          <p className="text-lg font-bold text-white number-font">
            {formatCurrency(average)}
          </p>
        </div>
        <div className="bg-dark-card rounded-lg p-4 border border-dark-border">
          <p className="text-xs text-gray-500 mb-1">Confiança</p>
          <div className="flex items-baseline gap-2">
            <p className="text-lg font-bold text-primary number-font">
              {confidence}%
            </p>
            <div className="flex-1 h-1.5 bg-dark-bg rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent-purple rounded-full"
                style={{ width: `${confidence}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Insight */}
      <div className="mt-4 p-4 bg-accent-purple/5 border border-accent-purple/10 rounded-lg">
        <p className="text-sm text-gray-300">
          💡 <span className="font-semibold">Insight:</span> {
            isGrowing
              ? `Mantendo o ritmo atual, você pode atingir ${formatCurrency(forecast * 1.2)} em 3 meses.`
              : `Considere revisar despesas para reverter a tendência de queda.`
          }
        </p>
      </div>
    </div>
  )
}
