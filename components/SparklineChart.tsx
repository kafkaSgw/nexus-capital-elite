'use client'

import { ResponsiveContainer, LineChart, Line, Tooltip } from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface SparklineChartProps {
    data: number[]
    color: string
}

export default function SparklineChart({ data, color }: SparklineChartProps) {
    if (!data || data.length === 0) return <div className="h-8 w-24"></div>

    const chartData = data.map((value, index) => ({
        name: `Ponto ${index}`,
        value
    }))

    const min = Math.min(...data)
    const max = Math.max(...data)

    // Customizar o domínio para o gráfico não tocar no topo/abaixo
    const padding = (max - min) * 0.1

    return (
        <div className="h-10 w-28 group relative">
            <ResponsiveContainer width="100%" height={40}>
                <LineChart data={chartData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                    <defs>
                        <filter id={`glow-${color.replace('#', '')}`} x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="2" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>

                    <Tooltip
                        cursor={false}
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                return (
                                    <div className="bg-dark-card border border-white/10 shadow-glow-lg px-2 py-1 rounded-md text-xs font-bold text-white whitespace-nowrap z-50">
                                        {formatCurrency(payload[0].value as number)}
                                    </div>
                                )
                            }
                            return null
                        }}
                        wrapperStyle={{ zIndex: 100, outline: 'none' }}
                    />

                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke={color}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, fill: color, stroke: '#fff', strokeWidth: 1.5, style: { filter: `drop-shadow(0px 0px 4px ${color})` } }}
                        isAnimationActive={true}
                        animationDuration={1500}
                        animationEasing="ease-out"
                        filter={`url(#glow-${color.replace('#', '')})`}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}
