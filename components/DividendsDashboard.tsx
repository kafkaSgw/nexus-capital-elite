'use client'

import { useState, useEffect } from 'react'
import {
    Banknote, Plus, X, Trash2, TrendingUp,
    Calendar, DollarSign, PieChart
} from 'lucide-react'
import { getDividends, createDividend, deleteDividend, getAssets, Dividend, Asset } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import { createPortal } from 'react-dom'
import toast from 'react-hot-toast'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import DividendAIProjection from './DividendAIProjection'

export default function DividendsDashboard() {
    const [dividends, setDividends] = useState<Dividend[]>([])
    const [assets, setAssets] = useState<Asset[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [formData, setFormData] = useState({
        asset_id: '',
        amount: '',
        type: 'dividend' as Dividend['type'],
        payment_date: new Date().toISOString().split('T')[0]
    })

    useEffect(() => { loadData() }, [])

    const loadData = async () => {
        try {
            const [divs, ast] = await Promise.all([getDividends(), getAssets()])
            setDividends(divs)
            setAssets(ast)
        } catch (err) {
            console.error('Erro ao carregar dividendos:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async () => {
        if (!formData.asset_id || !formData.amount || !formData.payment_date) {
            toast.error('Preencha todos os campos')
            return
        }
        try {
            await createDividend({
                asset_id: formData.asset_id,
                amount: parseFloat(formData.amount),
                type: formData.type,
                payment_date: formData.payment_date
            })
            toast.success('Dividendo registrado!')
            resetForm()
            loadData()
        } catch (err) {
            toast.error('Erro ao registrar dividendo')
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Excluir este dividendo?')) return
        try {
            await deleteDividend(id)
            toast.success('Dividendo excluído!')
            loadData()
        } catch (err) {
            toast.error('Erro ao excluir')
        }
    }

    const resetForm = () => {
        setFormData({ asset_id: assets[0]?.id || '', amount: '', type: 'dividend', payment_date: new Date().toISOString().split('T')[0] })
        setShowModal(false)
    }

    // Calculations
    const totalDividends = dividends.reduce((s, d) => s + d.amount, 0)

    const thisYear = new Date().getFullYear().toString()
    const yearDividends = dividends
        .filter(d => d.payment_date.startsWith(thisYear))
        .reduce((s, d) => s + d.amount, 0)

    const thisMonth = new Date().toISOString().substring(0, 7)
    const monthDividends = dividends
        .filter(d => d.payment_date.startsWith(thisMonth))
        .reduce((s, d) => s + d.amount, 0)

    // Per-asset breakdown
    const assetDividends = assets.map(asset => {
        const total = dividends.filter(d => d.asset_id === asset.id).reduce((s, d) => s + d.amount, 0)
        const invested = asset.preco_medio * asset.quantidade
        const yieldOnCost = invested > 0 ? (total / invested) * 100 : 0
        return { asset, total, invested, yieldOnCost }
    }).filter(a => a.total > 0).sort((a, b) => b.total - a.total)

    // Monthly chart data (last 12 months)
    const getMonthlyChart = () => {
        const data = []
        for (let i = 11; i >= 0; i--) {
            const d = new Date()
            d.setMonth(d.getMonth() - i)
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
            const label = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')
            const total = dividends.filter(div => div.payment_date.startsWith(key)).reduce((s, div) => s + div.amount, 0)
            data.push({ month: label, total })
        }
        return data
    }

    const chartData = getMonthlyChart()

    // Annual projection
    const monthsWithData = new Set(dividends.filter(d => d.payment_date.startsWith(thisYear)).map(d => d.payment_date.substring(0, 7))).size
    const annualProjection = monthsWithData > 0 ? (yearDividends / monthsWithData) * 12 : 0

    const getTypeLabel = (type: string) => {
        const m: Record<string, string> = { dividend: 'Dividendo', jcp: 'JCP', rental: 'Aluguel' }
        return m[type] || type
    }

    const getTickerForAsset = (assetId: string) => {
        const asset = assets.find(a => a.id === assetId)
        return asset?.ticker || 'N/A'
    }

    const modal = showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={resetForm} />
            <div className="relative bg-dark-card rounded-2xl max-w-md w-full p-6 border border-dark-border shadow-corporate-lg animate-slide-up">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">Registrar Dividendo</h3>
                    <button onClick={resetForm} className="p-2 hover:bg-dark-hover rounded-lg transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="label-premium">Ativo *</label>
                        <select value={formData.asset_id} onChange={e => setFormData({ ...formData, asset_id: e.target.value })} className="input-premium">
                            <option value="">Selecione o ativo</option>
                            {assets.map(a => (<option key={a.id} value={a.id}>{a.ticker} ({a.classe})</option>))}
                        </select>
                    </div>
                    <div>
                        <label className="label-premium">Valor (R$) *</label>
                        <input type="number" step="0.01" min="0" value={formData.amount}
                            onChange={e => setFormData({ ...formData, amount: e.target.value })}
                            className="input-premium number-font" placeholder="0.00" />
                    </div>
                    <div>
                        <label className="label-premium">Tipo</label>
                        <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as Dividend['type'] })} className="input-premium">
                            <option value="dividend">Dividendo</option>
                            <option value="jcp">JCP (Juros sobre Capital)</option>
                            <option value="rental">Aluguel (FII)</option>
                        </select>
                    </div>
                    <div>
                        <label className="label-premium">Data do Pagamento *</label>
                        <input type="date" value={formData.payment_date} onChange={e => setFormData({ ...formData, payment_date: e.target.value })} className="input-premium" />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button onClick={resetForm} className="btn-secondary flex-1">Cancelar</button>
                        <button onClick={handleSubmit} className="btn-primary flex-1">Registrar</button>
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
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-green/20 to-accent-cyan/20 flex items-center justify-center border border-accent-green/10">
                                <Banknote className="w-4 h-4 text-accent-green" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-white">Dividendos</h3>
                                <p className="text-xs text-gray-500">Renda passiva dos seus ativos</p>
                            </div>
                        </div>
                        <button onClick={() => { setFormData({ asset_id: assets[0]?.id || '', amount: '', type: 'dividend', payment_date: new Date().toISOString().split('T')[0] }); setShowModal(true) }}
                            className="p-2 hover:bg-white/[0.04] rounded-lg transition-colors text-primary">
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="p-5">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-3 gap-3 mb-5">
                        <div className="p-3 rounded-xl bg-white/[0.02] text-center">
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Total</p>
                            <p className="text-sm font-bold text-accent-green number-font mt-1">{formatCurrency(totalDividends)}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-white/[0.02] text-center">
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider">{thisYear}</p>
                            <p className="text-sm font-bold text-white number-font mt-1">{formatCurrency(yearDividends)}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-white/[0.02] text-center">
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Projeção Anual</p>
                            <p className="text-sm font-bold text-accent-purple number-font mt-1">{formatCurrency(annualProjection)}</p>
                        </div>
                    </div>

                    <div className="mb-6">
                        <DividendAIProjection dividends={dividends} assets={assets} />
                    </div>

                    {/* Monthly Chart */}
                    {dividends.length > 0 && (
                        <div className="mb-5">
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-3">Evolução Mensal</p>
                            <div className="h-[140px]">
                                <ResponsiveContainer width="100%" height={140}>
                                    <BarChart data={chartData}>
                                        <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                                        <YAxis hide />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                                            formatter={(value: any) => [formatCurrency(Number(value)), 'Dividendos']}
                                            labelStyle={{ color: '#9CA3AF' }}
                                        />
                                        <Bar dataKey="total" radius={[4, 4, 0, 0]} maxBarSize={24}>
                                            {chartData.map((entry, index) => (
                                                <Cell key={index} fill={entry.total > 0 ? '#10B981' : '#1F2937'} fillOpacity={entry.total > 0 ? 0.8 : 0.3} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {/* Per-Asset Breakdown */}
                    {assetDividends.length > 0 && (
                        <div className="mb-4">
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-3">Por Ativo</p>
                            <div className="space-y-2">
                                {assetDividends.map(({ asset, total, yieldOnCost }) => (
                                    <div key={asset.id} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02]">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-white">{asset.ticker}</span>
                                            <span className="text-xs text-gray-500">{asset.classe}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-accent-purple number-font">YoC: {yieldOnCost.toFixed(2)}%</span>
                                            <span className="text-sm font-bold text-accent-green number-font">{formatCurrency(total)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recent Dividends */}
                    <div>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-3">Últimos Recebidos</p>
                        <div className="space-y-1.5 max-h-[200px] overflow-y-auto custom-scrollbar">
                            {loading ? (
                                <div className="space-y-2">{[1, 2, 3].map(i => <div key={i} className="loading-shimmer h-12 rounded-lg" />)}</div>
                            ) : dividends.length === 0 ? (
                                <div className="text-center py-6">
                                    <Banknote className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                                    <p className="text-sm text-gray-400">Nenhum dividendo registrado</p>
                                </div>
                            ) : (
                                dividends.slice(0, 10).map(div => (
                                    <div key={div.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/[0.02] transition-colors group">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-white">{getTickerForAsset(div.asset_id)}</span>
                                            <span className="text-xs px-1.5 py-0.5 rounded bg-accent-green/10 text-accent-green">{getTypeLabel(div.type)}</span>
                                            <span className="text-xs text-gray-500">{new Date(div.payment_date + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-accent-green number-font">{formatCurrency(div.amount)}</span>
                                            <button onClick={() => handleDelete(div.id)}
                                                className="p-1 hover:bg-accent-red/10 rounded transition-colors opacity-0 group-hover:opacity-100">
                                                <Trash2 className="w-3 h-3 text-accent-red" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {typeof document !== 'undefined' && createPortal(modal, document.body)}
        </>
    )
}
