'use client'

import { useState, useEffect } from 'react'
import { Target, Plus, X, TrendingUp, Edit, Trash2, DollarSign } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { getFinancialGoals, createFinancialGoal, updateFinancialGoal, deleteFinancialGoal, FinancialGoal, supabase } from '@/lib/supabase'
import { createPortal } from 'react-dom'
import toast from 'react-hot-toast'

const STORAGE_KEY = 'nexus-financial-goals'

export default function FinancialGoals() {
  const [goals, setGoals] = useState<FinancialGoal[]>([])
  const [loaded, setLoaded] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false)
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null)
  const [addAmount, setAddAmount] = useState('')
  const [newGoal, setNewGoal] = useState({
    title: '',
    target_amount: '',
    current_amount: '',
    deadline: '',
    category: 'savings' as FinancialGoal['category']
  })

  useEffect(() => {
    loadGoals()

    const channel = supabase
      .channel('financial_goals_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'financial_goals' }, () => {
        loadGoals()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadGoals = async () => {
    try {
      const data = await getFinancialGoals()

      // Auto-migrate from localStorage if Supabase is empty
      if (data.length === 0 && typeof window !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          try {
            const localGoals = JSON.parse(stored) as any[]
            for (const g of localGoals) {
              await createFinancialGoal({
                title: g.title,
                target_amount: g.targetAmount || g.target_amount,
                current_amount: g.currentAmount || g.current_amount || 0,
                deadline: g.deadline,
                category: g.category || 'savings'
              })
            }
            localStorage.removeItem(STORAGE_KEY)
            const fresh = await getFinancialGoals()
            setGoals(fresh)
            toast.success('Metas migradas para o banco de dados!')
          } catch (e) {
            console.error('Erro na migração:', e)
          }
        } else {
          setGoals(data)
        }
      } else {
        setGoals(data)
      }
    } catch (err) {
      console.error('Erro ao carregar metas:', err)
    } finally {
      setLoaded(true)
    }
  }

  const handleAddGoal = async () => {
    if (!newGoal.title || !newGoal.target_amount || !newGoal.deadline) {
      toast.error('Preencha todos os campos obrigatórios!')
      return
    }
    try {
      if (isEditMode && editingId) {
        await updateFinancialGoal(editingId, {
          title: newGoal.title,
          target_amount: parseFloat(newGoal.target_amount),
          current_amount: parseFloat(newGoal.current_amount) || 0,
          deadline: newGoal.deadline,
          category: newGoal.category
        })
        toast.success('Meta atualizada!')
      } else {
        await createFinancialGoal({
          title: newGoal.title,
          target_amount: parseFloat(newGoal.target_amount),
          current_amount: parseFloat(newGoal.current_amount) || 0,
          deadline: newGoal.deadline,
          category: newGoal.category
        })
        toast.success('Meta criada!')
      }
      resetModal()
      loadGoals()
    } catch (err) {
      toast.error('Erro ao salvar meta')
    }
  }

  const resetModal = () => {
    setNewGoal({ title: '', target_amount: '', current_amount: '', deadline: '', category: 'savings' })
    setIsModalOpen(false)
    setIsEditMode(false)
    setEditingId(null)
  }

  const handleEditGoal = (goal: FinancialGoal) => {
    setNewGoal({
      title: goal.title,
      target_amount: goal.target_amount.toString(),
      current_amount: goal.current_amount.toString(),
      deadline: goal.deadline,
      category: goal.category
    })
    setEditingId(goal.id)
    setIsEditMode(true)
    setIsModalOpen(true)
  }

  const handleDeleteGoal = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta meta?')) return
    try {
      await deleteFinancialGoal(id)
      toast.success('Meta excluída!')
      loadGoals()
    } catch (err) {
      toast.error('Erro ao excluir meta')
    }
  }

  const handleAddMoney = async () => {
    if (!addAmount || parseFloat(addAmount) <= 0) {
      toast.error('Digite um valor válido!')
      return
    }
    const goal = goals.find(g => g.id === selectedGoalId)
    if (!goal) return

    try {
      await updateFinancialGoal(goal.id, {
        current_amount: goal.current_amount + parseFloat(addAmount)
      })
      toast.success('Valor adicionado!')
      setAddAmount('')
      setIsAddMoneyOpen(false)
      setSelectedGoalId(null)
      loadGoals()
    } catch (err) {
      toast.error('Erro ao adicionar valor')
    }
  }

  const getCategoryColor = (cat: string) => {
    const m: Record<string, string> = {
      savings: 'from-accent-green to-primary',
      investment: 'from-primary to-accent-purple',
      purchase: 'from-accent-yellow to-accent-red',
      other: 'from-gray-600 to-gray-400'
    }
    return m[cat] || m.other
  }

  const getCategoryLabel = (cat: string) => {
    const m: Record<string, string> = { savings: 'Poupança', investment: 'Investimento', purchase: 'Compra', other: 'Outro' }
    return m[cat] || 'Outro'
  }

  const modals = (
    <>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={resetModal} />
          <div className="relative bg-dark-card rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 border border-dark-border shadow-corporate-lg animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                {isEditMode ? 'Editar Meta' : 'Nova Meta'}
              </h3>
              <button onClick={resetModal} className="p-2 hover:bg-dark-hover rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label-premium">Título *</label>
                <input type="text" value={newGoal.title} onChange={e => setNewGoal({ ...newGoal, title: e.target.value })} className="input-premium" placeholder="Ex: Reserva de Emergência" />
              </div>
              <div>
                <label className="label-premium">Valor Meta (R$) *</label>
                <input type="number" value={newGoal.target_amount} onChange={e => setNewGoal({ ...newGoal, target_amount: e.target.value })} className="input-premium" placeholder="20000" />
              </div>
              <div>
                <label className="label-premium">Valor Atual (R$)</label>
                <input type="number" value={newGoal.current_amount} onChange={e => setNewGoal({ ...newGoal, current_amount: e.target.value })} className="input-premium" placeholder="0" />
              </div>
              <div>
                <label className="label-premium">Data Limite *</label>
                <input type="date" value={newGoal.deadline} onChange={e => setNewGoal({ ...newGoal, deadline: e.target.value })} className="input-premium" />
              </div>
              <div>
                <label className="label-premium">Categoria</label>
                <select value={newGoal.category} onChange={e => setNewGoal({ ...newGoal, category: e.target.value as FinancialGoal['category'] })} className="input-premium">
                  <option value="savings">Poupança</option>
                  <option value="investment">Investimento</option>
                  <option value="purchase">Compra</option>
                  <option value="other">Outro</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={resetModal} className="btn-secondary flex-1">Cancelar</button>
                <button onClick={handleAddGoal} className="btn-primary flex-1">
                  {isEditMode ? 'Salvar Alterações' : 'Criar Meta'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isAddMoneyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setIsAddMoneyOpen(false); setAddAmount('') }} />
          <div className="relative bg-dark-card rounded-2xl max-w-sm w-full p-6 border border-dark-border shadow-corporate-lg animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Adicionar Dinheiro</h3>
              <button onClick={() => { setIsAddMoneyOpen(false); setAddAmount('') }} className="p-2 hover:bg-dark-hover rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label-premium">Quanto deseja adicionar? (R$)</label>
                <input type="number" value={addAmount} onChange={e => setAddAmount(e.target.value)} className="input-premium number-font text-2xl" placeholder="500" autoFocus />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => { setIsAddMoneyOpen(false); setAddAmount('') }} className="btn-secondary flex-1">Cancelar</button>
                <button onClick={handleAddMoney} className="btn-primary flex-1">Adicionar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )

  return (
    <>
      <div className="card-premium">
        <div className="p-6 border-b border-dark-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-accent-yellow to-accent-orange rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Metas Financeiras</h3>
                <p className="text-sm text-gray-400">Acompanhe seus objetivos</p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsEditMode(false)
                setEditingId(null)
                setNewGoal({ title: '', target_amount: '', current_amount: '', deadline: '', category: 'savings' })
                setIsModalOpen(true)
              }}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Nova Meta
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {goals.map((goal, index) => {
            const progress = (goal.current_amount / goal.target_amount) * 100
            const remaining = goal.target_amount - goal.current_amount
            const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))

            return (
              <div key={goal.id} className="bg-dark-card rounded-xl p-4 hover:bg-dark-hover transition-all group" style={{ animationDelay: `${index * 50}ms` }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                        {getCategoryLabel(goal.category)}
                      </span>
                      <h4 className="font-bold text-white">{goal.title}</h4>
                    </div>
                    <p className="text-sm text-gray-400">
                      {daysLeft > 0 ? `Faltam ${daysLeft} dias` : 'Prazo encerrado'} • Meta: {new Date(goal.deadline + 'T12:00:00').toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleEditGoal(goal)} className="opacity-0 group-hover:opacity-100 p-2 hover:bg-primary/10 rounded-lg transition-all" title="Editar meta">
                      <Edit className="w-4 h-4 text-primary" />
                    </button>
                    <button onClick={() => handleDeleteGoal(goal.id)} className="opacity-0 group-hover:opacity-100 p-2 hover:bg-accent-red/10 rounded-lg transition-all" title="Excluir meta">
                      <Trash2 className="w-4 h-4 text-accent-red" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Progresso</span>
                    <span className="font-bold text-white">{progress.toFixed(1)}%</span>
                  </div>
                  <div className="h-3 bg-dark-bg rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${getCategoryColor(goal.category)} rounded-full transition-all duration-1000`} style={{ width: `${Math.min(progress, 100)}%` }} />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <p className="text-xs text-gray-500">Atual</p>
                      <p className="font-bold text-primary number-font">{formatCurrency(goal.current_amount)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Falta</p>
                      <p className="font-bold text-accent-yellow number-font">{formatCurrency(Math.max(remaining, 0))}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Meta</p>
                      <p className="font-bold text-accent-green number-font">{formatCurrency(goal.target_amount)}</p>
                    </div>
                  </div>

                  {remaining > 0 && daysLeft > 0 && (
                    <div className="mt-3 space-y-2">
                      <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                        <div className="flex items-center gap-2 text-sm">
                          <TrendingUp className="w-4 h-4 text-primary" />
                          <span className="text-gray-300">
                            Aporte sugerido: <span className="font-bold text-primary number-font">{formatCurrency(remaining / (daysLeft / 30))}</span>/mês
                          </span>
                        </div>
                      </div>
                      <button onClick={() => { setSelectedGoalId(goal.id); setIsAddMoneyOpen(true) }} className="w-full btn-primary flex items-center justify-center gap-2 py-2">
                        <DollarSign className="w-4 h-4" />
                        Adicionar Dinheiro
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {goals.length === 0 && loaded && (
            <div className="text-center py-8">
              <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-2 font-medium">Nenhuma meta definida</p>
              <p className="text-sm text-gray-500 mb-4">Crie suas metas financeiras para acompanhar seus objetivos</p>
              <button onClick={() => setIsModalOpen(true)} className="btn-primary">Criar Primeira Meta</button>
            </div>
          )}
        </div>
      </div>

      {typeof document !== 'undefined' && createPortal(modals, document.body)}
    </>
  )
}
