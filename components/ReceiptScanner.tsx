'use client'

import { useState, useRef } from 'react'
import { Upload, Camera, FileText, X, Check, Loader2, Eye } from 'lucide-react'
import { createTransaction } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { createPortal } from 'react-dom'

interface ExtractedData {
    description: string
    amount: string
    category: string
    type: 'income' | 'expense'
    date: string
}

const CATEGORIES = [
    'Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde',
    'Educação', 'Vestuário', 'Utilities', 'Supermercado', 'Outros'
]

export default function ReceiptScanner() {
    const [isOpen, setIsOpen] = useState(false)
    const [preview, setPreview] = useState<string | null>(null)
    const [extracting, setExtracting] = useState(false)
    const [saving, setSaving] = useState(false)
    const [extracted, setExtracted] = useState<ExtractedData>({
        description: '', amount: '', category: 'Outros', type: 'expense', date: new Date().toISOString().split('T')[0]
    })
    const [dragOver, setDragOver] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFile = async (file: File) => {
        if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
            toast.error('Envie uma imagem ou PDF')
            return
        }

        // Show preview
        if (file.type.startsWith('image/')) {
            const reader = new FileReader()
            reader.onload = (e) => setPreview(e.target?.result as string)
            reader.readAsDataURL(file)
        } else {
            setPreview(null)
        }

        // Try to extract with AI if available
        setExtracting(true)
        try {
            // Attempt basic extraction hints from filename
            const name = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
            setExtracted(prev => ({
                ...prev,
                description: name || 'Nota fiscal',
            }))
            // In the future, this would call an OCR API
            toast('Preencha os campos manualmente ou configure a OPENAI_API_KEY para extração automática', { icon: '📋', duration: 4000 })
        } catch (err) {
            console.error(err)
        } finally {
            setExtracting(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(false)
        const file = e.dataTransfer.files[0]
        if (file) handleFile(file)
    }

    const handleSave = async () => {
        if (!extracted.description || !extracted.amount) {
            toast.error('Preencha descrição e valor')
            return
        }
        setSaving(true)
        try {
            await createTransaction({
                description: extracted.description,
                amount: extracted.type === 'expense' ? -Math.abs(parseFloat(extracted.amount)) : parseFloat(extracted.amount),
                type: extracted.type,
                category: extracted.category,
                company_id: null,
                account_id: null,
            })
            toast.success('Transação registrada a partir da nota!')
            setIsOpen(false)
            setPreview(null)
            setExtracted({ description: '', amount: '', category: 'Outros', type: 'expense', date: new Date().toISOString().split('T')[0] })
        } catch (err) {
            toast.error('Erro ao salvar')
        } finally {
            setSaving(false)
        }
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-accent-green/20 to-accent-cyan/20 text-accent-green hover:from-accent-green/30 hover:to-accent-cyan/30 border border-accent-green/20 hover:border-accent-green/40 transition-all text-sm font-medium"
            >
                <Camera className="w-4 h-4" />
                Escanear Nota
            </button>

            <AnimatePresence>
                {isOpen && typeof window !== 'undefined' && createPortal(
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative w-full max-w-lg card-premium p-6 z-10 max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-green/20 to-accent-cyan/20 flex items-center justify-center border border-accent-green/10">
                                        <Camera className="w-4 h-4 text-accent-green" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Escanear Nota Fiscal</h3>
                                        <p className="text-xs text-gray-500">Upload de imagem ou PDF</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
                            </div>

                            {/* Drop Zone */}
                            <div
                                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all mb-5 ${dragOver ? 'border-accent-green bg-accent-green/5' : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'
                                    }`}
                            >
                                {preview ? (
                                    <div className="relative">
                                        <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setPreview(null) }}
                                            className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <Upload className="w-10 h-10 text-gray-500 mx-auto mb-3" />
                                        <p className="text-sm text-gray-300">Arraste uma imagem aqui ou clique para selecionar</p>
                                        <p className="text-xs text-gray-500 mt-1">JPG, PNG ou PDF</p>
                                    </>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*,application/pdf"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0]
                                        if (file) handleFile(file)
                                    }}
                                />
                            </div>

                            {/* Extracted / Manual Fields */}
                            <div className="space-y-3">
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Dados da Transação</p>

                                <input
                                    type="text"
                                    placeholder="Descrição"
                                    value={extracted.description}
                                    onChange={e => setExtracted({ ...extracted, description: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                                />

                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="number"
                                        placeholder="Valor (R$)"
                                        value={extracted.amount}
                                        onChange={e => setExtracted({ ...extracted, amount: e.target.value })}
                                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                                    />
                                    <select
                                        value={extracted.type}
                                        onChange={e => setExtracted({ ...extracted, type: e.target.value as 'income' | 'expense' })}
                                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                                    >
                                        <option value="expense">Despesa</option>
                                        <option value="income">Receita</option>
                                    </select>
                                </div>

                                <select
                                    value={extracted.category}
                                    onChange={e => setExtracted({ ...extracted, category: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                                >
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>

                                <button
                                    onClick={handleSave}
                                    disabled={saving || !extracted.description || !extracted.amount}
                                    className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                    {saving ? 'Salvando...' : 'Salvar como Transação'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>,
                    document.body
                )}
            </AnimatePresence>
        </>
    )
}
