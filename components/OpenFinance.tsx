'use client'

import { useState } from 'react'
import { Building2, Link2, RefreshCw, CheckCircle, AlertCircle, ExternalLink, Shield, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { createPortal } from 'react-dom'

interface BankConnection {
    id: string
    name: string
    logo: string
    status: 'connected' | 'syncing' | 'error' | 'disconnected'
    lastSync?: string
    accountCount?: number
}

const AVAILABLE_BANKS: { name: string; logo: string; color: string }[] = [
    { name: 'Nubank', logo: '💜', color: 'from-purple-600/20 to-purple-800/20' },
    { name: 'Itaú', logo: '🟠', color: 'from-orange-600/20 to-orange-800/20' },
    { name: 'Bradesco', logo: '🔴', color: 'from-red-600/20 to-red-800/20' },
    { name: 'Banco do Brasil', logo: '🟡', color: 'from-yellow-600/20 to-yellow-800/20' },
    { name: 'Santander', logo: '🔴', color: 'from-red-500/20 to-red-700/20' },
    { name: 'Inter', logo: '🟠', color: 'from-orange-500/20 to-orange-700/20' },
    { name: 'C6 Bank', logo: '⬛', color: 'from-gray-600/20 to-gray-800/20' },
    { name: 'BTG Pactual', logo: '🔵', color: 'from-blue-600/20 to-blue-800/20' },
    { name: 'XP Investimentos', logo: '⚫', color: 'from-gray-700/20 to-gray-900/20' },
    { name: 'Clear', logo: '🟢', color: 'from-green-600/20 to-green-800/20' },
]

export default function OpenFinance() {
    const [isOpen, setIsOpen] = useState(false)
    const [connections, setConnections] = useState<BankConnection[]>([])
    const [connecting, setConnecting] = useState<string | null>(null)

    const handleConnect = async (bank: typeof AVAILABLE_BANKS[0]) => {
        setConnecting(bank.name)
        // Simulate connection flow
        await new Promise(r => setTimeout(r, 2000))

        const newConnection: BankConnection = {
            id: Date.now().toString(),
            name: bank.name,
            logo: bank.logo,
            status: 'connected',
            lastSync: new Date().toLocaleString('pt-BR'),
            accountCount: Math.floor(Math.random() * 3) + 1,
        }

        setConnections(prev => [...prev, newConnection])
        setConnecting(null)
        toast.success(`${bank.name} conectado com sucesso!`)
    }

    const handleDisconnect = (id: string) => {
        setConnections(prev => prev.filter(c => c.id !== id))
        toast.success('Banco desconectado')
    }

    const connectedBanks = connections.map(c => c.name)

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-accent-purple/20 to-accent-pink/20 text-accent-purple hover:from-accent-purple/30 hover:to-accent-pink/30 border border-accent-purple/20 hover:border-accent-purple/40 transition-all text-sm font-medium"
            >
                <Link2 className="w-4 h-4" />
                Open Finance
            </button>

            <AnimatePresence>
                {isOpen && typeof window !== 'undefined' && createPortal(
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="relative w-full max-w-lg card-premium p-6 z-10 max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-purple/20 to-accent-pink/20 flex items-center justify-center border border-accent-purple/10">
                                        <Link2 className="w-4 h-4 text-accent-purple" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Open Finance</h3>
                                        <p className="text-xs text-gray-500">Conecte suas contas bancárias</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
                            </div>

                            {/* Security badge */}
                            <div className="flex items-center gap-2 p-3 rounded-xl bg-accent-green/5 border border-accent-green/10 mb-5">
                                <Shield className="w-4 h-4 text-accent-green shrink-0" />
                                <p className="text-[10px] text-accent-green">Conexão segura via Open Finance Brasil. Seus dados são criptografados end-to-end.</p>
                            </div>

                            {/* Connected Banks */}
                            {connections.length > 0 && (
                                <div className="mb-5">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">Bancos Conectados</p>
                                    <div className="space-y-2">
                                        {connections.map(conn => (
                                            <div key={conn.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xl">{conn.logo}</span>
                                                    <div>
                                                        <p className="text-sm font-medium text-white">{conn.name}</p>
                                                        <p className="text-[10px] text-gray-500">{conn.accountCount} conta(s) • Sync: {conn.lastSync}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle className="w-4 h-4 text-accent-green" />
                                                    <button onClick={() => handleDisconnect(conn.id)} className="text-gray-500 hover:text-accent-red text-xs">
                                                        Desconectar
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Available Banks */}
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">Bancos Disponíveis</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {AVAILABLE_BANKS.filter(b => !connectedBanks.includes(b.name)).map(bank => (
                                        <button
                                            key={bank.name}
                                            onClick={() => handleConnect(bank)}
                                            disabled={connecting === bank.name}
                                            className={`flex items-center gap-2 p-3 rounded-xl bg-gradient-to-br ${bank.color} border border-white/[0.06] hover:border-white/[0.12] transition-all text-left ${connecting === bank.name ? 'opacity-50' : ''}`}
                                        >
                                            <span className="text-lg">{bank.logo}</span>
                                            <div className="min-w-0">
                                                <p className="text-xs font-medium text-white truncate">{bank.name}</p>
                                                {connecting === bank.name ? (
                                                    <p className="text-[9px] text-gray-400 flex items-center gap-1"><RefreshCw className="w-2.5 h-2.5 animate-spin" /> Conectando...</p>
                                                ) : (
                                                    <p className="text-[9px] text-gray-500">Clique para conectar</p>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <p className="text-[9px] text-gray-600 mt-4 text-center">
                                Powered by Open Finance Brasil • Regulado pelo Banco Central
                            </p>
                        </motion.div>
                    </motion.div>,
                    document.body
                )}
            </AnimatePresence>
        </>
    )
}
