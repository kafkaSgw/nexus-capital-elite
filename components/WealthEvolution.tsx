'use client'

import { LineChart, TrendingUp } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface WealthEvolutionProps {
  currentWealth: number
}

export default function WealthEvolution({ currentWealth }: WealthEvolutionProps) {
  // Dados simulados de evolução (em produção viriam do banco)
  const evolutionData = [
    { month: 'Jan', value: currentWealth * 0.65 },
    { month: 'Fev', value: currentWealth * 0.70 },
    { month: 'Mar', value: currentWealth * 0.75 },
    { month: 'Abr', value: currentWealth * 0.82 },
    { month: 'Mai', value: currentWealth * 0.88 },
    { month: 'Jun', value: currentWealth * 0.95 },
    { month: 'Jul', value: currentWealth },
  ]

  const maxValue = Math.max(...evolutionData.map(d => d.value))
  const minValue = Math.min(...evolutionData.map(d => d.value))
  const growth = ((currentWealth - evolutionData[0].value) / evolutionData[0].value) * 100

  // Cria os pontos do gráfico SVG
  const width = 600
  const height = 200
  const padding = 40

  const points = evolutionData.map((d, i) => {
    const x = padding + (i / (evolutionData.length - 1)) * (width - padding * 2)
    const y = padding + (1 - (d.value - minValue) / (maxValue - minValue)) * (height - padding * 2)
    return { x, y, value: d.value, month: d.month }
  })

  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  // Área preenchida
  const areaData = `${pathData} L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`

  return (
    <div className="card-premium">
      <div className="p-6 border-b border-dark-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-accent-green to-primary rounded-xl flex items-center justify-center shadow-glow">
              <LineChart className="w-5 h-5 text-dark-bg" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Evolução Patrimonial</h3>
              <p className="text-sm text-gray-400">Últimos 7 meses</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Crescimento</p>
            <p className={`text-xl font-bold number-font ${growth >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
              {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto"
          style={{ maxHeight: '250px' }}
        >
          {/* Grid horizontal */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = padding + (1 - ratio) * (height - padding * 2)
            const value = minValue + ratio * (maxValue - minValue)
            return (
              <g key={i}>
                <line
                  x1={padding}
                  y1={y}
                  x2={width - padding}
                  y2={y}
                  stroke="#1F1F2E"
                  strokeWidth="1"
                  strokeDasharray="4"
                />
                <text
                  x={padding - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="text-xs fill-gray-500"
                  style={{ fontSize: '10px' }}
                >
                  {formatCurrency(value).replace('R$', '').trim()}
                </text>
              </g>
            )
          })}

          {/* Área preenchida com gradiente */}
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#2563EB" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          <path
            d={areaData}
            fill="url(#areaGradient)"
          />

          {/* Linha principal */}
          <path
            d={pathData}
            fill="none"
            stroke="#2563EB"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              filter: 'drop-shadow(0 0 8px rgba(0, 217, 255, 0.6))'
            }}
          />

          {/* Pontos */}
          {points.map((point, i) => (
            <g key={i}>
              <circle
                cx={point.x}
                cy={point.y}
                r="5"
                fill="#0A0A0F"
                stroke="#2563EB"
                strokeWidth="3"
                className="cursor-pointer hover:r-7 transition-all"
              />
              <circle
                cx={point.x}
                cy={point.y}
                r="2"
                fill="#2563EB"
              />

              {/* Labels dos meses */}
              <text
                x={point.x}
                y={height - padding + 20}
                textAnchor="middle"
                className="text-xs fill-gray-400"
                style={{ fontSize: '11px' }}
              >
                {point.month}
              </text>
            </g>
          ))}
        </svg>

        {/* Legenda */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-dark-card rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Início</p>
            <p className="font-bold text-white number-font">
              {formatCurrency(evolutionData[0].value)}
            </p>
          </div>
          <div className="text-center p-3 bg-dark-card rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Atual</p>
            <p className="font-bold text-primary number-font">
              {formatCurrency(currentWealth)}
            </p>
          </div>
          <div className="text-center p-3 bg-dark-card rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Valorização</p>
            <p className={`font-bold number-font ${growth >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
              {formatCurrency(currentWealth - evolutionData[0].value)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
