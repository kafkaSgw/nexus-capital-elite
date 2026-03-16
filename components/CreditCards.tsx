'use client'

import { useState, useEffect } from 'react'
import { CreditCard, Plus, X, ChevronRight, AlertTriangle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { createPortal } from 'react-dom'

interface CreditCardType {
    id: string
    name: string
    last_four: string
    brand: string
    credit_limit: number
    used_amount: number
    closing_day: number
    due_day: number
    color: string
    user_id?: string
    created_at: string
}

interface CardInstallment {
    id: string
    card_id: string
    description: string
    total_amount: number
    installment_amount: number
    total_installments: number
    current_installment: number
    created_at: string
}

const CARD_COLORS = [
    'from-blue-600 to-blue-800',
    'from-purple-600 to-purple-800',
    'from-emerald-600 to-emerald-800',
    'from-red-600 to-red-800',
    'from-amber-600 to-amber-800',
    'from-pink-600 to-pink-800',
    'from-cyan-600 to-cyan-800',
    'from-slate-600 to-slate-800',
]

const BRANDS = ['Visa', 'Mastercard', 'Elo', 'Amex', 'Hipercard']

export default function CreditCards() {
    const [cards, setCards] = useState<CreditCardType[]>([])
    const [installments, setInstallments] = useState<CardInstallment[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddCard, setShowAddCard] = useState(false)
    const [showAddInstallment, setShowAddInstallment] = useState<string | null>(null)
    const [selectedCard, setSelectedCard] = useState<string | null>(null)

    // Form state
    const [form, setForm] = useState({
        name: '', last_four: '', brand: 'Visa', credit_limit: '', closing_day: '1', due_day: '10', color: CARD_COLORS[0]
    })
    const [installForm, setInstallForm] = useState({
        description: '', total_amount: '', total_installments: '2'
    })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const { data: cardsData } = await supabase.from('credit_cards').select('*').order('name')
            const { data: installData } = await supabase.from('card_installments').select('*').order('created_at', { ascending: false })
            setCards(cardsData || [])
            setInstallments(installData || [])
        } catch (err) {
            console.error('Erro ao carregar cartões:', err)
        } finally {
            setLoading(false)
        }
    }

    const getUserId = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        return user?.id
    }

    const handleAddCard = async () => {
        if (!form.name || !form.last_four || !form.credit_limit) {
            toast.error('Preencha todos os campos')
            return
        }
        try {
            const user_id = await getUserId()
            await supabase.from('credit_cards').insert([{
                name: form.name,
                last_four: form.last_four,
                brand: form.brand,
                credit_limit: parseFloat(form.credit_limit),
                used_amount: 0,
                closing_day: parseInt(form.closing_day),
                due_day: parseInt(form.due_day),
                color: form.color,
                user_id,
            }])
            toast.success('Cartão adicionado!')
            setShowAddCard(false)
            setForm({ name: '', last_four: '', brand: 'Visa', credit_limit: '', closing_day: '1', due_day: '10', color: CARD_COLORS[0] })
            loadData()
        } catch (err) {
            toast.error('Erro ao adicionar cartão')
        }
    }

    const handleAddInstallment = async (cardId: string) => {
        if (!installForm.description || !installForm.total_amount) {
            toast.error('Preencha todos os campos')
            return
        }
        try {
            const total = parseFloat(installForm.total_amount)
            const parcelas = parseInt(installForm.total_installments)
            const parcela = total / parcelas

            await supabase.from('card_installments').insert([{
                card_id: cardId,
                description: installForm.description,
                total_amount: total,
                installment_amount: parcela,
                total_installments: parcelas,
                current_installment: 1,
            }])

            // Update used amount
            const card = cards.find(c => c.id === cardId)
            if (card) {
                await supabase.from('credit_cards').update({ used_amount: card.used_amount + parcela }).eq('id', cardId)
            }

            toast.success('Parcela adicionada!')
            setShowAddInstallment(null)
            setInstallForm({ description: '', total_amount: '', total_installments: '2' })
            loadData()
        } catch (err) {
            toast.error('Erro ao adicionar parcela')
        }
    }

    const handleDeleteCard = async (id: string) => {
        if (!confirm('Excluir este cartão e todas as parcelas?')) return
        try {
            await supabase.from('card_installments').delete().eq('card_id', id)
            await supabase.from('credit_cards').delete().eq('id', id)
            toast.success('Cartão removido!')
            loadData()
        } catch (err) {
            toast.error('Erro ao remover cartão')
        }
    }

    const totalLimit = cards.reduce((s, c) => s + c.credit_limit, 0)
    const totalUsed = cards.reduce((s, c) => s + c.used_amount, 0)

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="loading-shimmer h-12 rounded-xl" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2].map(i => <div key={i} className="loading-shimmer h-48 rounded-xl" />)}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="card-premium p-4">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Limite Total</p>
                    <p className="text-xl font-bold text-white number-font">{formatCurrency(totalLimit)}</p>
                </div>
                <div className="card-premium p-4">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Utilizado</p>
                    <p className="text-xl font-bold text-accent-red number-font">{formatCurrency(totalUsed)}</p>
                </div>
                <div className="card-premium p-4">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Disponível</p>
                    <p className="text-xl font-bold text-accent-green number-font">{formatCurrency(totalLimit - totalUsed)}</p>
                </div>
            </div>

            {/* Cards */}
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Seus Cartões</h3>
                <button onClick={() => setShowAddCard(true)} className="btn-primary text-sm flex items-center gap-1.5">
                    <Plus className="w-4 h-4" /> Novo Cartão
                </button>
            </div>

            {cards.length === 0 ? (
                <div className="card-premium p-12 text-center">
                    <CreditCard className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">Nenhum cartão cadastrado</p>
                    <button onClick={() => setShowAddCard(true)} className="btn-primary text-sm mt-4">Adicionar Cartão</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cards.map((card, i) => {
                        const usedPercent = card.credit_limit > 0 ? (card.used_amount / card.credit_limit) * 100 : 0
                        const cardInstallments = installments.filter(inst => inst.card_id === card.id)

                        return (
                            <motion.div
                                key={card.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="card-premium overflow-hidden"
                            >
                                {/* Visual Card */}
                                <div className={`bg-gradient-to-br ${card.color} p-5 relative overflow-hidden`}>
                                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
                                    <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2" />

                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <p className="text-white/70 text-xs">{card.brand}</p>
                                                <p className="text-white font-bold text-sm">{card.name}</p>
                                            </div>
                                            <button onClick={() => handleDeleteCard(card.id)} className="text-white/40 hover:text-white/80 transition-colors">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <p className="text-white text-lg font-mono tracking-widest mb-4">•••• •••• •••• {card.last_four}</p>
                                        <div className="flex justify-between text-xs text-white/70">
                                            <span>Fecha dia {card.closing_day}</span>
                                            <span>Vence dia {card.due_day}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Usage */}
                                <div className="p-4">
                                    <div className="flex justify-between text-xs mb-1.5">
                                        <span className="text-gray-400">Utilizado</span>
                                        <span className={`font-bold number-font ${usedPercent > 80 ? 'text-accent-red' : 'text-white'}`}>
                                            {formatCurrency(card.used_amount)} / {formatCurrency(card.credit_limit)}
                                        </span>
                                    </div>
                                    <div className="h-2 bg-dark-bg rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${usedPercent > 80 ? 'bg-gradient-to-r from-accent-red to-red-400' : usedPercent > 50 ? 'bg-gradient-to-r from-accent-yellow to-yellow-400' : 'bg-gradient-to-r from-accent-green to-green-400'}`}
                                            style={{ width: `${Math.min(usedPercent, 100)}%` }}
                                        />
                                    </div>
                                    {usedPercent > 80 && (
                                        <div className="flex items-center gap-1 mt-2 text-[10px] text-accent-red">
                                            <AlertTriangle className="w-3 h-3" /> Limite quase atingido!
                                        </div>
                                    )}

                                    {/* Installments */}
                                    {cardInstallments.length > 0 && (
                                        <div className="mt-3 pt-3 border-t border-white/[0.04]">
                                            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-2">Parcelas</p>
                                            {cardInstallments.slice(0, 3).map(inst => (
                                                <div key={inst.id} className="flex justify-between items-center py-1.5 text-xs">
                                                    <span className="text-gray-300 truncate mr-2">{inst.description}</span>
                                                    <span className="text-gray-400 number-font shrink-0">
                                                        {inst.current_installment}/{inst.total_installments} • {formatCurrency(inst.installment_amount)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <button
                                        onClick={() => setShowAddInstallment(card.id)}
                                        className="w-full mt-3 py-2 text-xs text-primary hover:text-primary-lighter hover:bg-primary/5 rounded-lg transition-colors border border-primary/10"
                                    >
                                        + Adicionar Parcela
                                    </button>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            )}

            {/* Add Card Modal */}
            <AnimatePresence>
                {showAddCard && typeof window !== 'undefined' && createPortal(
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddCard(false)} />
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-md card-premium p-6 z-10">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-white">Novo Cartão</h3>
                                <button onClick={() => setShowAddCard(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
                            </div>

                            <div className="space-y-3">
                                <input type="text" placeholder="Nome do Cartão" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary" />
                                <input type="text" placeholder="Últimos 4 dígitos" maxLength={4} value={form.last_four} onChange={e => setForm({ ...form, last_four: e.target.value.replace(/\D/g, '') })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary" />
                                <select value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary">
                                    {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                                <input type="number" placeholder="Limite de Crédito" value={form.credit_limit} onChange={e => setForm({ ...form, credit_limit: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary" />
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] text-gray-500 uppercase">Dia Fechamento</label>
                                        <input type="number" min="1" max="31" value={form.closing_day} onChange={e => setForm({ ...form, closing_day: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-500 uppercase">Dia Vencimento</label>
                                        <input type="number" min="1" max="31" value={form.due_day} onChange={e => setForm({ ...form, due_day: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary" />
                                    </div>
                                </div>

                                {/* Color selector */}
                                <div>
                                    <label className="text-[10px] text-gray-500 uppercase mb-1 block">Cor do Cartão</label>
                                    <div className="flex gap-2 flex-wrap">
                                        {CARD_COLORS.map(c => (
                                            <button key={c} onClick={() => setForm({ ...form, color: c })} className={`w-8 h-8 rounded-lg bg-gradient-to-br ${c} ${form.color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-dark-bg' : ''} transition-all`} />
                                        ))}
                                    </div>
                                </div>

                                <button onClick={handleAddCard} className="btn-primary w-full mt-2">Salvar Cartão</button>
                            </div>
                        </motion.div>
                    </motion.div>,
                    document.body
                )}
            </AnimatePresence>

            {/* Add Installment Modal */}
            <AnimatePresence>
                {showAddInstallment && typeof window !== 'undefined' && createPortal(
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddInstallment(null)} />
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-md card-premium p-6 z-10">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-white">Nova Parcela</h3>
                                <button onClick={() => setShowAddInstallment(null)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
                            </div>

                            <div className="space-y-3">
                                <input type="text" placeholder="Descrição (ex: iPhone)" value={installForm.description} onChange={e => setInstallForm({ ...installForm, description: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary" />
                                <input type="number" placeholder="Valor Total" value={installForm.total_amount} onChange={e => setInstallForm({ ...installForm, total_amount: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary" />
                                <input type="number" placeholder="Nº de Parcelas" min="2" max="48" value={installForm.total_installments} onChange={e => setInstallForm({ ...installForm, total_installments: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary" />
                                {installForm.total_amount && installForm.total_installments && (
                                    <p className="text-xs text-gray-400">
                                        Parcela: <span className="text-white font-bold number-font">{formatCurrency(parseFloat(installForm.total_amount) / parseInt(installForm.total_installments))}</span>
                                    </p>
                                )}
                                <button onClick={() => handleAddInstallment(showAddInstallment)} className="btn-primary w-full mt-2">Salvar Parcela</button>
                            </div>
                        </motion.div>
                    </motion.div>,
                    document.body
                )}
            </AnimatePresence>
        </div>
    )
}
