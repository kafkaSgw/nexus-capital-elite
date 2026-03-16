'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, Send, X, Sparkles } from 'lucide-react'
import { getTransactions, getAssets, getCompanies } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [financialContext, setFinancialContext] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    if (messagesEndRef.current && messagesEndRef.current.parentElement) {
      const parent = messagesEndRef.current.parentElement;
      parent.scrollTo({ top: parent.scrollHeight, behavior: 'smooth' });
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && !financialContext) {
      loadFinancialContext()
    }
  }, [isOpen])

  const loadFinancialContext = async () => {
    try {
      const [transactions, assets, companies] = await Promise.all([
        getTransactions(),
        getAssets(),
        getCompanies()
      ])

      const totalIncome = transactions.filter((t: any) => t.type === 'income').reduce((s: number, t: any) => s + t.amount, 0)
      const totalExpense = Math.abs(transactions.filter((t: any) => t.type === 'expense').reduce((s: number, t: any) => s + t.amount, 0))
      const totalInvested = assets.reduce((s: number, a: any) => s + (a.quantidade * a.preco_medio), 0)
      const currentValue = assets.reduce((s: number, a: any) => s + (a.quantidade * a.preco_atual), 0)

      const ctx = [
        `Resumo Financeiro do Usuário:`,
        `- Receitas totais: ${formatCurrency(totalIncome)}`,
        `- Despesas totais: ${formatCurrency(totalExpense)}`,
        `- Lucro líquido: ${formatCurrency(totalIncome - totalExpense)}`,
        `- Total investido: ${formatCurrency(totalInvested)}`,
        `- Valor atual carteira: ${formatCurrency(currentValue)}`,
        `- Rentabilidade: ${totalInvested > 0 ? (((currentValue - totalInvested) / totalInvested) * 100).toFixed(2) : 0}%`,
        `- Empresas: ${(companies || []).length} (${(companies || []).map((c: any) => c.name).join(', ') || 'nenhuma'})`,
        `- Ativos: ${assets.length} (${assets.map((a: any) => a.ticker).join(', ') || 'nenhum'})`,
        `- Transações: ${transactions.length} registradas`,
      ].join('\n')

      setFinancialContext(ctx)
    } catch (error) {
      console.error('Erro ao carregar contexto financeiro:', error)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')

    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: messages,
          context: financialContext
        })
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response
      }])
    } catch (error) {
      console.error('Erro no chat:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Desculpe, tive um problema ao processar sua mensagem. Tente novamente.'
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Botão Flutuante */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-accent-purple to-primary rounded-full flex items-center justify-center shadow-glow hover:scale-110 transition-all duration-300 z-40"
        aria-label="Abrir chat IA"
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </button>

      {/* Modal Centralizado */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal */}
          <div className="relative w-full max-w-2xl h-[600px] card-premium animate-slide-up flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-dark-border">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-purple to-primary flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Assistente IA</h2>
                  <p className="text-sm text-gray-400">Nexus Capital Elite</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-dark-hover rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent-purple to-primary flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-gray-300 mb-2">Olá! Sou o assistente financeiro da Nexus Capital.</p>
                  <p className="text-sm text-gray-500">
                    Posso te ajudar com análises, dúvidas sobre investimentos e orientações financeiras.
                  </p>
                </div>
              )}

              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'user'
                      ? 'bg-gradient-to-r from-primary to-accent-purple text-white'
                      : 'bg-dark-card border border-dark-border text-gray-200'
                      }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-dark-card border border-dark-border rounded-2xl px-4 py-3">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-6 border-t border-dark-border">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite sua pergunta..."
                  className="flex-1 input-premium"
                  disabled={loading}
                />
                <button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
