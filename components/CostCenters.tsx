'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { FolderKanban, Plus, Trash2, Edit, X, DollarSign, TrendingUp, AlertTriangle, CheckCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

import { getCostCenters, createCostCenter, updateCostCenter, deleteCostCenter, CostCenter, supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

const STORAGE_KEY = 'nexus-cost-centers'

export default function CostCenters() {
    const [centers, setCenters] = useState<CostCenter[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingCenter, setEditingCenter] = useState<CostCenter | null>(null)
    const [isExpenseOpen, setIsExpenseOpen] = useState(false)
    const [expenseTarget, setExpenseTarget] = useState<CostCenter | null>(null)
    const [expenseAmount, setExpenseAmount] = useState('')
    const [expandedCenter, setExpandedCenter] = useState<string | null>(null)

    const [loading, setLoading] = useState(true)

    const [formData, setFormData] = useState({ name: '', company: '', budget: '', status: 'active' as CostCenter['status'] })

    useEffect(() => {
        loadData()

        const channel = supabase
            .channel('cost_centers_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'cost_centers' }, () => {
                loadData()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const loadData = async () => {
        setLoading(true)
        try {
            const data = await getCostCenters()

            if (data.length === 0 && typeof window !== 'undefined') {
                const stored = localStorage.getItem(STORAGE_KEY)
                if (stored) {
                    try {
                        const localCenters = JSON.parse(stored) as any[]
                        for (const c of localCenters) {
                            await createCostCenter({
                                name: c.name,
                                company: c.company || '',
                                budget: c.budget,
                                spent: c.spent || 0,
                                status: c.status || 'active'
                            })
                        }
                        localStorage.removeItem(STORAGE_KEY)
                        const fresh = await getCostCenters()
                        setCenters(fresh)
                        toast.success('Projetos migrados para o banco de dados!')
                    } catch (e) {
                        console.error('Erro na migração:', e)
                    }
                } else {
                    setCenters(data)
                }
            } else {
                setCenters(data)
            }
        } catch (err) {
            console.error('Erro ao carregar centros de custo:', err)
        } finally {
            setLoading(false)
        }
    }

    const resetModal = () => {
        setIsModalOpen(false)
        setEditingCenter(null)
        setFormData({ name: '', company: '', budget: '', status: 'active' })
    }

    const handleSubmit = async () => {
        if (!formData.name.trim() || !formData.budget) return

        try {
            if (editingCenter) {
                await updateCostCenter(editingCenter.id, {
                    name: formData.name,
                    company: formData.company,
                    budget: parseFloat(formData.budget),
                    status: formData.status
                })
                toast.success('Projeto atualizado!')
            } else {
                await createCostCenter({
                    name: formData.name,
                    company: formData.company,
                    budget: parseFloat(formData.budget),
                    spent: 0,
                    status: formData.status
                })
                toast.success('Projeto criado!')
            }
            resetModal()
            loadData()
        } catch (err) {
            toast.error('Erro ao salvar projeto')
        }
    }

    const handleDelete = async (id: string) => {
        if (expandedCenter === id) setExpandedCenter(null)
        if (!confirm('Tem certeza que deseja excluir este projeto?')) return
        try {
            await deleteCostCenter(id)
            toast.success('Projeto excluído')
            loadData()
        } catch (err) {
            toast.error('Erro ao excluir')
        }
    }

    const handleEdit = (center: CostCenter, e: React.MouseEvent) => {
        e.stopPropagation()
        setEditingCenter(center)
        setFormData({ name: center.name, company: center.company || '', budget: center.budget.toString(), status: center.status })
        setIsModalOpen(true)
    }

    const handleAddExpense = async () => {
        if (!expenseTarget || !expenseAmount || parseFloat(expenseAmount) <= 0) return
        
        try {
            await updateCostCenter(expenseTarget.id, {
                spent: expenseTarget.spent + parseFloat(expenseAmount)
            })
            toast.success('Despesa lançada com sucesso!')
            setIsExpenseOpen(false)
            setExpenseTarget(null)
            setExpenseAmount('')
            loadData()
        } catch (err) {
            toast.error('Erro ao lançar despesa')
        }
    }

    const totalBudget = centers.reduce((s, c) => s + c.budget, 0)
    const totalSpent = centers.reduce((s, c) => s + c.spent, 0)

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return <Clock className="w-3.5 h-3.5 text-accent-orange" />
            case 'completed': return <CheckCircle className="w-3.5 h-3.5 text-accent-green" />
            case 'paused': return <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />
            default: return null
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'active': return 'Ativo'
            case 'completed': return 'Concluído'
            case 'paused': return 'Pausado'
            default: return status
        }
    }

    const modals = (
        <>
            {/* Modal Novo/Editar Centro */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={resetModal} />
                    <div className="relative bg-[#0f1115] rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 border border-white/10 shadow-corporate-lg animate-slide-up">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-white">
                                {editingCenter ? 'Editar Projeto' : 'Novo Projeto'}
                            </h3>
                            <button onClick={resetModal} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Nome do Projeto</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-[#161922] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-accent-orange focus:outline-none"
                                    placeholder="Ex: Expansão Filial SP"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Empresa</label>
                                <input
                                    type="text"
                                    value={formData.company}
                                    onChange={e => setFormData({ ...formData, company: e.target.value })}
                                    className="w-full bg-[#161922] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-accent-orange focus:outline-none"
                                    placeholder="Ex: Nexus Tech"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Orçamento (R$)</label>
                                <input
                                    type="number"
                                    value={formData.budget}
                                    onChange={e => setFormData({ ...formData, budget: e.target.value })}
                                    className="w-full bg-[#161922] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-accent-orange focus:outline-none"
                                    placeholder="50000"
                                    min="0"
                                    step="100"
                                />
                            </div>
                            {editingCenter && (
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value as CostCenter['status'] })}
                                        className="w-full bg-[#161922] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-accent-orange focus:outline-none"
                                    >
                                        <option value="active">Ativo</option>
                                        <option value="completed">Concluído</option>
                                        <option value="paused">Pausado</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={!formData.name.trim() || !formData.budget}
                            className="w-full mt-6 py-3 bg-gradient-to-r from-accent-orange to-amber-500 hover:from-accent-orange hover:to-orange-500 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(249,115,22,0.3)]"
                        >
                            {editingCenter ? 'Salvar Alterações' : 'Criar Projeto'}
                        </button>
                    </div>
                </div>
            )}

            {/* Modal Lançar Despesa */}
            {isExpenseOpen && expenseTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => { setIsExpenseOpen(false); setExpenseAmount('') }} />
                    <div className="relative bg-[#0f1115] rounded-2xl max-w-sm w-full p-6 border border-white/10 shadow-corporate-lg animate-slide-up">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-white">Lançar Despesa</h3>
                            <button onClick={() => { setIsExpenseOpen(false); setExpenseAmount('') }} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                        <p className="text-sm text-gray-400 mb-4">Projeto: <span className="text-white font-medium">{expenseTarget.name}</span></p>
                        <input
                            type="number"
                            value={expenseAmount}
                            onChange={e => setExpenseAmount(e.target.value)}
                            className="w-full bg-[#161922] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-accent-red focus:outline-none mb-4"
                            placeholder="Valor da despesa"
                            min="0"
                            step="100"
                            autoFocus
                        />
                        <button
                            onClick={handleAddExpense}
                            disabled={!expenseAmount || parseFloat(expenseAmount) <= 0}
                            className="w-full py-3 bg-red-500/20 border border-red-500/40 hover:bg-red-500/30 text-red-500 font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Lançar {expenseAmount ? formatCurrency(parseFloat(expenseAmount)) : 'R$ 0,00'}
                        </button>
                    </div>
                </div>
            )}
        </>
    )

    return (
        <>
            <div className="card-premium flex flex-col h-full relative overflow-hidden">
                <div className="relative z-10 p-5 border-b border-dark-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/20 rounded-xl flex items-center justify-center">
                            <FolderKanban className="w-5 h-5 text-orange-400" />
                        </div>
                        <div>
                            <h3 className="font-bold tracking-wide text-white">Centro de Custos</h3>
                            <p className="text-xs text-gray-400">Projetos e orçamentos</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 rounded-lg text-orange-400 text-xs font-medium transition-colors"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Novo Projeto
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="relative z-10 grid grid-cols-3 gap-3 p-5 pb-2">
                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3 text-center shadow-inner">
                        <p className="text-[10px] uppercase text-gray-500 tracking-wider">Orçamento Total</p>
                        <p className="text-lg font-bold number-font text-white">{formatCurrency(totalBudget)}</p>
                    </div>
                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3 text-center shadow-inner">
                        <p className="text-[10px] uppercase text-gray-500 tracking-wider">Gasto Total</p>
                        <p className="text-lg font-bold number-font text-red-400">{formatCurrency(totalSpent)}</p>
                    </div>
                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3 text-center shadow-inner">
                        <p className="text-[10px] uppercase text-gray-500 tracking-wider">Disponível</p>
                        <p className={`text-lg font-bold number-font ${totalBudget - totalSpent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {formatCurrency(totalBudget - totalSpent)}
                        </p>
                    </div>
                </div>

                {/* Projects List */}
                <div className="relative z-10 px-5 pb-5 space-y-3 flex-1 overflow-y-auto">
                    {centers.length === 0 ? (
                        <div className="text-center py-10">
                            <FolderKanban className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-400 text-sm">Nenhum projeto cadastrado</p>
                            <p className="text-gray-500 text-xs mt-1">Crie centros de custo para controlar orçamentos</p>
                        </div>
                    ) : (
                        centers.map(center => {
                            const pct = center.budget > 0 ? (center.spent / center.budget) * 100 : 0
                            const isOver = pct > 100
                            const remaining = center.budget - center.spent
                            const burnColor = pct >= 90 ? 'bg-red-500/80' : pct >= 70 ? 'bg-yellow-500/80' : 'bg-emerald-500/80'
                            const isExpanded = expandedCenter === center.id

                            return (
                                <motion.div
                                    key={center.id}
                                    initial={false}
                                    className="bg-white/[0.02] border border-white/[0.05] hover:border-orange-500/20 transition-colors rounded-xl overflow-hidden group"
                                >
                                    <div
                                        className="p-4 cursor-pointer"
                                        onClick={() => setExpandedCenter(isExpanded ? null : center.id)}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1 min-w-0 pr-4">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-medium text-white truncate text-sm">{center.name}</h4>
                                                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/40 text-[10px] uppercase tracking-wider">
                                                        {getStatusIcon(center.status)}
                                                        <span className="text-gray-400">{getStatusLabel(center.status)}</span>
                                                    </div>
                                                </div>
                                                {center.company && (
                                                    <p className="text-[11px] text-gray-500 uppercase tracking-wide">{center.company}</p>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setExpenseTarget(center); setIsExpenseOpen(true) }}
                                                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors border border-transparent hover:border-white/10"
                                                    title="Lançar despesa"
                                                >
                                                    <DollarSign className="w-3.5 h-3.5 text-gray-300" />
                                                </button>
                                                <button onClick={(e) => handleEdit(center, e)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                                                    <Edit className="w-3.5 h-3.5 text-gray-400" />
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); handleDelete(center.id) }} className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors">
                                                    <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-400" />
                                                </button>
                                                <div className="w-px h-4 bg-white/10 mx-1" />
                                                <div className="p-1 text-gray-500">
                                                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="h-1.5 bg-black/40 rounded-full overflow-hidden mb-2 shadow-inner">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${burnColor}`}
                                                style={{ width: `${Math.min(pct, 100)}%` }}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between text-[11px]">
                                            <span className="text-gray-500 flex items-center gap-1">
                                                <TrendingUp className="w-3 h-3" />
                                                {formatCurrency(center.spent)} / {formatCurrency(center.budget)}
                                            </span>
                                            <span className={`font-bold number-font ${isOver ? 'text-red-400' : 'text-gray-400'}`}>
                                                {pct.toFixed(0)}%{isOver && ' (ESTOURADO)'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Expanded Detail View */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="border-t border-white/[0.05] bg-black/20"
                                            >
                                                <div className="p-4 space-y-3">
                                                    <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                                        <FolderKanban className="w-3 h-3" /> Detalhamento Analítico
                                                    </h5>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="bg-white/[0.03] rounded-lg p-3 border border-white/[0.02]">
                                                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Gasto Realizado</p>
                                                            <p className="text-sm font-bold text-red-400 number-font mt-0.5">{formatCurrency(center.spent)}</p>
                                                        </div>
                                                        <div className="bg-white/[0.03] rounded-lg p-3 border border-white/[0.02]">
                                                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Orçamento Original</p>
                                                            <p className="text-sm font-bold text-gray-300 number-font mt-0.5">{formatCurrency(center.budget)}</p>
                                                        </div>
                                                        <div className="col-span-2 bg-gradient-to-r from-orange-500/10 to-transparent rounded-lg p-3 flex items-center justify-between border-l-2 border-orange-500">
                                                            <span className="text-xs text-orange-200/70">Capital Restante para Alocação</span>
                                                            <span className={`text-sm font-bold number-font ${remaining >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                                {formatCurrency(remaining)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {center.spent === 0 && (
                                                        <div className="text-center py-4 bg-white/[0.02] rounded-lg border border-dashed border-white/5">
                                                            <p className="text-xs text-gray-500">Nenhuma despesa lançada neste projeto ainda.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            )
                        })
                    )}
                </div>
            </div>

            {typeof document !== 'undefined' && createPortal(modals, document.body)}
        </>
    )
}
