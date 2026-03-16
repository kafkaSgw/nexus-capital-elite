'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, DollarSign, Percent, RefreshCw, Globe } from 'lucide-react'
import { motion } from 'framer-motion'

interface MacroData {
    selic: number | null
    cdi: number | null
    ipca: number | null
    usdBrl: number | null
    usdChange: number | null
    eurBrl: number | null
    eurChange: number | null
}

export default function MacroIndicators() {
    const [data, setData] = useState<MacroData>({
        selic: null, cdi: null, ipca: null, usdBrl: null, usdChange: null, eurBrl: null, eurChange: null
    })
    const [loading, setLoading] = useState(true)
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

    const fetchMacroData = async () => {
        setLoading(true)
        try {
            // Fetch SELIC, CDI, IPCA from BCB API
            const [selicRes, cdiRes, ipcaRes, cambioRes] = await Promise.allSettled([
                fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json').then(r => r.json()),
                fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.4389/dados/ultimos/1?formato=json').then(r => r.json()),
                fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados/ultimos/1?formato=json').then(r => r.json()),
                fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL').then(r => r.json()),
            ])

            const newData: MacroData = { selic: null, cdi: null, ipca: null, usdBrl: null, usdChange: null, eurBrl: null, eurChange: null }

            if (selicRes.status === 'fulfilled' && selicRes.value?.[0]) {
                newData.selic = parseFloat(selicRes.value[0].valor)
            }
            if (cdiRes.status === 'fulfilled' && cdiRes.value?.[0]) {
                newData.cdi = parseFloat(cdiRes.value[0].valor)
            }
            if (ipcaRes.status === 'fulfilled' && ipcaRes.value?.[0]) {
                newData.ipca = parseFloat(ipcaRes.value[0].valor)
            }
            if (cambioRes.status === 'fulfilled') {
                const cambio = cambioRes.value
                if (cambio?.USDBRL) {
                    newData.usdBrl = parseFloat(cambio.USDBRL.bid)
                    newData.usdChange = parseFloat(cambio.USDBRL.pctChange)
                }
                if (cambio?.EURBRL) {
                    newData.eurBrl = parseFloat(cambio.EURBRL.bid)
                    newData.eurChange = parseFloat(cambio.EURBRL.pctChange)
                }
            }

            setData(newData)
            setLastUpdate(new Date())
        } catch (err) {
            console.error('Erro ao buscar indicadores macroeconômicos:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMacroData()
        const interval = setInterval(fetchMacroData, 5 * 60 * 1000) // refresh every 5 min
        return () => clearInterval(interval)
    }, [])

    const indicators = [
        {
            label: 'SELIC',
            value: data.selic !== null ? `${data.selic.toFixed(2)}%` : '--',
            icon: Percent,
            color: 'from-blue-500/20 to-blue-600/20',
            textColor: 'text-blue-400',
            borderColor: 'border-blue-500/10',
            description: 'Taxa básica de juros',
        },
        {
            label: 'CDI',
            value: data.cdi !== null ? `${data.cdi.toFixed(2)}%` : '--',
            icon: TrendingUp,
            color: 'from-purple-500/20 to-purple-600/20',
            textColor: 'text-purple-400',
            borderColor: 'border-purple-500/10',
            description: 'Taxa interbancária',
        },
        {
            label: 'IPCA',
            value: data.ipca !== null ? `${data.ipca.toFixed(2)}%` : '--',
            icon: TrendingDown,
            color: 'from-orange-500/20 to-orange-600/20',
            textColor: 'text-orange-400',
            borderColor: 'border-orange-500/10',
            description: 'Inflação mensal',
        },
        {
            label: 'USD/BRL',
            value: data.usdBrl !== null ? `R$ ${data.usdBrl.toFixed(4)}` : '--',
            change: data.usdChange,
            icon: DollarSign,
            color: 'from-green-500/20 to-green-600/20',
            textColor: 'text-green-400',
            borderColor: 'border-green-500/10',
            description: 'Dólar americano',
        },
        {
            label: 'EUR/BRL',
            value: data.eurBrl !== null ? `R$ ${data.eurBrl.toFixed(4)}` : '--',
            change: data.eurChange,
            icon: Globe,
            color: 'from-cyan-500/20 to-cyan-600/20',
            textColor: 'text-cyan-400',
            borderColor: 'border-cyan-500/10',
            description: 'Euro',
        },
    ]

    return (
        <div className="card-premium overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-white/[0.04] flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-cyan/20 to-accent-indigo/20 flex items-center justify-center border border-accent-cyan/10">
                        <Globe className="w-4 h-4 text-accent-cyan" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-white">Indicadores Macroeconômicos</h3>
                        <p className="text-xs text-gray-500">
                            {lastUpdate ? `Atualizado ${lastUpdate.toLocaleTimeString('pt-BR')}` : 'Carregando...'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={fetchMacroData}
                    disabled={loading}
                    className="p-2 rounded-lg hover:bg-white/[0.06] text-gray-400 hover:text-white transition-colors"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="p-4 sm:p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {indicators.map((ind, i) => (
                    <motion.div
                        key={ind.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-all group"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${ind.color} flex items-center justify-center border ${ind.borderColor}`}>
                                <ind.icon className={`w-3.5 h-3.5 ${ind.textColor}`} />
                            </div>
                            <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">{ind.label}</span>
                        </div>
                        <p className={`text-sm sm:text-base font-bold number-font ${loading ? 'animate-pulse text-gray-600' : 'text-white'}`}>
                            {loading ? '...' : ind.value}
                        </p>
                        {'change' in ind && ind.change !== undefined && ind.change !== null && (
                            <div className={`flex items-center gap-0.5 mt-1 text-[10px] font-medium ${ind.change >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                                {ind.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                {Math.abs(ind.change).toFixed(2)}%
                            </div>
                        )}
                        <p className="text-[9px] text-gray-600 mt-1 hidden sm:block">{ind.description}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
