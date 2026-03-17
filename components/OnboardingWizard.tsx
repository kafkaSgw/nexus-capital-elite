'use client'

import { useState, useEffect } from 'react'
import {
    Sparkles, ArrowRight, ArrowLeft, X, Building2,
    Wallet, DollarSign, Check, PartyPopper, Rocket
} from 'lucide-react'
import { createCompany, createAccount, createTransaction } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { Portal } from '@/components/Portal'

const ONBOARDING_KEY = 'nexus-onboarding-done'

interface OnboardingWizardProps {
    onComplete: () => void
}

export default function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
    const [step, setStep] = useState(0)
    const [visible, setVisible] = useState(false)
    const [loading, setLoading] = useState(false)

    // Step 1 data
    const [companyData, setCompanyData] = useState({ name: '', cnpj: '', description: '' })
    // Step 2 data
    const [accountData, setAccountData] = useState({ name: '', type: 'checking' as any, bank: '', initial_balance: '' })
    // Step 3 data
    const [txData, setTxData] = useState({ description: '', amount: '', type: 'income' as 'income' | 'expense', category: 'Salário' })

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const done = localStorage.getItem(ONBOARDING_KEY)
            if (!done) {
                setVisible(true)
            }
        }
    }, [])

    if (!visible) return null

    const handleSkip = () => {
        localStorage.setItem(ONBOARDING_KEY, 'true')
        setVisible(false)
        onComplete()
    }

    const handleFinish = () => {
        localStorage.setItem(ONBOARDING_KEY, 'true')
        setVisible(false)
        toast.success('🎉 Configuração concluída! Bem-vindo ao Nexus Capital!')
        onComplete()
    }

    const handleCreateCompany = async () => {
        if (!companyData.name) {
            toast.error('Nome da empresa é obrigatório')
            return
        }
        setLoading(true)
        try {
            await createCompany({
                name: companyData.name,
                cnpj: companyData.cnpj || undefined,
                description: companyData.description || undefined,
                avatar_color: '#2563EB'
            })
            toast.success('Empresa criada!')
            setStep(2)
        } catch (err) {
            toast.error('Erro ao criar empresa')
        } finally {
            setLoading(false)
        }
    }

    const handleCreateAccount = async () => {
        if (!accountData.name) {
            toast.error('Nome da conta é obrigatório')
            return
        }
        setLoading(true)
        try {
            await createAccount({
                name: accountData.name,
                type: accountData.type,
                bank: accountData.bank || null,
                color: '#8B5CF6',
                initial_balance: parseFloat(accountData.initial_balance) || 0
            })
            toast.success('Conta criada!')
            setStep(3)
        } catch (err) {
            toast.error('Erro ao criar conta')
        } finally {
            setLoading(false)
        }
    }

    const handleCreateTransaction = async () => {
        if (!txData.description || !txData.amount) {
            toast.error('Preencha descrição e valor')
            return
        }
        setLoading(true)
        try {
            const amount = parseFloat(txData.amount)
            await createTransaction({
                description: txData.description,
                amount: txData.type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
                type: txData.type,
                category: txData.category,
                company_id: null,
                account_id: null
            })
            toast.success('Transação registrada!')
            setStep(4)
        } catch (err) {
            toast.error('Erro ao registrar transação')
        } finally {
            setLoading(false)
        }
    }

    const steps = [
        {
            title: 'Bem-vindo ao Nexus Capital! 🚀',
            subtitle: 'Vamos configurar seu sistema financeiro em poucos passos.',
            icon: Rocket,
            color: 'from-primary to-accent-indigo',
            content: (
                <div className="text-center space-y-6 py-4">
                    <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-accent-purple/20 flex items-center justify-center border border-primary/10">
                        <Sparkles className="w-10 h-10 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">Sua central financeira premium</h3>
                        <p className="text-gray-400 text-sm max-w-sm mx-auto">
                            Gerencie empresas, contas bancárias, investimentos e muito mais — tudo em um só lugar.
                        </p>
                    </div>
                    <div className="grid grid-cols-3 gap-3 pt-2">
                        {[
                            { icon: Building2, label: 'Empresas', color: 'text-primary' },
                            { icon: Wallet, label: 'Contas', color: 'text-accent-purple' },
                            { icon: DollarSign, label: 'Finanças', color: 'text-accent-green' },
                        ].map(({ icon: Icon, label, color }) => (
                            <div key={label} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                                <Icon className={`w-6 h-6 ${color} mx-auto mb-1`} />
                                <p className="text-xs text-gray-400">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )
        },
        {
            title: 'Crie sua primeira empresa',
            subtitle: 'Organize suas finanças por empresa ou projeto.',
            icon: Building2,
            color: 'from-primary to-accent-indigo',
            content: (
                <div className="space-y-4 py-2">
                    <div>
                        <label className="label-premium">Nome da Empresa *</label>
                        <input type="text" value={companyData.name} onChange={e => setCompanyData({ ...companyData, name: e.target.value })}
                            className="input-premium" placeholder="Ex: Minha Empresa" />
                    </div>
                    <div>
                        <label className="label-premium">CNPJ (opcional)</label>
                        <input type="text" value={companyData.cnpj} onChange={e => setCompanyData({ ...companyData, cnpj: e.target.value })}
                            className="input-premium" placeholder="00.000.000/0001-00" />
                    </div>
                    <div>
                        <label className="label-premium">Descrição (opcional)</label>
                        <input type="text" value={companyData.description} onChange={e => setCompanyData({ ...companyData, description: e.target.value })}
                            className="input-premium" placeholder="Breve descrição" />
                    </div>
                </div>
            )
        },
        {
            title: 'Cadastre sua conta bancária',
            subtitle: 'Acompanhe o saldo das suas contas.',
            icon: Wallet,
            color: 'from-accent-purple to-primary',
            content: (
                <div className="space-y-4 py-2">
                    <div>
                        <label className="label-premium">Nome da Conta *</label>
                        <input type="text" value={accountData.name} onChange={e => setAccountData({ ...accountData, name: e.target.value })}
                            className="input-premium" placeholder="Ex: Nubank Pessoal" />
                    </div>
                    <div>
                        <label className="label-premium">Tipo</label>
                        <select value={accountData.type} onChange={e => setAccountData({ ...accountData, type: e.target.value })} className="input-premium">
                            <option value="checking">Conta Corrente</option>
                            <option value="savings">Poupança</option>
                            <option value="investment">Investimento</option>
                            <option value="wallet">Carteira</option>
                            <option value="credit">Cartão de Crédito</option>
                        </select>
                    </div>
                    <div>
                        <label className="label-premium">Banco</label>
                        <input type="text" value={accountData.bank} onChange={e => setAccountData({ ...accountData, bank: e.target.value })}
                            className="input-premium" placeholder="Ex: Nubank" />
                    </div>
                    <div>
                        <label className="label-premium">Saldo Atual (R$)</label>
                        <input type="number" step="0.01" value={accountData.initial_balance}
                            onChange={e => setAccountData({ ...accountData, initial_balance: e.target.value })}
                            className="input-premium number-font" placeholder="0.00" />
                    </div>
                </div>
            )
        },
        {
            title: 'Registre sua primeira transação',
            subtitle: 'Comece a acompanhar suas finanças.',
            icon: DollarSign,
            color: 'from-accent-green to-primary',
            content: (
                <div className="space-y-4 py-2">
                    <div className="grid grid-cols-2 gap-3">
                        <button type="button" onClick={() => setTxData({ ...txData, type: 'income' })}
                            className={`px-4 py-3 rounded-xl font-medium transition-all ${txData.type === 'income' ? 'bg-accent-green/20 border-2 border-accent-green text-accent-green' : 'bg-dark-card border border-dark-border text-gray-400'}`}>
                            Receita
                        </button>
                        <button type="button" onClick={() => setTxData({ ...txData, type: 'expense' })}
                            className={`px-4 py-3 rounded-xl font-medium transition-all ${txData.type === 'expense' ? 'bg-accent-red/20 border-2 border-accent-red text-accent-red' : 'bg-dark-card border border-dark-border text-gray-400'}`}>
                            Despesa
                        </button>
                    </div>
                    <div>
                        <label className="label-premium">Descrição *</label>
                        <input type="text" value={txData.description} onChange={e => setTxData({ ...txData, description: e.target.value })}
                            className="input-premium" placeholder="Ex: Salário" />
                    </div>
                    <div>
                        <label className="label-premium">Valor (R$) *</label>
                        <input type="number" step="0.01" value={txData.amount} onChange={e => setTxData({ ...txData, amount: e.target.value })}
                            className="input-premium number-font" placeholder="0.00" />
                    </div>
                    <div>
                        <label className="label-premium">Categoria</label>
                        <select value={txData.category} onChange={e => setTxData({ ...txData, category: e.target.value })} className="input-premium">
                            {['Salário', 'Freelance', 'Interpira', 'TikTok', 'Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Outros'].map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )
        },
        {
            title: 'Tudo pronto! 🎉',
            subtitle: 'Seu Nexus Capital está configurado.',
            icon: Check,
            color: 'from-accent-green to-accent-cyan',
            content: (
                <div className="text-center space-y-6 py-6">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-accent-green/20 to-accent-cyan/20 flex items-center justify-center border border-accent-green/10 animate-pulse">
                        <PartyPopper className="w-10 h-10 text-accent-green" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">Parabéns!</h3>
                        <p className="text-gray-400 text-sm max-w-sm mx-auto">
                            Explore o Dashboard, registre transações, acompanhe seus investimentos e atinja suas metas financeiras.
                        </p>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                        <Sparkles className="w-4 h-4 text-accent-yellow" />
                        Dica: Use <kbd className="px-1.5 py-0.5 bg-white/[0.05] rounded text-[10px] font-mono mx-1">⌘N</kbd> para criar transações rapidamente
                    </div>
                </div>
            )
        }
    ]

    const currentStep = steps[step]
    const Icon = currentStep.icon

    const handleNext = () => {
        if (step === 1) handleCreateCompany()
        else if (step === 2) handleCreateAccount()
        else if (step === 3) handleCreateTransaction()
        else if (step === 4) handleFinish()
        else setStep(step + 1)
    }

    return (
        <Portal>
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
                <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
                <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative bg-dark-card rounded-2xl max-w-lg w-full border border-dark-border shadow-corporate-lg overflow-hidden"
            >
                {/* Progress */}
                <div className="h-1 bg-dark-bg">
                    <div className={`h-full bg-gradient-to-r ${currentStep.color} transition-all duration-500`}
                        style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
                </div>

                {/* Header */}
                <div className="p-6 pb-0">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>Passo {step + 1} de {steps.length}</span>
                        </div>
                        <button onClick={handleSkip} className="text-xs text-gray-500 hover:text-white transition-colors flex items-center gap-1">
                            <X className="w-3.5 h-3.5" /> Pular
                        </button>
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${currentStep.color} flex items-center justify-center bg-opacity-20`}>
                            <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">{currentStep.title}</h2>
                            <p className="text-sm text-gray-400">{currentStep.subtitle}</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="px-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {currentStep.content}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Navigation */}
                <div className="p-6 pt-4 flex items-center justify-between">
                    <div>
                        {step > 0 && step < 4 && (
                            <button onClick={() => setStep(step - 1)} className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors">
                                <ArrowLeft className="w-4 h-4" /> Voltar
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        {step > 0 && step < 4 && (
                            <button onClick={() => setStep(step + 1)} className="text-sm text-gray-500 hover:text-white transition-colors">
                                Pular etapa
                            </button>
                        )}
                        <button onClick={handleNext} disabled={loading}
                            className="btn-primary flex items-center gap-2 px-6">
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : step === 4 ? 'Começar a usar' : (
                                <>Continuar <ArrowRight className="w-4 h-4" /></>
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
        </Portal>
    )
}
