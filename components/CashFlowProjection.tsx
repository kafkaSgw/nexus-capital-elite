'use client'

import { useState, useEffect } from 'react'
import { Calendar, ChevronRight, CheckCircle2, TrendingUp, Filter, AlertCircle, Building2, Plus, Check, AlertTriangle, Repeat, X, Trash2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { supabase, Company } from '@/lib/supabase'

interface ScheduledTransaction {
  id: string
  description: string
  amount: number
  type: 'income' | 'expense'
  category: string
  due_date: string
  is_recurring: boolean
  recurrence_type: string | null
  is_paid: boolean
  company_id?: string | null
}

export default function CashFlowProjection({ currentBalance }: { currentBalance: number }) {
  const [scheduled, setScheduled] = useState<ScheduledTransaction[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newScheduled, setNewScheduled] = useState<{
    description: string
    amount: string
    type: 'income' | 'expense'
    category: string
    due_date: string
    is_recurring: boolean
    recurrence_type?: 'monthly' | 'yearly' | 'weekly'
    company_id: string
  }>({
    description: '',
    amount: '',
    type: 'expense',
    category: '',
    due_date: new Date().toISOString().split('T')[0],
    is_recurring: false,
    company_id: ''
  })

  useEffect(() => {
    loadScheduled()
  }, [])

  // Load companies
  useEffect(() => {
    const loadCompanies = async () => {
      const { data } = await supabase.from('companies').select('*').order('name')
      if (data) setCompanies(data)
    }
    loadCompanies()
  }, [])

  const handleAddScheduled = async () => {
    if (!newScheduled.description || !newScheduled.amount || !newScheduled.due_date) {
      alert('Preencha todos os campos obrigatórios!')
      return
    }

    try {
      const numAmount = parseFloat(newScheduled.amount);
      const finalAmount = newScheduled.type === 'expense'
        ? -Math.abs(numAmount)
        : Math.abs(numAmount);

      const { error } = await supabase
        .from('scheduled_transactions')
        .insert([{
          description: newScheduled.description,
          amount: finalAmount,
          type: newScheduled.type,
          category: newScheduled.category,
          due_date: newScheduled.due_date,
          is_recurring: newScheduled.is_recurring,
          recurrence_type: newScheduled.is_recurring ? newScheduled.recurrence_type : null,
          is_paid: false,
          company_id: newScheduled.company_id || null
        }])

      if (error) throw error

      setNewScheduled({
        description: '',
        amount: '',
        type: 'expense',
        category: '',
        due_date: '',
        is_recurring: false,
        recurrence_type: undefined,
        company_id: ''
      })
      setIsModalOpen(false)
      loadScheduled()
    } catch (error) {
      console.error('Erro ao agendar:', error)
      alert('Erro ao agendar transação. Verifique se executou o SQL no Supabase!')
    }
  }

  const handleDeleteScheduled = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja apagar este agendamento?')) return
    setDeleting(id)
    try {
      const { error } = await supabase
        .from('scheduled_transactions')
        .delete()
        .eq('id', id)

      if (error) throw error
      loadScheduled()
    } catch (error) {
      console.error('Erro ao deletar:', error)
      alert('Erro ao apagar agendamento.')
    } finally {
      setDeleting(null)
    }
  }

  const loadScheduled = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('scheduled_transactions')
        .select('*')
        .eq('is_paid', false)
        .order('due_date', { ascending: true })

      if (error) {
        // Tabela pode não existir ainda — mostrar estado vazio
        console.warn('Tabela scheduled_transactions não encontrada ou erro:', error.message)
        setScheduled([])
      } else if (data) {
        setScheduled(data)
      }
    } catch (error) {
      console.warn('Erro ao carregar agendamentos (tabela pode não existir):', error)
      setScheduled([])
    } finally {
      setLoading(false)
    }
  }

  const markAsPaid = async (id: string, item: ScheduledTransaction) => {
    try {
      // 1. Marcar como pago
      await supabase
        .from('scheduled_transactions')
        .update({ is_paid: true })
        .eq('id', id)

      // 2. Criar transação real (isso VAI diminuir o saldo!)
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert([{
          description: `[PAGO] ${item.description}`,
          amount: item.amount,
          type: item.type,
          category: item.category,
          company_id: item.company_id
        }])

      if (transactionError) {
        console.error('Erro ao criar transação:', transactionError)
        alert('Marcado como pago, mas não criou a transação. Verifique o console!')
      } else {
        alert('✅ Pago! O valor foi descontado do seu saldo.')
      }

      // 3. Se for recorrente, criar próxima ocorrência
      if (item.is_recurring && item.recurrence_type) {
        const nextDate = new Date(item.due_date)

        if (item.recurrence_type === 'weekly') {
          nextDate.setDate(nextDate.getDate() + 7)
        } else if (item.recurrence_type === 'monthly') {
          nextDate.setMonth(nextDate.getMonth() + 1)
        } else if (item.recurrence_type === 'yearly') {
          nextDate.setFullYear(nextDate.getFullYear() + 1)
        }

        await supabase
          .from('scheduled_transactions')
          .insert([{
            description: item.description,
            amount: item.amount,
            type: item.type,
            category: item.category,
            due_date: nextDate.toISOString().split('T')[0],
            is_recurring: true,
            recurrence_type: item.recurrence_type,
            company_id: item.company_id,
            is_paid: false
          }])
      }

      loadScheduled()
    } catch (error) {
      console.error('Erro ao marcar como pago:', error)
      alert('❌ Erro! Verifique se executou o SQL no Supabase.')
    }
  }

  // Calcular saldo projetado
  let projectedBalance = currentBalance
  const projectionData = scheduled.map(item => {
    projectedBalance += item.amount
    return {
      ...item,
      projectedBalance
    }
  })

  // Agrupar por mês
  const groupedByMonth = projectionData.reduce((acc: any, item) => {
    const month = new Date(item.due_date).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    if (!acc[month]) {
      acc[month] = []
    }
    acc[month].push(item)
    return acc
  }, {})

  const getDaysUntil = (date: string) => {
    const days = Math.ceil((new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    if (days < 0) return 'Atrasado'
    if (days === 0) return 'Hoje'
    if (days === 1) return 'Amanhã'
    return `${days} dias`
  }

  const getUrgencyColor = (date: string) => {
    const days = Math.ceil((new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    if (days < 0) return 'border-accent-red bg-accent-red/10'
    if (days <= 3) return 'border-accent-yellow bg-accent-yellow/10'
    return 'border-dark-border bg-dark-card'
  }

  if (loading) {
    return <div className="card-premium h-64 loading-shimmer" />
  }

  return (
    <div className="card-premium">
      <div className="p-6 border-b border-dark-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-accent-purple to-primary rounded-xl flex items-center justify-center shadow-glow">
              <Calendar className="w-5 h-5 text-dark-bg" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Fluxo de Caixa Projetado</h3>
              <p className="text-sm text-gray-400">Próximas movimentações</p>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Agendar
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-dark-card rounded-lg p-4">
            <p className="text-xs text-gray-400 mb-1">Saldo Atual</p>
            <p className="text-xl font-bold text-white number-font">
              {formatCurrency(currentBalance)}
            </p>
          </div>
          <div className="bg-dark-card rounded-lg p-4">
            <p className="text-xs text-gray-400 mb-1">A Receber</p>
            <p className="text-xl font-bold text-accent-green number-font">
              {formatCurrency(
                scheduled.filter(s => s.type === 'income').reduce((sum, s) => sum + s.amount, 0)
              )}
            </p>
          </div>
          <div className="bg-dark-card rounded-lg p-4">
            <p className="text-xs text-gray-400 mb-1">A Pagar</p>
            <p className="text-xl font-bold text-accent-red number-font">
              {formatCurrency(
                Math.abs(scheduled.filter(s => s.type === 'expense').reduce((sum, s) => sum + s.amount, 0))
              )}
            </p>
          </div>
        </div>

        {/* Timeline por Mês */}
        <div className="space-y-6">
          {Object.entries(groupedByMonth).map(([month, items]: [string, any]) => (
            <div key={month}>
              <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                {month.charAt(0).toUpperCase() + month.slice(1)}
              </h4>

              <div className="space-y-3">
                {items.map((item: any) => {
                  const daysUntil = getDaysUntil(item.due_date)
                  const isOverdue = daysUntil === 'Atrasado'
                  const isUrgent = !isOverdue && (daysUntil === 'Hoje' || daysUntil === 'Amanhã' || parseInt(daysUntil) <= 3)

                  return (
                    <div
                      key={item.id}
                      className={`rounded-xl p-4 border-2 transition-all ${getUrgencyColor(item.due_date)} hover:bg-dark-hover`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h5 className="font-medium text-white">{item.description}</h5>
                            {item.is_recurring && (
                              <div className="flex items-center gap-1 bg-primary/20 px-2 py-0.5 rounded-full">
                                <Repeat className="w-3 h-3 text-primary" />
                                <span className="text-xs text-primary">{item.recurrence_type}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-gray-400">{item.category}</span>
                            <span className="text-gray-600">•</span>
                            <span className={`font-medium ${isOverdue ? 'text-accent-red' :
                              isUrgent ? 'text-accent-yellow' :
                                'text-gray-400'
                              }`}>
                              {isOverdue && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                              {daysUntil}
                            </span>
                            <span className="text-gray-600">•</span>
                            <span className="text-gray-400">
                              {new Date(item.due_date).toLocaleDateString('pt-BR')}
                            </span>
                          </div>

                          <div className="mt-3 pt-3 border-t border-dark-border flex items-center justify-between">
                            <div>
                              <p className="text-xs text-gray-400">Saldo Projetado</p>
                              <p className={`font-bold number-font ${item.projectedBalance >= 0 ? 'text-accent-green' : 'text-accent-red'
                                }`}>
                                {formatCurrency(item.projectedBalance)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <p className={`text-xl font-bold number-font ${item.type === 'income' ? 'text-accent-green' : 'text-accent-red'
                            }`}>
                            {item.type === 'income' ? '+' : '-'}
                            {formatCurrency(Math.abs(item.amount))}
                          </p>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => markAsPaid(item.id, item)}
                              className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              Marcar Pago
                            </button>
                            <button
                              onClick={() => handleDeleteScheduled(item.id)}
                              disabled={deleting === item.id}
                              className="p-1.5 rounded-lg border border-dark-border bg-dark-bg text-gray-400 hover:text-accent-red hover:border-accent-red/50 hover:bg-accent-red/10 transition-colors disabled:opacity-50"
                              title="Apagar agendamento"
                            >
                              <Trash2 className={`w-4 h-4 ${deleting === item.id ? 'animate-pulse text-accent-red' : ''}`} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {scheduled.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">Nenhuma movimentação agendada</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary"
            >
              Agendar Primeira Transação
            </button>
          </div>
        )}
      </div>

      {/* Modal Agendar */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card rounded-2xl max-w-md w-full p-6 border border-dark-border max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Agendar Transação</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label-premium">Descrição</label>
                <input
                  type="text"
                  value={newScheduled.description}
                  onChange={(e) => setNewScheduled({ ...newScheduled, description: e.target.value })}
                  className="input-premium"
                  placeholder="Ex: Aluguel"
                />
              </div>

              <div>
                <label className="label-premium">Valor (R$)</label>
                <input
                  type="number"
                  value={newScheduled.amount}
                  onChange={(e) => setNewScheduled({ ...newScheduled, amount: e.target.value })}
                  className="input-premium"
                  placeholder="2000"
                />
              </div>

              <div>
                <label className="label-premium">Tipo</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewScheduled({ ...newScheduled, type: 'income' })}
                    className={`p-3 rounded-lg border-2 transition-all ${newScheduled.type === 'income'
                      ? 'border-accent-green bg-accent-green/10 text-accent-green'
                      : 'border-dark-border bg-dark-bg text-gray-400'
                      }`}
                  >
                    Receita
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewScheduled({ ...newScheduled, type: 'expense' })}
                    className={`p-3 rounded-lg border-2 transition-all ${newScheduled.type === 'expense'
                      ? 'border-accent-red bg-accent-red/10 text-accent-red'
                      : 'border-dark-border bg-dark-bg text-gray-400'
                      }`}
                  >
                    Despesa
                  </button>
                </div>
              </div>

              <div>
                <label className="label-premium">Categoria</label>
                <input
                  type="text"
                  value={newScheduled.category}
                  onChange={(e) => setNewScheduled({ ...newScheduled, category: e.target.value })}
                  className="input-premium"
                  placeholder="Ex: Moradia"
                />
              </div>

              <div>
                <label className="label-premium">Data de Vencimento</label>
                <input
                  type="date"
                  value={newScheduled.due_date}
                  onChange={(e) => setNewScheduled({ ...newScheduled, due_date: e.target.value })}
                  className="input-premium"
                />
              </div>

              <div>
                <label className="label-premium flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-purple-400" />
                  Empresa / Pessoa (Opcional)
                </label>
                <select
                  value={newScheduled.company_id}
                  onChange={(e) => setNewScheduled({ ...newScheduled, company_id: e.target.value })}
                  className="input-premium"
                >
                  <option value="">Nenhum vínculo direto</option>
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 p-4 bg-dark-bg rounded-lg">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={newScheduled.is_recurring}
                  onChange={(e) => setNewScheduled({ ...newScheduled, is_recurring: e.target.checked })}
                  className="w-5 h-5"
                />
                <label htmlFor="recurring" className="text-white cursor-pointer flex-1">
                  Recorrente (se repete)
                </label>
              </div>

              {newScheduled.is_recurring && (
                <div>
                  <label className="label-premium">Frequência</label>
                  <select
                    value={newScheduled.recurrence_type || ''}
                    onChange={(e) => setNewScheduled({ ...newScheduled, recurrence_type: e.target.value as any })}
                    className="input-premium"
                  >
                    <option value="">Selecione...</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensal</option>
                    <option value="yearly">Anual</option>
                  </select>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddScheduled}
                  className="btn-primary flex-1"
                >
                  Agendar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
