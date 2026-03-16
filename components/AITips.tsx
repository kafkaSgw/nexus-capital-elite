'use client'

import { useState, useEffect } from 'react'
import { Lightbulb, Sparkles, RefreshCw } from 'lucide-react'

interface AITipsProps {
  transactions: any[]
  assets: any[]
}

export default function AITips({ transactions, assets }: AITipsProps) {
  const [tip, setTip] = useState<string>('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    generateTip()
  }, [transactions, assets])

  const generateTip = async () => {
    setLoading(true)

    try {
      // Calcular dados para enviar à IA
      const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
      const totalExpense = Math.abs(transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0))
      const balance = totalIncome - totalExpense
      const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100) : 0

      const totalInvested = assets.reduce((s, a) => s + (a.quantidade * a.preco_medio), 0)
      const currentValue = assets.reduce((s, a) => s + (a.quantidade * a.preco_atual), 0)
      const roi = totalInvested > 0 ? (((currentValue - totalInvested) / totalInvested) * 100) : 0

      // Categorias de despesas
      const expensesByCategory = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc: any, t) => {
          acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount)
          return acc
        }, {})

      const topExpenseCategory = Object.entries(expensesByCategory)
        .sort(([, a]: any, [, b]: any) => b - a)[0]

      // Montar prompt para IA
      const prompt = `Você é um consultor financeiro experiente. Analise estes dados e dê UMA dica CURTA e OBJETIVA (máximo 2 frases):

Finanças:
- Receita total: R$ ${totalIncome.toFixed(2)}
- Despesa total: R$ ${totalExpense.toFixed(2)}
- Saldo: R$ ${balance.toFixed(2)}
- Taxa de poupança: ${savingsRate.toFixed(1)}%

Investimentos:
- Valor investido: R$ ${totalInvested.toFixed(2)}
- Valor atual: R$ ${currentValue.toFixed(2)}
- ROI: ${roi.toFixed(2)}%

Maior despesa: ${topExpenseCategory ? topExpenseCategory[0] : 'N/A'} (R$ ${topExpenseCategory ? (topExpenseCategory[1] as number).toFixed(2) : '0'})

Dê uma dica prática e acionável baseada nesses dados. Seja direto e útil.`

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt })
      })

      const data = await response.json()
      setTip(data.response || 'Configure o Groq para dicas personalizadas!')

    } catch (error) {
      console.error('Erro ao gerar dica:', error)
      // Fallback: dica baseada em regras
      const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
      const totalExpense = Math.abs(transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0))
      const savingsRate = totalIncome > 0 ? (((totalIncome - totalExpense) / totalIncome) * 100) : 0

      if (savingsRate < 10) {
        setTip('💡 Sua taxa de poupança está baixa! Tente economizar pelo menos 20% da sua receita mensal.')
      } else if (savingsRate > 50) {
        setTip('🎯 Ótima taxa de poupança! Considere investir parte desse dinheiro para fazer ele render mais.')
      } else {
        setTip('👍 Você está no caminho certo! Continue monitorando seus gastos e buscando aumentar sua poupança.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card-premium p-6 bg-gradient-to-br from-accent-purple/10 via-primary/10 to-accent-yellow/10 border-2 border-primary/30">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-accent-yellow to-accent-purple rounded-xl flex items-center justify-center animate-pulse">
            <Sparkles className="w-5 h-5 text-dark-bg" />
          </div>
          <div>
            <h3 className="font-bold text-white flex items-center gap-2">
              Dica Inteligente
              <span className="text-xs px-2 py-0.5 bg-gradient-to-r from-primary to-accent-purple rounded-full">
                IA
              </span>
            </h3>
            <p className="text-xs text-gray-400">Baseada nos seus dados</p>
          </div>
        </div>

        <button
          onClick={generateTip}
          disabled={loading}
          className="p-2 hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50"
          title="Gerar nova dica"
        >
          <RefreshCw className={`w-4 h-4 text-primary ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="bg-dark-bg/50 rounded-lg p-4 border border-primary/20">
        {loading ? (
          <div className="flex items-center gap-3">
            <div className="loading" />
            <p className="text-sm text-gray-400">Analisando seus dados...</p>
          </div>
        ) : (
          <p className="text-white leading-relaxed">{tip}</p>
        )}
      </div>

      <div className="mt-3 text-xs text-gray-500 flex items-center gap-1">
        <Lightbulb className="w-3 h-3" />
        Dica atualizada automaticamente com novos dados
      </div>
    </div>
  )
}
