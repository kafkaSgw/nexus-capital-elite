'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Users, Plus, Trash2, Edit, X, DollarSign, PieChart as PieChartIcon, Percent, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { getPartners, createPartner, updatePartner, deletePartner, Partner } from '@/lib/supabase'
import toast from 'react-hot-toast'

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316']

export default function PartnersControl() {
    const [partners, setPartners] = useState<Partner[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingPartner, setEditingPartner] = useState<Partner | null>(null)
    const [isDistOpen, setIsDistOpen] = useState(false)
    const [distAmount, setDistAmount] = useState('')

    const [formData, setFormData] = useState({ name: '', share: '', proLabore: '' })

    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        loadPartners()
    }, [])

    const loadPartners = async () => {
        setIsLoading(true)
        try {
            const data = await getPartners()
            setPartners(data)
        } catch (error) {
            toast.error('Erro ao carregar sócios')
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const save = async (action: 'create' | 'update' | 'delete', data?: any) => {
        try {
            if (action === 'create' && data) {
                await createPartner(data)
                toast.success('Sócio adicionado')
            } else if (action === 'update' && data) {
                await updatePartner(data.id, data.updates)
                toast.success('Sócio atualizado')
            } else if (action === 'delete' && data) {
                await deletePartner(data.id)
                toast.success('Sócio removido')
            }
            await loadPartners()
        } catch (error: any) {
            toast.error(error.message || 'Erro ao processar operação')
        }
    }

    const resetModal = () => {
        setIsModalOpen(false)
        setEditingPartner(null)
        setFormData({ name: '', share: '', proLabore: '' })
    }

    const handleSubmit = async () => {
        if (!formData.name.trim() || !formData.share) return

        const shareVal = parseFloat(formData.share)
        const proLaboreVal = parseFloat(formData.proLabore) || 0

        const currentTotalShare = partners.reduce((s, p) => s + p.share, 0)
        const shareDiff = editingPartner ? shareVal - editingPartner.share : shareVal
        if (currentTotalShare + shareDiff > 100) {
            toast.error('O total de participação não pode exceder 100%')
            return
        }

        if (editingPartner) {
            await save('update', { id: editingPartner.id, updates: { name: formData.name, share: shareVal, pro_labore: proLaboreVal } })
        } else {
            await save('create', { name: formData.name, share: shareVal, pro_labore: proLaboreVal, withdrawals: 0 })
        }
        resetModal()
    }

    const handleDelete = async (id: string) => {
        if (window.confirm('Tem certeza que deseja remover este sócio? Todas as quotas serão perdidas.')) {
            await save('delete', { id })
        }
    }

    const handleEdit = (partner: Partner) => {
        setEditingPartner(partner)
        setFormData({ name: partner.name, share: partner.share.toString(), proLabore: partner.pro_labore.toString() })
        setIsModalOpen(true)
    }

    const handleDistribute = async () => {
        if (!distAmount || parseFloat(distAmount) <= 0) return

        try {
            const total = parseFloat(distAmount)
            // Atualiza cada sócio individualmente (idealmente seria numa transaction RPC, mas por enquanto fazemos sequencial ou Promise.all)
            await Promise.all(partners.map(p =>
                updatePartner(p.id, { withdrawals: p.withdrawals + (total * p.share / 100) })
            ))
            toast.success('Lucros distribuídos com sucesso!')
            await loadPartners()
            setIsDistOpen(false)
            setDistAmount('')
        } catch (error) {
            toast.error('Erro ao distribuir lucros')
        }
    }

    const totalShare = partners.reduce((s, p) => s + p.share, 0)
    const totalProLabore = partners.reduce((s, p) => s + (p.pro_labore || 0), 0)
    const totalWithdrawals = partners.reduce((s, p) => s + (p.withdrawals || 0), 0)

    // SVG Pie Chart
    const renderPie = () => {
        if (partners.length === 0) return null
        let cumAngle = 0
        const size = 120
        const cx = size / 2
        const cy = size / 2
        const r = 45

        return (
            <svg viewBox={`0 0 ${size} ${size}`} className="w-32 h-32 drop-shadow-2xl">
                {partners.map((p, i) => {
                    const angle = (p.share / 100) * 360
                    const startAngle = cumAngle
                    cumAngle += angle
                    const endAngle = cumAngle

                    const startRad = (startAngle - 90) * Math.PI / 180
                    const endRad = (endAngle - 90) * Math.PI / 180

                    const x1 = cx + r * Math.cos(startRad)
                    const y1 = cy + r * Math.sin(startRad)
                    const x2 = cx + r * Math.cos(endRad)
                    const y2 = cy + r * Math.sin(endRad)

                    const largeArc = angle > 180 ? 1 : 0
                    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`

                    return <path key={p.id} d={d} fill={COLORS[i % COLORS.length]} opacity={0.85} stroke="#0f1115" strokeWidth="2" />
                })}
                {/* Center circle */}
                <circle cx={cx} cy={cy} r={28} fill="#0f1115" />
                <text x={cx} y={cy - 4} textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">
                    {totalShare.toFixed(0)}%
                </text>
                <text x={cx} y={cy + 12} textAnchor="middle" fill="#9ca3af" fontSize="8" letterSpacing="0.5">
                    ALOCADO
                </text>
            </svg>
        )
    }

    const modals = (
        <>
            {/* Modal Novo/Editar Sócio */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={resetModal} />
                    <div className="relative bg-[#0f1115] rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 border border-white/10 shadow-corporate-lg animate-slide-up">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-white tracking-wide">
                                {editingPartner ? 'Editar Sócio' : 'Novo Sócio'}
                            </h3>
                            <button onClick={resetModal} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Nome</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-[#161922] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-primary focus:outline-none"
                                    placeholder="Nome do sócio"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Participação (%)</label>
                                <input
                                    type="number"
                                    value={formData.share}
                                    onChange={e => setFormData({ ...formData, share: e.target.value })}
                                    className="w-full bg-[#161922] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-primary focus:outline-none"
                                    placeholder="25"
                                    min="0"
                                    max="100"
                                    step="0.5"
                                />
                                {totalShare - (editingPartner?.share || 0) + (parseFloat(formData.share) || 0) > 100 && (
                                    <p className="text-xs text-red-400 mt-1">Total excede 100%</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Pró-labore (R$/mês)</label>
                                <input
                                    type="number"
                                    value={formData.proLabore}
                                    onChange={e => setFormData({ ...formData, proLabore: e.target.value })}
                                    className="w-full bg-[#161922] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-primary focus:outline-none"
                                    placeholder="5000"
                                    min="0"
                                    step="500"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={!formData.name.trim() || !formData.share}
                            className="w-full mt-6 py-3 bg-gradient-to-r from-primary to-indigo-500 hover:from-primary hover:to-indigo-600 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                        >
                            {editingPartner ? 'Salvar Alterações' : 'Adicionar Sócio'}
                        </button>
                    </div>
                </div>
            )}

            {/* Modal Distribuir Lucros */}
            {isDistOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => { setIsDistOpen(false); setDistAmount('') }} />
                    <div className="relative bg-[#0f1115] rounded-2xl max-w-sm w-full p-6 border border-white/10 shadow-corporate-lg animate-slide-up">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-white">Distribuir Lucros</h3>
                            <button onClick={() => { setIsDistOpen(false); setDistAmount('') }} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <input
                            type="number"
                            value={distAmount}
                            onChange={e => setDistAmount(e.target.value)}
                            className="w-full bg-[#161922] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none mb-4"
                            placeholder="Valor total a distribuir"
                            min="0"
                            step="1000"
                            autoFocus
                        />

                        {distAmount && parseFloat(distAmount) > 0 && (
                            <div className="mb-4 space-y-2">
                                <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">Distribuição Proporcional</p>
                                {partners.map((p, i) => (
                                    <div key={p.id} className="flex items-center justify-between bg-white/[0.02] border border-white/[0.05] rounded-lg px-3 py-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                            <span className="text-sm text-white">{p.name}</span>
                                            <span className="text-xs text-gray-500">{p.share}%</span>
                                        </div>
                                        <span className="text-sm font-bold number-font text-emerald-400">
                                            {formatCurrency(parseFloat(distAmount) * p.share / 100)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <button
                            onClick={handleDistribute}
                            disabled={!distAmount || parseFloat(distAmount) <= 0 || partners.length === 0}
                            className="w-full py-3 bg-emerald-500/20 border border-emerald-500/30 hover:bg-emerald-500/30 text-emerald-400 font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Confirmar Distribuição
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
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500/20 to-primary/20 border border-primary/20 rounded-xl flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-bold tracking-wide text-white">Controle de Sócios</h3>
                            <p className="text-xs text-gray-400">Participação e distribuição</p>
                        </div>
                    </div>
                    <div className="flex gap-2.5">
                        {partners.length > 0 && (
                            <button
                                onClick={() => setIsDistOpen(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg text-emerald-400 text-xs font-medium transition-colors"
                            >
                                <DollarSign className="w-3.5 h-3.5" />
                                Distribuir
                            </button>
                        )}
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-lg text-primary text-xs font-medium transition-colors"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Sócio
                        </button>
                    </div>
                </div>

                <div className="relative z-10 p-5 flex-1 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full text-zinc-500 py-10">
                            <Loader2 className="w-8 h-8 animate-spin mb-3 text-primary/50" />
                            <p className="text-sm">Carregando sócios do Nexus...</p>
                        </div>
                    ) : partners.length === 0 ? (
                        <div className="text-center py-10">
                            <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-400 text-sm">Nenhum sócio cadastrado</p>
                            <p className="text-gray-500 text-xs mt-1">Adicione sócios para gerenciar participação</p>
                        </div>
                    ) : (
                        <>
                            {/* Pie Chart + Summary */}
                            <div className="flex items-center gap-5 mb-5">
                                <div className="flex-shrink-0">
                                    {renderPie()}
                                </div>
                                <div className="grid grid-cols-1 gap-2.5 flex-1">
                                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3 flex justify-between items-center shadow-inner">
                                        <p className="text-[10px] uppercase text-gray-500 tracking-wider">Pró-labore Total</p>
                                        <p className="text-sm font-bold number-font text-white">{formatCurrency(totalProLabore)}<span className="text-[10px] text-gray-500 ml-1 font-normal">/mês</span></p>
                                    </div>
                                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3 flex justify-between items-center shadow-inner">
                                        <p className="text-[10px] uppercase text-gray-500 tracking-wider">Total Distribuído</p>
                                        <p className="text-sm font-bold number-font text-emerald-400">{formatCurrency(totalWithdrawals)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Partners List */}
                            <div className="space-y-3">
                                {partners.map((partner, i) => (
                                    <div key={partner.id} className="bg-white/[0.02] border border-white/[0.05] hover:border-primary/20 transition-colors rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-inner"
                                                    style={{ backgroundColor: COLORS[i % COLORS.length] + '30', color: COLORS[i % COLORS.length] }}
                                                >
                                                    {partner.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-white text-sm">{partner.name}</h4>
                                                    <p className="text-[11px] text-gray-500">Pró-labore: {formatCurrency(partner.pro_labore)}/mês</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => handleEdit(partner)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors border border-transparent hover:border-white/10">
                                                    <Edit className="w-3.5 h-3.5 text-gray-400 hover:text-white" />
                                                </button>
                                                <button onClick={() => handleDelete(partner.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors">
                                                    <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-400" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Share bar */}
                                        <div className="h-1.5 bg-black/40 rounded-full overflow-hidden mb-2 shadow-inner">
                                            <div
                                                className="h-full rounded-full transition-all duration-500"
                                                style={{ width: `${partner.share}%`, backgroundColor: COLORS[i % COLORS.length] }}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between text-[11px]">
                                            <span className="text-gray-500">Participação Societária</span>
                                            <div className="flex items-center gap-3">
                                                <span className="font-bold number-font" style={{ color: COLORS[i % COLORS.length] }}>{partner.share}%</span>
                                                {partner.withdrawals > 0 && (
                                                    <span className="text-gray-500 flex items-center gap-1">
                                                        Retirado: <span className="text-emerald-400 font-bold">{formatCurrency(partner.withdrawals)}</span>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {typeof document !== 'undefined' && createPortal(modals, document.body)}
        </>
    )
}
