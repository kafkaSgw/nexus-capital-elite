'use client'

import { useState } from 'react'
import { Download, FileDown, X, CheckCircle } from 'lucide-react'
import { getTransactions, getAssets, getCompanies, getAccounts } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

type ExportType = 'transactions' | 'assets' | 'companies' | 'accounts'

const EXPORT_OPTIONS: { type: ExportType; label: string; description: string }[] = [
    { type: 'transactions', label: 'Transações', description: 'Receitas e despesas' },
    { type: 'assets', label: 'Ativos / Investimentos', description: 'Carteira de investimentos' },
    { type: 'companies', label: 'Empresas', description: 'Empresas do portfólio' },
    { type: 'accounts', label: 'Contas', description: 'Contas bancárias' },
]

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('pt-BR')
}

function downloadCSV(filename: string, csvContent: string) {
    const BOM = '\uFEFF' // UTF-8 BOM for Excel compatibility
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(link.href)
}

export default function ExportData({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [loading, setLoading] = useState<ExportType | null>(null)
    const [exported, setExported] = useState<ExportType[]>([])

    const handleExport = async (type: ExportType) => {
        setLoading(type)
        try {
            let csv = ''

            switch (type) {
                case 'transactions': {
                    const data = await getTransactions()
                    csv = 'Data,Descrição,Tipo,Categoria,Valor\n'
                    data.forEach((t) => {
                        csv += `${formatDate(t.created_at)},"${t.description}",${t.type === 'income' ? 'Receita' : 'Despesa'},"${t.category}",${t.amount}\n`
                    })
                    downloadCSV('nexus_transacoes', csv)
                    break
                }
                case 'assets': {
                    const data = await getAssets()
                    csv = 'Ticker,Classe,Quantidade,Preço Médio,Preço Atual,Lucro/Prejuízo\n'
                    data.forEach((a) => {
                        const pnl = (a.preco_atual - a.preco_medio) * a.quantidade
                        csv += `${a.ticker},${a.classe},${a.quantidade},${a.preco_medio},${a.preco_atual},${pnl.toFixed(2)}\n`
                    })
                    downloadCSV('nexus_ativos', csv)
                    break
                }
                case 'companies': {
                    const data = await getCompanies()
                    csv = 'Nome,CNPJ,Descrição\n'
                    data.forEach((c) => {
                        csv += `"${c.name}","${c.cnpj || ''}","${c.description || ''}"\n`
                    })
                    downloadCSV('nexus_empresas', csv)
                    break
                }
                case 'accounts': {
                    const data = await getAccounts()
                    csv = 'Nome,Tipo,Banco,Saldo Inicial\n'
                    data.forEach((a) => {
                        csv += `"${a.name}",${a.type},"${a.bank || ''}",${a.initial_balance}\n`
                    })
                    downloadCSV('nexus_contas', csv)
                    break
                }
            }

            setExported((prev) => [...prev, type])
            toast.success(`${EXPORT_OPTIONS.find((o) => o.type === type)?.label} exportado!`)
        } catch (err) {
            console.error('Export error:', err)
            toast.error('Erro ao exportar dados')
        } finally {
            setLoading(null)
        }
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-md rounded-2xl overflow-hidden"
                    style={{
                        background: 'rgba(10, 16, 30, 0.98)',
                        backdropFilter: 'blur(24px)',
                        border: '1px solid rgba(51, 65, 85, 0.3)',
                        boxShadow: '0 16px 64px rgba(0, 0, 0, 0.6)',
                    }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                                <FileDown className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-white">Exportar Dados</h3>
                                <p className="text-xs text-gray-500">Formato CSV (Excel)</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/[0.06] transition-all">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Export Options */}
                    <div className="p-4 space-y-2">
                        {EXPORT_OPTIONS.map(({ type, label, description }) => {
                            const isExported = exported.includes(type)
                            const isLoading = loading === type

                            return (
                                <button
                                    key={type}
                                    onClick={() => handleExport(type)}
                                    disabled={isLoading}
                                    className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all text-left ${isExported
                                            ? 'bg-accent-green/10 border border-accent-green/20'
                                            : 'hover:bg-white/[0.04] border border-transparent'
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isExported ? 'bg-accent-green/20' : 'bg-white/[0.04]'
                                        }`}>
                                        {isLoading ? (
                                            <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                                        ) : isExported ? (
                                            <CheckCircle className="w-5 h-5 text-accent-green" />
                                        ) : (
                                            <Download className="w-5 h-5 text-gray-400" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium ${isExported ? 'text-accent-green' : 'text-white'}`}>{label}</p>
                                        <p className="text-xs text-gray-500">{description}</p>
                                    </div>
                                </button>
                            )
                        })}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-3 border-t border-white/[0.06] text-center">
                        <p className="text-xs text-gray-600">Os arquivos CSV podem ser abertos no Excel, Google Sheets, etc.</p>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
