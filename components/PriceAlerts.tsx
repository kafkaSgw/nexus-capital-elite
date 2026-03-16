'use client'

import { useState, useEffect } from 'react'
import { Bell, BellRing, Plus, Trash2, X, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'react-hot-toast'

interface PriceAlert {
    id: string
    ticker: string
    condition: 'above' | 'below'
    targetPrice: number
    active: boolean
    triggered: boolean
    lastTriggeredAt?: string
}

interface Asset {
    id: string
    ticker: string
    preco_atual: number
}

interface PriceAlertsProps {
    assets: Asset[]
}

const STORAGE_KEY = 'nexus-price-alerts'

export default function PriceAlerts({ assets }: PriceAlertsProps) {
    const [alerts, setAlerts] = useState<PriceAlert[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [formData, setFormData] = useState({ ticker: '', condition: 'above', targetPrice: '' })

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) setAlerts(JSON.parse(saved))
    }, [])

    const save = (data: PriceAlert[]) => {
        setAlerts(data)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    }

    // Check alerts whenever assets change (prices update)
    useEffect(() => {
        if (alerts.length === 0 || assets.length === 0) return

        let hasUpdates = false
        const updatedAlerts = alerts.map(alert => {
            if (!alert.active) return alert

            const asset = assets.find(a => a.ticker === alert.ticker)
            if (!asset) return alert

            const price = asset.preco_atual
            let triggered = false

            if (alert.condition === 'above' && price >= alert.targetPrice) triggered = true
            if (alert.condition === 'below' && price <= alert.targetPrice) triggered = true

            // Trigger logic: only if not already triggered or if manually reset? 
            // For now, let's just mark as triggered and notify once. User must reset or delete.
            if (triggered && !alert.triggered) {
                toast.custom((t) => (
                    <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-dark-card shadow-corporate-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-primary`}>
                        <div className="flex-1 w-0 p-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0 pt-0.5">
                                    <BellRing className="h-10 w-10 text-primary" />
                                </div>
                                <div className="ml-3 flex-1">
                                    <p className="text-sm font-medium text-white">Alerta de Preço: {alert.ticker}</p>
                                    <p className="mt-1 text-sm text-gray-400">
                                        Atingiu o alvo de {formatCurrency(alert.targetPrice)} (Atual: {formatCurrency(price)})
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex border-l border-dark-border">
                            <button
                                onClick={() => toast.dismiss(t.id)}
                                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-primary hover:text-primary-light focus:outline-none"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                ), { duration: 5000 })

                hasUpdates = true
                return { ...alert, triggered: true, lastTriggeredAt: new Date().toISOString() }
            }

            return alert
        })

        if (hasUpdates) save(updatedAlerts)
    }, [assets]) // Depend only on assets (prices) updating

    const handleAddAlert = () => {
        if (!formData.ticker || !formData.targetPrice) return

        const newAlert: PriceAlert = {
            id: Date.now().toString(),
            ticker: formData.ticker,
            condition: formData.condition as 'above' | 'below',
            targetPrice: parseFloat(formData.targetPrice),
            active: true,
            triggered: false
        }

        save([...alerts, newAlert])
        setIsModalOpen(false)
        setFormData({ ticker: '', condition: 'above', targetPrice: '' })
    }

    const handleDelete = (id: string) => save(alerts.filter(a => a.id !== id))

    const handleToggle = (id: string) => {
        save(alerts.map(a => a.id === id ? { ...a, active: !a.active, triggered: false } : a))
    }

    return (
        <div className="card-premium h-full">
            <div className="p-4 border-b border-dark-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-primary" />
                    <h3 className="font-bold text-white">Alertas de Preço</h3>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="p-1.5 bg-primary/10 hover:bg-primary/20 rounded-lg text-primary transition-colors"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            <div className="p-4 space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                {alerts.length === 0 ? (
                    <div className="text-center py-6">
                        <BellRing className="w-8 h-8 text-gray-700 mx-auto mb-2 opacity-50" />
                        <p className="text-sm text-gray-500">Nenhum alerta configurado</p>
                    </div>
                ) : (
                    alerts.map(alert => {
                        const asset = assets.find(a => a.ticker === alert.ticker)
                        const currentPrice = asset?.preco_atual || 0
                        const pctDiff = currentPrice > 0 ? ((currentPrice - alert.targetPrice) / alert.targetPrice) * 100 : 0

                        return (
                            <div
                                key={alert.id}
                                className={`group p-3 rounded-xl border transition-all ${alert.triggered
                                        ? 'bg-primary/5 border-primary/50'
                                        : !alert.active
                                            ? 'bg-dark-bg border-transparent opacity-60'
                                            : 'bg-dark-card border-dark-border hover:border-gray-600'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-white">{alert.ticker}</span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-medium ${alert.condition === 'above' ? 'bg-accent-green/10 text-accent-green' : 'bg-accent-red/10 text-accent-red'
                                            }`}>
                                            {alert.condition === 'above' ? 'Acima de' : 'Abaixo de'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleToggle(alert.id)} className="p-1 hover:bg-dark-hover rounded" title={alert.active ? "Pausar" : "Ativar"}>
                                            {alert.active ? <BellRing className="w-3.5 h-3.5 text-primary" /> : <Bell className="w-3.5 h-3.5 text-gray-500" />}
                                        </button>
                                        <button onClick={() => handleDelete(alert.id)} className="p-1 hover:bg-red-900/30 rounded">
                                            <Trash2 className="w-3.5 h-3.5 text-gray-500 hover:text-red-500" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-end justify-between">
                                    <div>
                                        <div className="text-xs text-gray-400">Alvo</div>
                                        <div className="font-medium text-white">{formatCurrency(alert.targetPrice)}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-gray-400">Atual</div>
                                        <div className={`font-medium ${currentPrice === 0 ? 'text-gray-500' :
                                                (alert.condition === 'above' && currentPrice >= alert.targetPrice) || (alert.condition === 'below' && currentPrice <= alert.targetPrice)
                                                    ? 'text-primary'
                                                    : 'text-white'
                                            }`}>
                                            {formatCurrency(currentPrice)}
                                        </div>
                                    </div>
                                </div>

                                {/* Progress bar to target */}
                                {currentPrice > 0 && !alert.triggered && alert.active && (
                                    <div className="mt-2 h-1 bg-dark-bg rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${alert.condition === 'above' ? 'bg-accent-green' : 'bg-accent-red'}`}
                                            style={{ width: `${Math.min(Math.max((currentPrice / alert.targetPrice) * 100, 5), 100)}%` }} // Rough visual approximation
                                        />
                                    </div>
                                )}

                                {alert.triggered && (
                                    <div className="mt-2 flex items-center gap-1 text-xs text-primary animate-pulse">
                                        <AlertTriangle className="w-3 h-3" />
                                        <span>Alvo atingido!</span>
                                    </div>
                                )}
                            </div>
                        )
                    })
                )}
            </div>

            {/* Add Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="relative bg-dark-card rounded-2xl w-full max-w-sm p-6 border border-dark-border shadow-2xl animate-slide-up">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-white">Novo Alerta</h3>
                            <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">Ativo (Ticker)</label>
                                <select
                                    className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-white outline-none focus:border-primary"
                                    value={formData.ticker}
                                    onChange={e => setFormData({ ...formData, ticker: e.target.value })}
                                >
                                    <option value="">Selecione...</option>
                                    {assets.map(a => (
                                        <option key={a.id} value={a.ticker}>{a.ticker} - {formatCurrency(a.preco_atual)}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs text-gray-400 block mb-1">Condição</label>
                                <div className="flex bg-dark-bg rounded-xl p-1 border border-dark-border">
                                    <button
                                        onClick={() => setFormData({ ...formData, condition: 'above' })}
                                        className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${formData.condition === 'above' ? 'bg-accent-green/20 text-accent-green' : 'text-gray-500 hover:text-white'}`}
                                    >
                                        Acima de
                                    </button>
                                    <button
                                        onClick={() => setFormData({ ...formData, condition: 'below' })}
                                        className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${formData.condition === 'below' ? 'bg-accent-red/20 text-accent-red' : 'text-gray-500 hover:text-white'}`}
                                    >
                                        Abaixo de
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-gray-400 block mb-1">Preço Alvo</label>
                                <input
                                    type="number"
                                    className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-white outline-none focus:border-primary"
                                    placeholder="0.00"
                                    value={formData.targetPrice}
                                    onChange={e => setFormData({ ...formData, targetPrice: e.target.value })}
                                    step="0.01"
                                />
                            </div>

                            <button
                                onClick={handleAddAlert}
                                disabled={!formData.ticker || !formData.targetPrice}
                                className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Criar Alerta
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
