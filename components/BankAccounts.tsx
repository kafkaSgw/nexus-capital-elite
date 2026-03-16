'use client'

import { useState, useEffect } from 'react'
import {
    Wallet, Plus, X, Edit, Trash2, Building2,
    CreditCard, PiggyBank, TrendingUp, Banknote, ChevronRight
} from 'lucide-react'
import { getAccounts, createAccount, updateAccount, deleteAccount, getTransactions, Account, Transaction } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import { createPortal } from 'react-dom'
import toast from 'react-hot-toast'

const ACCOUNT_TYPES = [
    { value: 'checking', label: 'Conta Corrente', icon: Building2 },
    { value: 'savings', label: 'Poupança', icon: PiggyBank },
    { value: 'investment', label: 'Investimento', icon: TrendingUp },
    { value: 'wallet', label: 'Carteira', icon: Wallet },
    { value: 'credit', label: 'Cartão Crédito', icon: CreditCard },
]

const COLORS = ['#2563EB', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#F97316']

export default function BankAccounts() {
    const [accounts, setAccounts] = useState<Account[]>([])
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingAccount, setEditingAccount] = useState<Account | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        type: 'checking' as Account['type'],
        bank: '',
        color: '#2563EB',
        initial_balance: ''
    })

    useEffect(() => { loadData() }, [])

    const loadData = async () => {
        try {
            const [acc, txs] = await Promise.all([getAccounts(), getTransactions()])
            setAccounts(acc)
            setTransactions(txs)
        } catch (err) {
            console.error('Erro ao carregar contas:', err)
        } finally {
            setLoading(false)
        }
    }

    const getAccountBalance = (account: Account) => {
        const accountTxs = transactions.filter(t => t.account_id === account.id)
        const txBalance = accountTxs.reduce((sum, t) => sum + t.amount, 0)
        return account.initial_balance + txBalance
    }

    const getTotalBalance = () => {
        return accounts.reduce((sum, acc) => sum + getAccountBalance(acc), 0)
    }

    const getTypeIcon = (type: string) => {
        const t = ACCOUNT_TYPES.find(at => at.value === type)
        return t ? t.icon : Wallet
    }

    const getTypeLabel = (type: string) => {
        const t = ACCOUNT_TYPES.find(at => at.value === type)
        return t ? t.label : type
    }

    const handleSubmit = async () => {
        if (!formData.name) {
            toast.error('Nome da conta é obrigatório')
            return
        }

        try {
            if (editingAccount) {
                await updateAccount(editingAccount.id, {
                    name: formData.name,
                    type: formData.type,
                    bank: formData.bank || null,
                    color: formData.color,
                    initial_balance: parseFloat(formData.initial_balance) || 0
                })
                toast.success('Conta atualizada!')
            } else {
                await createAccount({
                    name: formData.name,
                    type: formData.type,
                    bank: formData.bank || null,
                    color: formData.color,
                    initial_balance: parseFloat(formData.initial_balance) || 0
                })
                toast.success('Conta criada!')
            }
            resetForm()
            loadData()
        } catch (err) {
            toast.error('Erro ao salvar conta')
        }
    }

    const handleEdit = (account: Account) => {
        setEditingAccount(account)
        setFormData({
            name: account.name,
            type: account.type,
            bank: account.bank || '',
            color: account.color,
            initial_balance: account.initial_balance.toString()
        })
        setShowModal(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir esta conta?')) return
        try {
            await deleteAccount(id)
            toast.success('Conta excluída!')
            loadData()
        } catch (err) {
            toast.error('Erro ao excluir conta')
        }
    }

    const resetForm = () => {
        setFormData({ name: '', type: 'checking', bank: '', color: '#2563EB', initial_balance: '' })
        setEditingAccount(null)
        setShowModal(false)
    }

    const totalBalance = getTotalBalance()

    const modal = showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={resetForm} />
            <div className="relative bg-dark-card rounded-2xl max-w-md w-full p-6 border border-dark-border shadow-corporate-lg animate-slide-up">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">
                        {editingAccount ? 'Editar Conta' : 'Nova Conta'}
                    </h3>
                    <button onClick={resetForm} className="p-2 hover:bg-dark-hover rounded-lg transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="label-premium">Nome da Conta *</label>
                        <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="input-premium" placeholder="Ex: Nubank Pessoal" />
                    </div>

                    <div>
                        <label className="label-premium">Tipo</label>
                        <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as Account['type'] })} className="input-premium">
                            {ACCOUNT_TYPES.map(t => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="label-premium">Banco/Instituição</label>
                        <input type="text" value={formData.bank} onChange={e => setFormData({ ...formData, bank: e.target.value })} className="input-premium" placeholder="Ex: Nubank, Itaú" />
                    </div>

                    <div>
                        <label className="label-premium">Saldo Inicial (R$)</label>
                        <input type="number" step="0.01" value={formData.initial_balance} onChange={e => setFormData({ ...formData, initial_balance: e.target.value })} className="input-premium number-font" placeholder="0.00" />
                    </div>

                    <div>
                        <label className="label-premium">Cor</label>
                        <div className="flex gap-2 mt-1">
                            {COLORS.map(c => (
                                <button key={c} type="button" onClick={() => setFormData({ ...formData, color: c })}
                                    className={`w-8 h-8 rounded-full transition-all ${formData.color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-dark-card scale-110' : 'hover:scale-110'}`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button onClick={resetForm} className="btn-secondary flex-1">Cancelar</button>
                        <button onClick={handleSubmit} className="btn-primary flex-1">
                            {editingAccount ? 'Salvar' : 'Criar Conta'}
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
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-purple/20 to-primary/20 flex items-center justify-center border border-accent-purple/10">
                                <Wallet className="w-4 h-4 text-accent-purple" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-white">Contas & Carteiras</h3>
                                <p className="text-xs text-gray-500">{accounts.length} conta{accounts.length !== 1 ? 's' : ''}</p>
                            </div>
                        </div>
                        <button onClick={() => { resetForm(); setShowModal(true) }} className="p-2 hover:bg-white/[0.04] rounded-lg transition-colors text-primary">
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="p-5">
                    {/* Total */}
                    <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent-purple/10 border border-primary/10 mb-4">
                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Saldo Total</p>
                        <p className={`text-2xl font-bold number-font ${totalBalance >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                            {formatCurrency(totalBalance)}
                        </p>
                    </div>

                    {/* Account List */}
                    <div className="space-y-2">
                        {loading ? (
                            <div className="space-y-2">
                                {[1, 2, 3].map(i => <div key={i} className="loading-shimmer h-16 rounded-xl" />)}
                            </div>
                        ) : accounts.length === 0 ? (
                            <div className="text-center py-6">
                                <Wallet className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                                <p className="text-sm text-gray-400">Nenhuma conta cadastrada</p>
                                <button onClick={() => setShowModal(true)} className="text-sm text-primary hover:text-primary-light mt-2 transition-colors">
                                    Criar primeira conta
                                </button>
                            </div>
                        ) : (
                            accounts.map(account => {
                                const balance = getAccountBalance(account)
                                const Icon = getTypeIcon(account.type)
                                return (
                                    <div key={account.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${account.color}20` }}>
                                                <Icon className="w-4 h-4" style={{ color: account.color }} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-white">{account.name}</p>
                                                <p className="text-xs text-gray-500">
                                                    {account.bank ? `${account.bank} • ` : ''}{getTypeLabel(account.type)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-sm font-bold number-font ${balance >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                                                {formatCurrency(balance)}
                                            </span>
                                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleEdit(account)} className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors">
                                                    <Edit className="w-3.5 h-3.5 text-primary" />
                                                </button>
                                                <button onClick={() => handleDelete(account.id)} className="p-1.5 hover:bg-accent-red/10 rounded-lg transition-colors">
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
            </div>

            {typeof document !== 'undefined' && createPortal(modal, document.body)}
        </>
    )
}
