'use client'

import { PieChart } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface InvestmentPieChartProps {
  assets: any[]
}

export default function InvestmentPieChart({ assets }: InvestmentPieChartProps) {
  if (assets.length === 0) {
    return null
  }

  // Calcular totais por ativo
  const assetData = assets.map(asset => ({
    ticker: asset.ticker,
    classe: asset.classe,
    value: asset.quantidade * asset.preco_atual,
    color: getAssetColor(asset.ticker, asset.classe)
  }))

  const totalValue = assetData.reduce((sum, item) => sum + item.value, 0)

  // Calcular percentuais e ângulos
  let currentAngle = 0
  const chartData = assetData.map(item => {
    const percentage = (item.value / totalValue) * 100
    const angle = (percentage / 100) * 360
    const data = {
      ...item,
      percentage,
      startAngle: currentAngle,
      endAngle: currentAngle + angle
    }
    currentAngle += angle
    return data
  }).sort((a, b) => b.value - a.value)

  return (
    <div className="card-premium">
      <div className="p-6 border-b border-dark-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent-purple rounded-xl flex items-center justify-center shadow-glow">
            <PieChart className="w-5 h-5 text-dark-bg" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Distribuição de Ativos</h3>
            <p className="text-sm text-gray-400">Composição da carteira</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* Gráfico de Pizza SVG */}
          <div className="relative w-64 h-64 flex-shrink-0">
            <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
              {chartData.map((item, index) => {
                const startAngle = (item.startAngle * Math.PI) / 180
                const endAngle = (item.endAngle * Math.PI) / 180
                const largeArc = item.percentage > 50 ? 1 : 0

                const x1 = 100 + 80 * Math.cos(startAngle)
                const y1 = 100 + 80 * Math.sin(startAngle)
                const x2 = 100 + 80 * Math.cos(endAngle)
                const y2 = 100 + 80 * Math.sin(endAngle)

                return (
                  <g key={item.ticker}>
                    <path
                      d={`M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`}
                      fill={item.color}
                      stroke="#14141F"
                      strokeWidth="2"
                      className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                      style={{
                        filter: `drop-shadow(0 0 8px ${item.color}40)`
                      }}
                    />
                  </g>
                )
              })}

              {/* Círculo central para efeito donut */}
              <circle
                cx="100"
                cy="100"
                r="50"
                fill="#0A0A0F"
                stroke="#14141F"
                strokeWidth="2"
              />
            </svg>

            {/* Total no centro */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-xs text-gray-400">Total</p>
              <p className="text-lg font-bold text-white number-font">
                {formatCurrency(totalValue)}
              </p>
            </div>
          </div>

          {/* Legenda */}
          <div className="flex-1 w-full space-y-3">
            {chartData.map((item, index) => (
              <div
                key={item.ticker}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-dark-hover transition-colors group"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: item.color,
                      boxShadow: `0 0 8px ${item.color}60`
                    }}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-white">{item.ticker}</p>
                    <p className="text-xs text-gray-500">{item.classe}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white number-font">
                    {formatCurrency(item.value)}
                  </p>
                  <p className="text-xs text-gray-500">{item.percentage.toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resumo por Classe */}
        <div className="mt-6 pt-6 border-t border-dark-border">
          <p className="text-sm font-medium text-gray-400 mb-3">Por Classe de Ativo</p>
          <div className="grid grid-cols-2 gap-4">
            {['Stocks', 'Crypto'].map(classe => {
              const classAssets = chartData.filter(a => a.classe === classe)
              const classTotal = classAssets.reduce((sum, a) => sum + a.value, 0)
              const classPercentage = (classTotal / totalValue) * 100

              return (
                <div key={classe} className="bg-dark-card rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-1">{classe}</p>
                  <p className="text-xl font-bold text-white number-font">
                    {formatCurrency(classTotal)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {classPercentage.toFixed(1)}% da carteira
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// Cores para cada ativo
function getAssetColor(ticker: string, classe: string): string {
  const stockColors: { [key: string]: string } = {
    'PETR4': '#2563EB',
    'VALE3': '#10B981',
    'ITUB4': '#FFD93D',
    'BBDC4': '#A855F7',
    'MGLU3': '#EF4444',
    'ABEV3': '#4ECDC4',
    'WEGE3': '#95E1D3',
    'RENT3': '#F38181'
  }

  const cryptoColors: { [key: string]: string } = {
    'BTC': '#F7931A',
    'ETH': '#627EEA',
    'SOL': '#14F195',
    'ADA': '#0033AD',
    'XRP': '#23292F',
    'BNB': '#F3BA2F',
    'MATIC': '#8247E5',
    'DOT': '#E6007A'
  }

  if (classe === 'Stocks') {
    return stockColors[ticker] || '#6C757D'
  } else {
    return cryptoColors[ticker] || '#6C757D'
  }
}
