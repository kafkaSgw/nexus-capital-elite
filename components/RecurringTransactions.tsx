'use client'

import { useState, useEffect } from 'react'
import {
    CalendarClock, Plus, X, Check, Trash2, Edit,
    ArrowUpRight, ArrowDownRight, RotateCcw, Clock
} from 'lucide-react'
import { getScheduledTransactions, createScheduledTransaction, updateScheduledTransaction, deleteScheduledTransaction, ScheduledTransaction } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import { createPortal } from 'react-dom'
import toast from 'react-hot-toast'

export default function RecurringTransactions() {
    const [items, setItems] = useState<ScheduledTransaction[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('all')
    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        type: 'expense' as 'income' | 'expense',
        category: 'Outros',
        due_date: '',
        is_recurring: true,
        recurrence_type: 'monthly' as 'weekly' | 'monthly' | 'yearly'
    })

    useEffect(() => { loadData() }, [])

    const loadData = async () => {
        try {
            const data = await getScheduledTransactions()
            setItems(data)
        } catch (err) {
            console.error('Erro ao carregar agendamentos:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async () => {
        if (!formData.description || !formData.amount || !formData.due_date) {
            toast.error('Preencha todos os campos obrigatórios')
            return
        }
        try {
            const amount = parseFloat(formData.amount)
            await createScheduledTransaction({
                description: formData.description,
                amount: formData.type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
                type: formData.type,
                category: formData.category,
                due_date: formData.due_date,
                is_recurring: formData.is_recurring,
                recurrence_type: formData.is_recurring ? formData.recurrence_type : null,
                is_paid: false,
                company_id: null
            })
            toast.success('Agendamento criado!')
            resetForm()
            loadData()
        } catch (err) {
            toast.error('Erro ao criar agendamento')
        }
    }

    const handleMarkPaid = async (item: ScheduledTransaction) => {
        try {
            await updateScheduledTransaction(item.id, { is_paid: true })
            toast.success('Marcado como pago!')
            loadData()
        } catch (err) {
            toast.error('Erro ao atualizar')
        }
    }

    const handleUnmarkPaid = async (item: ScheduledTransaction) => {
        try {
            await updateScheduledTransaction(item.id, { is_paid: false })
            toast.success('Desmarcado!')
            loadData()
        } catch (err) {
            toast.error('Erro ao atualizar')
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Excluir este agendamento?')) return
        try {
            await deleteScheduledTransaction(id)
            toast.success('Excluído!')
            loadData()
        } catch (err) {
            toast.error('Erro ao excluir')
        }
    }

    const resetForm = () => {
        setFormData({ description: '', amount: '', type: 'expense', category: 'Outros', due_date: '', is_recurring: true, recurrence_type: 'monthly' })
        setShowModal(false)
    }

    const filtered = items.filter(i => {
        if (filter === 'pending') return !i.is_paid
        if (filter === 'paid') return i.is_paid
        return true
    })

    const totalPending = items.filter(i => !i.is_paid).reduce((s, i) => s + Math.abs(i.amount), 0)
    const pendingCount = items.filter(i => !i.is_paid).length

    const getRecurrenceLabel = (type?: string | null) => {
        if (!type) return ''
        const m: Record<string, string> = { weekly: 'Semanal', monthly: 'Mensal', yearly: 'Anual' }
        return m[type] || type
    }

    const isOverdue = (dueDate: string, isPaid: boolean) => {
        if (isPaid) return false
        return new Date(dueDate) < new Date(new Date().toISOString().split('T')[0])
    }

    const modal = showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={resetForm} />
            <div className="relative bg-dark-card rounded-2xl max-w-md w-full p-6 border border-dark-border shadow-corporate-lg animate-slide-up">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">Novo Agendamento</h3>
                    <button onClick={resetForm} className="p-2 hover:bg-dark-hover rounded-lg transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <button type="button" onClick={() => setFormData({ ...formData, type: 'income' })}
                            className={`px-4 py-3 rounded-xl font-medium transition-all ${formData.type === 'income' ? 'bg-accent-green/20 border-2 border-accent-green text-accent-green' : 'bg-dark-card border border-dark-border text-gray-400'}`}>
                            Receita
                        </button>
                        <button type="button" onClick={() => setFormData({ ...formData, type: 'expense' })}
                            className={`px-4 py-3 rounded-xl font-medium transition-all ${formData.type === 'expense' ? 'bg-accent-red/20 border-2 border-accent-red text-accent-red' : 'bg-dark-card border border-dark-border text-gray-400'}`}>
                            Despesa
                        </button>
                    </div>
                    <div>
                        <label className="label-premium">Descrição *</label>
                        <input type="text" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="input-premium" placeholder="Ex: Aluguel" />
                    </div>
                    <div>
                        <label className="label-premium">Valor (R$) *</label>
                        <input type="number" step="0.01" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} className="input-premium number-font" placeholder="0.00" />
                    </div>
                    <div>
                        <label className="label-premium">Categoria</label>
                        <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="input-premium">
                            {['Moradia', 'Alimentação', 'Transporte', 'Saúde', 'Educação', 'Lazer', 'Salário', 'Freelance', 'Interpira', 'TikTok', 'Outros'].map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="label-premium">Próximo Vencimento *</label>
                        <input type="date" value={formData.due_date} onChange={e => setFormData({ ...formData, due_date: e.target.value })} className="input-premium" />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02]">
                        <span className="text-sm text-white">Recorrente?</span>
                        <button type="button" onClick={() => setFormData({ ...formData, is_recurring: !formData.is_recurring })}
                            className={`w-10 h-6 rounded-full transition-colors relative ${formData.is_recurring ? 'bg-primary' : 'bg-gray-700'}`}>
                            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${formData.is_recurring ? 'right-1' : 'left-1'}`} />
                        </button>
                    </div>
                    {formData.is_recurring && (
                        <div>
                            <label className="label-premium">Frequência</label>
                            <select value={formData.recurrence_type} onChange={e => setFormData({ ...formData, recurrence_type: e.target.value as any })} className="input-premium">
                                <option value="weekly">Semanal</option>
                                <option value="monthly">Mensal</option>
                                <option value="yearly">Anual</option>
                            </select>
                        </div>
                    )}
                    <div className="flex gap-3 pt-4">
                        <button onClick={resetForm} className="btn-secondary flex-1">Cancelar</button>
                        <button onClick={handleSubmit} className="btn-primary flex-1">Criar</button>
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
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-orange/20 to-accent-yellow/20 flex items-center justify-center border border-accent-orange/10">
                                <CalendarClock className="w-4 h-4 text-accent-orange" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-white">Transações Recorrentes</h3>
                                <p className="text-xs text-gray-500">{pendingCount} pendente{pendingCount !== 1 ? 's' : ''} • {formatCurrency(totalPending)}</p>
                            </div>
                        </div>
                        <button onClick={() => setShowModal(true)} className="p-2 hover:bg-white/[0.04] rounded-lg transition-colors text-primary">
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Filter tabs */}
                <div className="px-5 pt-4 flex gap-2">
                    {([['all', 'Todos'], ['pending', 'Pendentes'], ['paid', 'Pagos']] as const).map(([key, label]) => (
                        <button key={key} onClick={() => setFilter(key)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === key ? 'bg-primary/20 text-primary border border-primary/30' : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'}`}>
                            {label}
                        </button>
                    ))}
                </div>

                <div className="p-5 space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="space-y-2">{[1, 2, 3].map(i => <div key={i} className="loading-shimmer h-16 rounded-xl" />)}</div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-6">
                            <CalendarClock className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                            <p className="text-sm text-gray-400">Nenhum agendamento</p>
                        </div>
                    ) : (
                        filtered.map(item => {
                            const overdue = isOverdue(item.due_date, item.is_paid)
                            return (
                                <div key={item.id} className={`flex items-center justify-between p-3 rounded-xl transition-colors group ${item.is_paid ? 'bg-white/[0.01] opacity-60' : overdue ? 'bg-accent-red/5 border border-accent-red/10' : 'bg-white/[0.02] hover:bg-white/[0.04]'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.type === 'income' ? 'bg-accent-green/10' : 'bg-accent-red/10'}`}>
                                            {item.type === 'income' ? <ArrowUpRight className="w-4 h-4 text-accent-green" /> : <ArrowDownRight className="w-4 h-4 text-accent-red" />}
                                        </div>
                                        <div>
                                            <p className={`text-sm font-medium ${item.is_paid ? 'line-through text-gray-500' : 'text-white'}`}>{item.description}</p>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <span>{new Date(item.due_date + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                                                {item.is_recurring && (
                                                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-accent-purple/10 text-accent-purple">
                                                        <RotateCcw className="w-3 h-3" /> {getRecurrenceLabel(item.recurrence_type)}
                                                    </span>
                                                )}
                                                {overdue && <span className="text-accent-red font-medium">Vencido!</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-sm font-bold number-font ${item.type === 'income' ? 'text-accent-green' : 'text-accent-red'}`}>
                                            {formatCurrency(Math.abs(item.amount))}
                                        </span>
                                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {!item.is_paid ? (
                                                <button onClick={() => handleMarkPaid(item)} className="p-1.5 hover:bg-accent-green/10 rounded-lg transition-colors" title="Marcar como pago">
                                                    <Check className="w-3.5 h-3.5 text-accent-green" />
                                                </button>
                                            ) : (
                                                <button onClick={() => handleUnmarkPaid(item)} className="p-1.5 hover:bg-accent-yellow/10 rounded-lg transition-colors" title="Desmarcar">
                                                    <Clock className="w-3.5 h-3.5 text-accent-yellow" />
                                                </button>
                                            )}
                                            <button onClick={() => handleDelete(item.id)} className="p-1.5 hover:bg-accent-red/10 rounded-lg transition-colors" title="Excluir">
                                                <Trash2 className="w-3.5 h-3.5 text-accent-red" />
                                            </button>
                                        </div>
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
