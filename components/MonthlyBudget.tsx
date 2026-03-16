'use client'

import { useState, useEffect } from 'react'
import {
    Target, Plus, X, ChevronLeft, ChevronRight,
    AlertTriangle, TrendingUp
} from 'lucide-react'
import { getBudgets, createBudget, updateBudget, deleteBudget, getTransactions, Budget, Transaction } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import { createPortal } from 'react-dom'
import toast from 'react-hot-toast'

const CATEGORIES = [
    'Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde',
    'Educação', 'Interpira', 'TikTok', 'Afiliados', 'Freelance', 'Outros'
]

export default function MonthlyBudget() {
    const [budgets, setBudgets] = useState<Budget[]>([])
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)
    const [currentMonth, setCurrentMonth] = useState(() => {
        const now = new Date()
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    })
    const [showModal, setShowModal] = useState(false)
    const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
    const [formData, setFormData] = useState({ category: 'Alimentação', limit_amount: '' })

    useEffect(() => { loadData() }, [currentMonth])

    const loadData = async () => {
        try {
            const [bdg, txs] = await Promise.all([
                getBudgets(currentMonth),
                getTransactions()
            ])
            setBudgets(bdg)
            setTransactions(txs)
        } catch (err) {
            console.error('Erro ao carregar orçamento:', err)
        } finally {
            setLoading(false)
        }
    }

    const getMonthSpending = (category: string) => {
        return transactions
            .filter(t => {
                const txMonth = t.created_at.substring(0, 7)
                return t.type === 'expense' && t.category === category && txMonth === currentMonth
            })
            .reduce((sum, t) => sum + Math.abs(t.amount), 0)
    }

    const navigateMonth = (direction: number) => {
        const [year, month] = currentMonth.split('-').map(Number)
        const d = new Date(year, month - 1 + direction, 1)
        setCurrentMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
    }

    const getMonthLabel = () => {
        const [year, month] = currentMonth.split('-').map(Number)
        return new Date(year, month - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    }

    const handleSubmit = async () => {
        if (!formData.limit_amount || parseFloat(formData.limit_amount) <= 0) {
            toast.error('Valor do limite deve ser maior que zero')
            return
        }
        try {
            if (editingBudget) {
                await updateBudget(editingBudget.id, { limit_amount: parseFloat(formData.limit_amount) })
                toast.success('Orçamento atualizado!')
            } else {
                await createBudget({
                    category: formData.category,
                    limit_amount: parseFloat(formData.limit_amount),
                    month: currentMonth
                })
                toast.success('Orçamento criado!')
            }
            resetForm()
            loadData()
        } catch (err: any) {
            if (err?.message?.includes('unique') || err?.code === '23505') {
                toast.error('Já existe orçamento para essa categoria neste mês')
            } else {
                toast.error('Erro ao salvar orçamento')
            }
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Excluir este orçamento?')) return
        try {
            await deleteBudget(id)
            toast.success('Orçamento excluído!')
            loadData()
        } catch (err) {
            toast.error('Erro ao excluir')
        }
    }

    const resetForm = () => {
        setFormData({ category: 'Alimentação', limit_amount: '' })
        setEditingBudget(null)
        setShowModal(false)
    }

    const totalBudgeted = budgets.reduce((s, b) => s + b.limit_amount, 0)
    const totalSpent = budgets.reduce((s, b) => s + getMonthSpending(b.category), 0)
    const totalPercent = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0

    const getBarColor = (pct: number) => {
        if (pct >= 90) return 'from-accent-red to-accent-orange'
        if (pct >= 70) return 'from-accent-yellow to-accent-orange'
        return 'from-accent-green to-primary'
    }

    // Available categories not yet budgeted
    const usedCategories = budgets.map(b => b.category)
    const availableCategories = CATEGORIES.filter(c => !usedCategories.includes(c))

    const modal = showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={resetForm} />
            <div className="relative bg-dark-card rounded-2xl max-w-sm w-full p-6 border border-dark-border shadow-corporate-lg animate-slide-up">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">
                        {editingBudget ? 'Editar Limite' : 'Novo Orçamento'}
                    </h3>
                    <button onClick={resetForm} className="p-2 hover:bg-dark-hover rounded-lg transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>
                <div className="space-y-4">
                    {!editingBudget && (
                        <div>
                            <label className="label-premium">Categoria</label>
                            <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="input-premium">
                                {availableCategories.map(c => (<option key={c} value={c}>{c}</option>))}
                            </select>
                            {availableCategories.length === 0 && (
                                <p className="text-xs text-accent-yellow mt-1">Todas as categorias já possuem orçamento neste mês</p>
                            )}
                        </div>
                    )}
                    <div>
                        <label className="label-premium">Limite Mensal (R$)</label>
                        <input type="number" step="0.01" min="0" value={formData.limit_amount}
                            onChange={e => setFormData({ ...formData, limit_amount: e.target.value })}
                            className="input-premium number-font text-lg" placeholder="1500.00" autoFocus />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button onClick={resetForm} className="btn-secondary flex-1">Cancelar</button>
                        <button onClick={handleSubmit} className="btn-primary flex-1" disabled={!editingBudget && availableCategories.length === 0}>
                            {editingBudget ? 'Salvar' : 'Criar'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )

    return (
        <>
            <div className="card-premium">
                <div className="p-5 border-b border-white/[0.04]">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-cyan/20 to-primary/20 flex items-center justify-center border border-accent-cyan/10">
                                <Target className="w-4 h-4 text-accent-cyan" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-white">Orçamento Mensal</h3>
                                <p className="text-xs text-gray-500">Controle de gastos por categoria</p>
                            </div>
                        </div>
                        <button onClick={() => { setEditingBudget(null); setFormData({ category: availableCategories[0] || 'Outros', limit_amount: '' }); setShowModal(true) }}
                            className="p-2 hover:bg-white/[0.04] rounded-lg transition-colors text-primary">
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Month Navigator */}
                <div className="px-5 pt-4 flex items-center justify-between">
                    <button onClick={() => navigateMonth(-1)} className="p-2 hover:bg-white/[0.04] rounded-lg transition-colors">
                        <ChevronLeft className="w-4 h-4 text-gray-400" />
                    </button>
                    <span className="text-sm font-medium text-white capitalize">{getMonthLabel()}</span>
                    <button onClick={() => navigateMonth(1)} className="p-2 hover:bg-white/[0.04] rounded-lg transition-colors">
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                </div>

                {/* Total Summary */}
                {budgets.length > 0 && (
                    <div className="mx-5 mt-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                        <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-gray-400">Total Gasto / Orçado</span>
                            <span className={`font-bold number-font ${totalPercent > 90 ? 'text-accent-red' : 'text-white'}`}>
                                {formatCurrency(totalSpent)} / {formatCurrency(totalBudgeted)}
                            </span>
                        </div>
                        <div className="h-2 bg-dark-bg rounded-full overflow-hidden">
                            <div className={`h-full bg-gradient-to-r ${getBarColor(totalPercent)} rounded-full transition-all duration-700`}
                                style={{ width: `${Math.min(totalPercent, 100)}%` }} />
                        </div>
                    </div>
                )}

                <div className="p-5 space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="space-y-2">{[1, 2, 3].map(i => <div key={i} className="loading-shimmer h-20 rounded-xl" />)}</div>
                    ) : budgets.length === 0 ? (
                        <div className="text-center py-6">
                            <Target className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                            <p className="text-sm text-gray-400">Nenhum orçamento definido</p>
                            <button onClick={() => setShowModal(true)} className="text-sm text-primary hover:text-primary-light mt-2 transition-colors">
                                Criar primeiro orçamento
                            </button>
                        </div>
                    ) : (
                        budgets.map(budget => {
                            const spent = getMonthSpending(budget.category)
                            const pct = (spent / budget.limit_amount) * 100
                            const remaining = budget.limit_amount - spent
                            return (
                                <div key={budget.id} className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.03] transition-colors group">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-white">{budget.category}</span>
                                            {pct >= 90 && <AlertTriangle className="w-3.5 h-3.5 text-accent-red" />}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs font-bold number-font ${pct >= 90 ? 'text-accent-red' : pct >= 70 ? 'text-accent-yellow' : 'text-accent-green'}`}>
                                                {pct.toFixed(0)}%
                                            </span>
                                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => { setEditingBudget(budget); setFormData({ category: budget.category, limit_amount: budget.limit_amount.toString() }); setShowModal(true) }}
                                                    className="p-1 hover:bg-primary/10 rounded transition-colors">
                                                    <TrendingUp className="w-3 h-3 text-primary" />
                                                </button>
                                                <button onClick={() => handleDelete(budget.id)}
                                                    className="p-1 hover:bg-accent-red/10 rounded transition-colors">
                                                    <X className="w-3 h-3 text-accent-red" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="h-2 bg-dark-bg rounded-full overflow-hidden mb-2">
                                        <div className={`h-full bg-gradient-to-r ${getBarColor(pct)} rounded-full transition-all duration-700`}
                                            style={{ width: `${Math.min(pct, 100)}%` }} />
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-500">Gasto: <span className="text-gray-300 number-font">{formatCurrency(spent)}</span></span>
                                        <span className="text-gray-500">
                                            {remaining >= 0
                                                ? <>Restante: <span className="text-accent-green number-font">{formatCurrency(remaining)}</span></>
                                                : <>Excedido: <span className="text-accent-red number-font">{formatCurrency(Math.abs(remaining))}</span></>
                                            }
                                        </span>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>

            {typeof document !== 'undefined' && createPortal(modal, document.body)}
        </>
    )
}
