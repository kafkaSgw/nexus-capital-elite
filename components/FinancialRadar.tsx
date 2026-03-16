'use client'

import { useState, useEffect } from 'react'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { ShieldCheck, Target, TrendingUp, AlertCircle } from 'lucide-react'

// Radar data calculation logic
// In a real app, this would be calculated from real backend data (savings rate, debt ratio, etc)
// For now, we simulate a realistic profile based on current state.

const calculateRadarData = () => {
    return [
        { subject: 'Poupança', A: 75, fullMark: 100 },
        { subject: 'Investimentos', A: 60, fullMark: 100 },
        { subject: 'Controle de Dívidas', A: 90, fullMark: 100 },
        { subject: 'Diversificação', A: 65, fullMark: 100 },
        { subject: 'Liquidez', A: 85, fullMark: 100 },
        { subject: 'Disciplina', A: 70, fullMark: 100 },
    ]
}

export default function FinancialRadar() {
    const [data, setData] = useState<any[]>([])
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        setData(calculateRadarData())
    }, [])

    if (!mounted) return null

    // Calculate overall score (average of all dimensions)
    const calculateOverallScore = () => {
        if (data.length === 0) return 0
        const sum = data.reduce((acc, curr) => acc + curr.A, 0)
        return Math.round(sum / data.length)
    }

    const score = calculateOverallScore()

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-emerald-400'
        if (score >= 60) return 'text-yellow-400'
        return 'text-red-400'
    }

    const getScoreBg = (score: number) => {
        if (score >= 80) return 'bg-emerald-400/10'
        if (score >= 60) return 'bg-yellow-400/10'
        return 'bg-red-400/10'
    }

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-dark-card/90 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-xl">
                    <p className="font-bold text-white mb-1">{payload[0].payload.subject}</p>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-gray-300">Pontuação:</span>
                        <span className="font-bold text-primary">{payload[0].value}/100</span>
                    </div>
                </div>
            )
        }
        return null
    }

    return (
        <div className="card-premium p-6">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Target className="w-5 h-5 text-primary" />
                        Radar de Saúde Financeira
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">Sua performance em 6 pilares de riqueza</p>
                </div>

                {/* Global Score Display */}
                <div className={`flex items-center gap-3 px-4 py-2 rounded-xl border border-white/5 ${getScoreBg(score)}`}>
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Health Score</span>
                        <div className={`text-2xl font-black ${getScoreColor(score)}`}>
                            {score}
                        </div>
                    </div>
                    {score >= 80 ? (
                        <ShieldCheck className={`w-8 h-8 ${getScoreColor(score)} opacity-80`} />
                    ) : score >= 60 ? (
                        <TrendingUp className={`w-8 h-8 ${getScoreColor(score)} opacity-80`} />
                    ) : (
                        <AlertCircle className={`w-8 h-8 ${getScoreColor(score)} opacity-80`} />
                    )}
                </div>
            </div>

            <div className="relative h-[300px] w-full">
                {/* Background glow behind radar */}
                <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full scale-75" />

                <ResponsiveContainer width="100%" height={300}>
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                        <PolarGrid stroke="rgba(255,255,255,0.1)" />
                        <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 500 }}
                        />
                        <PolarRadiusAxis
                            angle={30}
                            domain={[0, 100]}
                            tick={false}
                            axisLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Radar
                            name="Você"
                            dataKey="A"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            fill="rgba(59, 130, 246, 0.3)"
                            fillOpacity={0.6}
                        />
                        {/* Overlay a subtle secondary radar to show "benchmark / ideal" */}
                        <Radar
                            name="Ideal"
                            dataKey="fullMark"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth={1}
                            strokeDasharray="3 3"
                            fill="transparent"
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            {/* Actionable Insights based on lowest score */}
            <div className="mt-4 p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-primary mt-0.5" />
                <div>
                    <h4 className="text-sm font-bold text-white">Insight do Radar</h4>
                    <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                        Seu ponto mais fraco atual é <strong>Investimentos</strong>. Tente direcionar mais do seu fluxo de caixa livre mensal para a aba de investimentos para diversificar seu portfólio.
                    </p>
                </div>
            </div>
        </div>
    )
}
