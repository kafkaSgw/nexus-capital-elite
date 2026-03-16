'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Vote, CheckCircle2, XCircle, AlertCircle, Plus, Trash2, X, Loader2 } from 'lucide-react'
import { createPortal } from 'react-dom'
import { getPartners, getProposals, createProposal, updateProposal, deleteProposal, Partner, Proposal } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function VotingSystem() {
    const [partners, setPartners] = useState<Partner[]>([])
    const [proposals, setProposals] = useState<Proposal[]>([])
    const [loading, setLoading] = useState(true)

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [formData, setFormData] = useState({ title: '', description: '' })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        try {
            const [fetchedPartners, fetchedProposals] = await Promise.all([
                getPartners(),
                getProposals()
            ])
            setPartners(fetchedPartners)
            setProposals(fetchedProposals)
        } catch (error) {
            toast.error('Erro ao carregar dados do conselho')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const totalCompanyShares = partners.reduce((sum, p) => sum + p.share, 0) || 100

    const handleAddProposal = async () => {
        if (!formData.title.trim()) return

        try {
            await createProposal({
                title: formData.title,
                description: formData.description,
                status: 'active',
                votes_for: 0,
                votes_against: 0
            })
            toast.success('Proposta submetida')
            setFormData({ title: '', description: '' })
            setIsModalOpen(false)
            await loadData()
        } catch (error) {
            toast.error('Erro ao submeter proposta')
        }
    }

    const handleDelete = async (id: string) => {
        if (window.confirm('Excluir esta proposta?')) {
            try {
                await deleteProposal(id)
                toast.success('Proposta removida')
                await loadData()
            } catch (error) {
                toast.error('Erro ao remover proposta')
            }
        }
    }

    const handleVote = async (id: string, type: 'for' | 'against') => {
        try {
            const proposal = proposals.find(p => p.id === id)
            if (!proposal) return

            const voteWeight = Math.max(10, totalCompanyShares * 0.15) // placeholder weight

            let newFor = proposal.votes_for
            let newAgainst = proposal.votes_against

            if (type === 'for') newFor = Math.min(newFor + voteWeight, totalCompanyShares - newAgainst)
            if (type === 'against') newAgainst = Math.min(newAgainst + voteWeight, totalCompanyShares - newFor)

            await updateProposal(id, { votes_for: newFor, votes_against: newAgainst })
            toast.success('Voto computado')
            await loadData()
        } catch (error) {
            toast.error('Erro ao computar voto')
        }
    }

    if (loading) {
        return (
            <div className="card-premium p-6 flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500/50" />
            </div>
        )
    }

    const modal = isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <div className="relative bg-dark-card rounded-2xl max-w-md w-full p-6 border border-dark-border shadow-corporate-lg animate-slide-up">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white">Nova Proposta</h3>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-dark-hover rounded-lg transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Título da Proposta</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-primary focus:outline-none"
                            placeholder="Ex: Aquisição de Startup"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Descrição</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-primary focus:outline-none resize-none h-24"
                            placeholder="Detalhes sobre a proposta e impacto financeiro..."
                        />
                    </div>
                </div>

                <button
                    onClick={handleAddProposal}
                    disabled={!formData.title.trim()}
                    className="w-full mt-6 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Submeter ao Conselho
                </button>
            </div>
        </div>
    )

    return (
        <>
            <div className="card-premium flex flex-col h-full relative overflow-hidden">
                <div className="relative z-10 p-5 border-b border-dark-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500/20 to-blue-500/20 border border-indigo-500/20 rounded-xl flex items-center justify-center">
                            <Vote className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white tracking-wide">Conselho e Votações</h3>
                            <p className="text-xs text-gray-400">Decisões societárias</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-1.5 text-xs bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 px-3 py-1.5 rounded-lg transition-colors font-medium"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Nova Proposta
                    </button>
                </div>

                <div className="relative z-10 p-5 space-y-4 flex-1 overflow-y-auto">
                    {proposals.length === 0 ? (
                        <div className="text-center py-10">
                            <Vote className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-400 text-sm">Nenhuma proposta ativa</p>
                        </div>
                    ) : (
                        proposals.map(proposal => {
                            const progressFor = (proposal.votes_for / totalCompanyShares) * 100
                            const progressAgainst = (proposal.votes_against / totalCompanyShares) * 100

                            return (
                                <motion.div
                                    key={proposal.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white/[0.02] border border-white/[0.05] hover:border-indigo-500/20 transition-colors rounded-xl p-4 group relative"
                                >
                                    <button
                                        onClick={() => handleDelete(proposal.id)}
                                        className="absolute top-3 right-3 p-1.5 opacity-0 group-hover:opacity-100 hover:bg-accent-red/10 rounded-lg transition-all"
                                    >
                                        <Trash2 className="w-4 h-4 text-gray-500 hover:text-accent-red" />
                                    </button>

                                    <div className="mb-4 pr-8">
                                        <h4 className="text-sm font-bold text-white mb-1.5">{proposal.title}</h4>
                                        <p className="text-xs text-gray-400 leading-relaxed">{proposal.description}</p>
                                    </div>

                                    <div className="space-y-3">
                                        {/* Barra de progresso visual simulando cotas reais */}
                                        <div className="relative w-full h-2.5 rounded-full bg-dark-bg overflow-hidden flex shadow-inner">
                                            <div
                                                className="h-full bg-emerald-500/80 transition-all duration-500"
                                                style={{ width: `${progressFor}%` }}
                                            />
                                            <div
                                                className="h-full bg-red-500/80 transition-all duration-500 ml-auto"
                                                style={{ width: `${progressAgainst}%` }}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-1.5 text-emerald-400">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                <span className="font-bold">{progressFor.toFixed(0)}% a Favor</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-red-400">
                                                <XCircle className="w-3.5 h-3.5" />
                                                <span className="font-bold">{progressAgainst.toFixed(0)}% Contra</span>
                                            </div>
                                        </div>

                                        {/* Ações de Voto */}
                                        <div className="pt-3 border-t border-white/[0.05] grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => handleVote(proposal.id, 'for')}
                                                className="py-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-emerald-400/80 text-xs font-medium hover:bg-emerald-500/10 transition-colors"
                                            >
                                                Votar a Favor
                                            </button>
                                            <button
                                                onClick={() => handleVote(proposal.id, 'against')}
                                                className="py-1.5 rounded-lg border border-red-500/20 bg-red-500/5 text-red-400/80 text-xs font-medium hover:bg-red-500/10 transition-colors"
                                            >
                                                Votar Contra
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })
                    )}

                    <div className="mt-4 p-3.5 bg-indigo-500/5 border border-indigo-500/10 rounded-xl flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-indigo-400/70 shrink-0" />
                        <p className="text-xs text-indigo-200/60 leading-relaxed">
                            O peso do seu voto é proporcional ao seu número de cotas ({totalCompanyShares} cotas ativas totais). O quórum mínimo para aprovação é de 50% + 1.
                        </p>
                    </div>
                </div>
            </div>

            {typeof document !== 'undefined' && createPortal(modal, document.body)}
        </>
    )
}
