'use client'

import { useState } from 'react'
import { Share2, Link, Copy, Check, Eye, EyeOff, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { createPortal } from 'react-dom'

interface ShareSection {
    id: string
    label: string
    enabled: boolean
}

export default function ShareDashboard() {
    const [isOpen, setIsOpen] = useState(false)
    const [copied, setCopied] = useState(false)
    const [sections, setSections] = useState<ShareSection[]>([
        { id: 'summary', label: 'Resumo Financeiro', enabled: true },
        { id: 'investments', label: 'Investimentos', enabled: true },
        { id: 'goals', label: 'Metas', enabled: true },
        { id: 'categories', label: 'Categorias de Gasto', enabled: false },
        { id: 'monthly', label: 'Comparativo Mensal', enabled: false },
    ])

    const toggleSection = (id: string) => {
        setSections(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s))
    }

    const shareLink = typeof window !== 'undefined'
        ? `${window.location.origin}/shared/${btoa(Date.now().toString()).slice(0, 12)}`
        : ''

    const handleCopy = () => {
        navigator.clipboard.writeText(shareLink)
        setCopied(true)
        toast.success('Link copiado!')
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-accent-cyan/20 to-accent-indigo/20 text-accent-cyan hover:from-accent-cyan/30 hover:to-accent-indigo/30 border border-accent-cyan/20 hover:border-accent-cyan/40 transition-all text-sm font-medium"
            >
                <Share2 className="w-4 h-4" />
                Compartilhar
            </button>

            <AnimatePresence>
                {isOpen && typeof window !== 'undefined' && createPortal(
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-lg card-premium p-6 z-10">
                            <div className="flex justify-between items-center mb-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-cyan/20 to-accent-indigo/20 flex items-center justify-center border border-accent-cyan/10">
                                        <Share2 className="w-4 h-4 text-accent-cyan" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Compartilhar Dashboard</h3>
                                        <p className="text-xs text-gray-500">Gere um link público read-only</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
                            </div>

                            {/* Section Toggles */}
                            <div className="space-y-2 mb-5">
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Seções para compartilhar</p>
                                {sections.map(sec => (
                                    <button
                                        key={sec.id}
                                        onClick={() => toggleSection(sec.id)}
                                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${sec.enabled ? 'bg-primary/10 border border-primary/20' : 'bg-white/[0.02] border border-white/[0.04]'}`}
                                    >
                                        <span className={`text-sm ${sec.enabled ? 'text-white' : 'text-gray-500'}`}>{sec.label}</span>
                                        {sec.enabled ? <Eye className="w-4 h-4 text-primary" /> : <EyeOff className="w-4 h-4 text-gray-600" />}
                                    </button>
                                ))}
                            </div>

                            {/* Generated Link */}
                            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                                <p className="text-xs text-gray-500 mb-2">Link de compartilhamento</p>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 flex items-center gap-2 bg-dark-bg rounded-lg px-3 py-2.5 border border-white/[0.06]">
                                        <Link className="w-4 h-4 text-gray-500 shrink-0" />
                                        <span className="text-sm text-gray-300 truncate font-mono">{shareLink}</span>
                                    </div>
                                    <button
                                        onClick={handleCopy}
                                        className="shrink-0 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors flex items-center gap-1.5"
                                    >
                                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        {copied ? 'Copiado!' : 'Copiar'}
                                    </button>
                                </div>
                            </div>

                            <p className="text-[10px] text-gray-600 mt-3 text-center">
                                ⚠️ Qualquer pessoa com este link poderá ver as seções selecionadas (somente leitura)
                            </p>
                        </motion.div>
                    </motion.div>,
                    document.body
                )}
            </AnimatePresence>
        </>
    )
}
