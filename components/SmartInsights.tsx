'use client'

import { useEffect, useState } from 'react'
import Typewriter from 'typewriter-effect'
import { Sparkles, Activity, TrendingUp, TrendingDown, Info } from 'lucide-react'
import { Transaction } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'

export default function SmartInsights({ transactions }: { transactions: Transaction[] }) {
    const [insights, setInsights] = useState<string[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!transactions || transactions.length === 0) {
            setInsights(['Sem dados suficientes para análise ainda.'])
            setLoading(false)
            return
        }

        // Gerar insights baseados nos dados reais
        setTimeout(() => {
            const newInsights: string[] = []

            const income = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0)
            const expense = Math.abs(transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0))
            const net = income - expense

            if (net > 0) {
                newInsights.push(`Fluxo positivo! Você reteve <span class="text-accent-green font-bold">${formatCurrency(net)}</span> este mês.`)
            } else if (net < 0) {
                newInsights.push(`Atenção: Seu déficit atual é de <span class="text-accent-red font-bold">${formatCurrency(Math.abs(net))}</span>.`)
            }

            // Maior despesa
            const expenses = transactions.filter(t => t.type === 'expense')
            if (expenses.length > 0) {
                const sortedExpenses = [...expenses].sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
                const topExpense = sortedExpenses[0]
                newInsights.push(`Maior despesa detectada: <span class="text-accent-red font-bold">${topExpense.description}</span> (${formatCurrency(Math.abs(topExpense.amount))}).`)
            }

            // Mix de Categorias
            const categories: Record<string, number> = {}
            expenses.forEach(tx => {
                categories[tx.category] = (categories[tx.category] || 0) + Math.abs(tx.amount)
            })

            const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0]
            if (topCategory && topCategory[1] > 0) {
                newInsights.push(`Cuidado com a categoria <span class="text-primary-lighter font-bold">${topCategory[0]}</span>, ela representa a maior fatia dos seus custos.`)
            }

            setInsights(newInsights.length > 0 ? newInsights : ['Monitorando atividade financeira...'])
            setLoading(false)
        }, 1200) // Simular tempo de "Processamento da IA"
    }, [transactions])

    return (
        <div className="relative overflow-hidden rounded-2xl p-[1px] mb-6 group">
            {/* Borda Animada (Gradient) */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent-purple to-accent-green bg-[length:400%_400%] animate-gradient opacity-40 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />

            {/* Conteúdo Principal */}
            <div className="relative bg-dark-card/90 backdrop-blur-xl rounded-2xl p-5 border border-white/5 flex items-start sm:items-center gap-4 shadow-glow-lg transition-transform hover-scale">

                {/* Ícone IA com Pulso */}
                <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full animate-pulse-slow" />
                    <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent-purple flex items-center justify-center border border-white/10 shadow-glow">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-bold bg-gradient-to-r from-primary-lighter to-accent-purple bg-clip-text text-transparent uppercase tracking-wider">
                            Nexus AI Insights
                        </h3>
                        {loading && (
                            <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-gray-500 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                                <Activity className="w-3 h-3 animate-spin" /> Processando
                            </span>
                        )}
                    </div>

                    <div className="text-gray-300 text-sm font-medium leading-relaxed min-h-[40px] flex sm:block items-center sm:items-start whitespace-pre-wrap">
                        {loading ? (
                            <div className="flex gap-1 items-center opacity-50">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        ) : (
                            <Typewriter
                                options={{
                                    strings: insights,
                                    autoStart: true,
                                    loop: true,
                                    delay: 40,
                                    deleteSpeed: 20,
                                    cursorClassName: 'text-primary animate-pulse font-bold'
                                }}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
